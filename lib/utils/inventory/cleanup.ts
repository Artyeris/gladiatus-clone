import type { Model } from 'mongoose';

// Walk the inventory grid and the equipment map, dropping references to
// items that no longer exist. Returns whether anything changed so callers
// can decide to persist or revalidate.
export async function cleanupCharacterRefs({
  inventory,
  equipment,
  Item,
}: {
  inventory: any[][];
  equipment: Record<string, any>;
  Item: Model<any>;
}): Promise<boolean> {
  let changed = false;
  const liveItemIds = new Set<string>();

  // Pass 1: validate anchor cells (objects) and equipment slots.
  for (let i = 0; i < inventory.length; i++) {
    for (let j = 0; j < inventory[i].length; j++) {
      const cell = inventory[i][j];
      if (!cell) continue;

      if (typeof cell === 'object') {
        // Already populated full doc.
        if ('name' in cell && cell.id) {
          liveItemIds.add(cell.id);
          continue;
        }
        // Raw ObjectId reference.
        const item = await Item.findById(cell);
        if (item) {
          if (item.id) liveItemIds.add(item.id);
        } else {
          inventory[i][j] = null;
          changed = true;
        }
      }
    }
  }

  // Pass 2: drop non-anchor string cells whose owning item id is not alive.
  for (let i = 0; i < inventory.length; i++) {
    for (let j = 0; j < inventory[i].length; j++) {
      const cell = inventory[i][j];
      if (typeof cell === 'string' && !liveItemIds.has(cell)) {
        inventory[i][j] = null;
        changed = true;
      }
    }
  }

  // Equipment slots.
  for (const slot of Object.keys(equipment)) {
    const ref = equipment[slot];
    if (!ref) continue;
    if (typeof ref === 'object' && 'name' in ref) continue;
    const item = await Item.findById(ref);
    if (!item) {
      equipment[slot] = null;
      changed = true;
    }
  }

  return changed;
}
