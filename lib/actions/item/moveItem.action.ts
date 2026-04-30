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

function clearInventoryItem(inventory: any[][], itemId: string) {
  for (let i = 0; i < inventory.length; i++) {
    for (let j = 0; j < inventory[i].length; j++) {
      const cell = inventory[i][j];
      if (!cell) continue;
      if (typeof cell === 'object' && cell._id?.toString() === itemId) {
        inventory[i][j] = null;
      } else if (typeof cell === 'string' && cell === itemId) {
        inventory[i][j] = null;
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

    const inventory: any[][] = character.inventory;
    const equipment = character.equipment ?? {};

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
      clearInventoryItem(inventory, itemId);
      const inserted = insertItem({ inventory, item, x: target.x, y: target.y });
      if (!inserted) {
        insertItem({ inventory, item, x: source.x, y: source.y });
        return { error: { message: 'Target cell occupied' } };
      }
      character.inventory = inserted;
    } else if (source.kind === 'inventory' && target.kind === 'equipment') {
      // Equip. Clear from inventory, swap any existing equipped item back to source position.
      clearInventoryItem(inventory, itemId);
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
      character.markModified('equipment');
    } else if (source.kind === 'equipment' && target.kind === 'inventory') {
      if (!canInsertItem({ inventory, item, x: target.x, y: target.y })) {
        return { error: { message: 'Target cell occupied' } };
      }
      equipment[source.slot] = null;
      insertItem({ inventory, item, x: target.x, y: target.y });
      character.inventory = inventory;
      character.equipment = equipment;
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
