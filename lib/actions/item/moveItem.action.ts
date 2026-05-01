'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { canInsertItem } from '@/lib/utils/inventory/canInsertItem';
import { insertItem } from '@/lib/utils/inventory/insertItem';
import { cleanupCharacterRefs } from '@/lib/utils/inventory/cleanup';
import { EQUIPMENT_SLOTS, EquipmentSlot, slotAcceptsItem } from '@/lib/utils/equipment';

type Location =
  | { kind: 'inventory'; x: number; y: number }
  | { kind: 'equipment'; slot: EquipmentSlot };

interface MoveItemParams {
  itemId: string;
  source: Location;
  target: Location;
}

const isValidSlot = (s: string): s is EquipmentSlot =>
  (EQUIPMENT_SLOTS as readonly string[]).includes(s);

function clearInventoryItem(inventory: any[][], item: any) {
  const idMongo = item._id?.toString();
  const idHuman = item.id;

  for (let i = 0; i < inventory.length; i++) {
    for (let j = 0; j < inventory[i].length; j++) {
      const cell = inventory[i][j];
      if (!cell) continue;

      // Anchor cell can be: populated Item ({_id}), raw ObjectId, or its string form.
      if (typeof cell === 'object') {
        const cellId = cell._id?.toString?.() ?? cell.toString?.();
        if (cellId === idMongo) {
          inventory[i][j] = null;
          continue;
        }
      } else if (typeof cell === 'string') {
        // Non-anchor cells store item.id; anchor cells may also serialize to a string ObjectId.
        if (cell === idHuman || cell === idMongo) {
          inventory[i][j] = null;
        }
      }
    }
  }
}

function findFreeCell(
  inventory: any[][],
  item: any
): { x: number; y: number } | null {
  for (let i = 0; i < inventory.length; i++) {
    for (let j = 0; j < inventory[i].length; j++) {
      if (canInsertItem({ inventory, item, x: i, y: j })) {
        return { x: i, y: j };
      }
    }
  }
  return null;
}

export async function moveItemAction({ itemId, source, target }: MoveItemParams) {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return { error: { message: 'Not authenticated' } };

  try {
    const userId = extractUserId(token.value);
    await connectToDB();

    const user = await User.findById(userId).populate({
      path: 'character',
      model: Character,
    });
    if (!user || !user.character) return { error: { message: 'Character not found' } };

    const character = user.character as any;
    const item = await Item.findById(itemId);
    if (!item) return { error: { message: 'Item not found' } };

    // Deep-copy so Mongoose Mixed change tracking sees a brand new value when
    // we reassign at the end. Reading character.inventory directly returns
    // the tracked array which doesn't always notice nested mutations.
    const inventory: any[][] = (character.inventory ?? []).map((row: any[]) =>
      row.map((cell) => (cell == null ? null : cell))
    );
    const equipment = { ...(character.equipment ?? {}) } as Record<string, any>;

    // Sweep dead references before doing the move so phantom cells from
    // earlier failed mutations can't make canInsertItem report false-occupied.
    await cleanupCharacterRefs({ inventory, equipment, Item });

    // Validate source matches reality.
    if (source.kind === 'equipment') {
      if (!isValidSlot(source.slot)) return { error: { message: 'Invalid source slot' } };
      const equipped = equipment[source.slot];
      const equippedId = equipped && (equipped._id?.toString() ?? equipped.toString());
      if (equippedId !== itemId) {
        return { error: { message: 'Item not in source slot' } };
      }
    }

    // Validate target slot type matches.
    if (target.kind === 'equipment') {
      if (!isValidSlot(target.slot)) return { error: { message: 'Invalid target slot' } };
      if (!slotAcceptsItem(target.slot, item)) {
        return { error: { message: `${item.name} does not fit that slot` } };
      }
    }

    // Apply the move.
    if (source.kind === 'inventory' && target.kind === 'inventory') {
      clearInventoryItem(inventory, item);
      const inserted = insertItem({ inventory, item, x: target.x, y: target.y });
      if (!inserted) {
        insertItem({ inventory, item, x: source.x, y: source.y });
        return { error: { message: 'Target cell occupied' } };
      }
      character.inventory = inserted;
      character.markModified('inventory');
    } else if (source.kind === 'inventory' && target.kind === 'equipment') {
      clearInventoryItem(inventory, item);
      const previouslyEquipped = equipment[target.slot];
      equipment[target.slot] = item._id;
      if (previouslyEquipped) {
        const prevId = previouslyEquipped._id ?? previouslyEquipped;
        const prevItem = await Item.findById(prevId);
        if (prevItem) {
          let placed = false;
          if (canInsertItem({ inventory, item: prevItem, x: source.x, y: source.y })) {
            insertItem({ inventory, item: prevItem, x: source.x, y: source.y });
            placed = true;
          } else {
            const free = findFreeCell(inventory, prevItem);
            if (free) {
              insertItem({ inventory, item: prevItem, x: free.x, y: free.y });
              placed = true;
            }
          }
          if (!placed) return { error: { message: 'No room to swap items' } };
        }
      }
      character.inventory = inventory;
      character.equipment = equipment;
      character.markModified('inventory');
      character.markModified('equipment');
    } else if (source.kind === 'equipment' && target.kind === 'inventory') {
      // Try the requested cell, then fall back to any free cell so a stale
      // partial state doesn't make unequip impossible.
      let placeAt: { x: number; y: number } | null = null;
      if (canInsertItem({ inventory, item, x: target.x, y: target.y })) {
        placeAt = { x: target.x, y: target.y };
      } else {
        const free = findFreeCell(inventory, item);
        if (free) placeAt = free;
      }
      if (!placeAt) return { error: { message: 'No room in inventory' } };

      equipment[source.slot] = null;
      insertItem({ inventory, item, x: placeAt.x, y: placeAt.y });
      character.inventory = inventory;
      character.equipment = equipment;
      character.markModified('inventory');
      character.markModified('equipment');
    } else if (source.kind === 'equipment' && target.kind === 'equipment') {
      const otherEquipped = equipment[target.slot];
      equipment[source.slot] = otherEquipped ?? null;
      equipment[target.slot] = item._id;
      character.equipment = equipment;
      character.markModified('equipment');
    }

    await character.save();
    revalidatePath('/game/overview');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - Failed to move item - ${error}`);
    return { error: { message: error?.message || 'Failed to move item' } };
  }
}
