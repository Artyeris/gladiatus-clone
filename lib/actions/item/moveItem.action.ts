'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import {
  InventoryEntry,
  canPlaceItem,
  findEntry,
  findFreePosition,
  migrateLegacyInventory,
  placeItem,
  removeItem,
} from '@/lib/utils/inventory/grid';
import { EQUIPMENT_SLOTS, EquipmentSlot, slotAcceptsItem } from '@/lib/utils/equipment';

type Location =
  | { kind: 'inventory'; x: number; y: number; bag?: number }
  | { kind: 'equipment'; slot: EquipmentSlot };

interface MoveItemParams {
  itemId: string;
  source: Location;
  target: Location;
}

const isValidSlot = (s: string): s is EquipmentSlot =>
  (EQUIPMENT_SLOTS as readonly string[]).includes(s);

function loadInventoryEntries(character: any): InventoryEntry[] {
  const inv = character.inventory;
  // Defensive migration in case an older 2-D doc slipped through getUser.
  const migrated = migrateLegacyInventory(inv);
  if (migrated) return migrated;
  if (!Array.isArray(inv)) return [];
  return inv.map((e: any) => ({
    item: e?.item,
    x: e?.x ?? 0,
    y: e?.y ?? 0,
    bag: e?.bag ?? 0,
  }));
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

    let entries = loadInventoryEntries(character);
    const equipment = { ...(character.equipment ?? {}) } as Record<string, any>;

    // Validate source matches reality.
    if (source.kind === 'equipment') {
      if (!isValidSlot(source.slot)) return { error: { message: 'Invalid source slot' } };
      const equipped = equipment[source.slot];
      const equippedId = equipped && (equipped._id?.toString() ?? equipped.toString());
      if (equippedId !== itemId) {
        return { error: { message: 'Item not in source slot' } };
      }
    } else {
      // Source is inventory; the item must actually live in entries.
      if (!findEntry(entries, itemId)) {
        return { error: { message: 'Item not in inventory' } };
      }
    }

    if (target.kind === 'equipment') {
      if (!isValidSlot(target.slot)) return { error: { message: 'Invalid target slot' } };
      if (!slotAcceptsItem(target.slot, item)) {
        return { error: { message: `${item.name} does not fit that slot` } };
      }
    }

    const sourceBag = source.kind === 'inventory' ? (source.bag ?? 0) : 0;
    const targetBag = target.kind === 'inventory' ? (target.bag ?? 0) : 0;

    // Apply the move.
    if (source.kind === 'inventory' && target.kind === 'inventory') {
      if (!canPlaceItem(entries, item, target.x, target.y, itemId, targetBag)) {
        const free = findFreePosition(entries, item, itemId, targetBag);
        if (!free) return { error: { message: 'Target cell occupied' } };
        target = { kind: 'inventory', x: free.x, y: free.y, bag: targetBag };
      }
      entries = placeItem(entries, item, target.x, target.y, targetBag);
    } else if (source.kind === 'inventory' && target.kind === 'equipment') {
      const previously = equipment[target.slot];
      entries = removeItem(entries, itemId);
      equipment[target.slot] = item._id;

      if (previously) {
        const prevId = previously._id ?? previously;
        const prevItem = await Item.findById(prevId);
        if (prevItem) {
          let placeAt = canPlaceItem(entries, prevItem, source.x, source.y, undefined, sourceBag)
            ? { x: source.x, y: source.y, bag: sourceBag }
            : (() => {
                const spot = findFreePosition(entries, prevItem, undefined, sourceBag);
                return spot ? { ...spot, bag: sourceBag } : null;
              })();
          if (!placeAt) return { error: { message: 'No room to swap items' } };
          entries = placeItem(entries, prevItem, placeAt.x, placeAt.y, placeAt.bag);
        }
      }
    } else if (source.kind === 'equipment' && target.kind === 'inventory') {
      let placeAt = canPlaceItem(entries, item, target.x, target.y, undefined, targetBag)
        ? { x: target.x, y: target.y }
        : findFreePosition(entries, item, undefined, targetBag);
      if (!placeAt) return { error: { message: 'No room in inventory' } };

      equipment[source.slot] = null;
      entries = placeItem(entries, item, placeAt.x, placeAt.y, targetBag);
    } else if (source.kind === 'equipment' && target.kind === 'equipment') {
      const otherEquipped = equipment[target.slot];
      equipment[source.slot] = otherEquipped ?? null;
      equipment[target.slot] = item._id;
    }

    character.set('inventory', entries.map((e) => ({
      item: (e.item && typeof e.item === 'object' && '_id' in e.item) ? e.item._id : e.item,
      x: e.x,
      y: e.y,
      bag: e.bag ?? 0,
    })));
    character.set('equipment', equipment);
    character.markModified('inventory');
    character.markModified('equipment');

    await character.save();
    revalidatePath('/game/overview');
    revalidatePath('/game/market');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - Failed to move item - ${error}`);
    return { error: { message: error?.message || 'Failed to move item' } };
  }
}
