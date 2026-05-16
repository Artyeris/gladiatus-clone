import { ItemInterface } from '@/lib/interfaces/item.interface';

// Flat-list inventory: each entry is one item placed at (x, y) inside
// one of BAG_COUNT bag pages. The 2-D grid is computed from the entries'
// rectangles (item width x height starting at the entry's x/y). This
// eliminates the fragile "anchor cell + non-anchor string cells"
// representation that produced phantom inventory items, and matches the
// original Gladiatus's I-VIII tabbed bag UI.

export interface InventoryEntry {
  // Either a populated Item, an ObjectId, or a string id reference.
  item: any;
  x: number;
  y: number;
  // Which tab (0..BAG_COUNT-1) this entry lives in. Older entries
  // missing this field are treated as bag 0 everywhere.
  bag?: number;
}

// Wider than the previous 5x8 to mirror the source game's 7x6 bag page.
export const INVENTORY_COLS = 7;
export const INVENTORY_ROWS = 6;
export const BAG_COUNT = 8;

const bagOf = (entry: InventoryEntry): number => entry.bag ?? 0;

function dimsOf(item: any): { w: number; h: number } {
  return {
    w: Math.max(1, item?.width ?? 1),
    h: Math.max(1, item?.height ?? 1),
  };
}

function entryItemId(entry: InventoryEntry): string | null {
  const it = entry.item;
  if (!it) return null;
  if (typeof it === 'string') return it;
  if (typeof it === 'object') {
    if (it._id) return String(it._id);
    if (typeof it.toString === 'function') return it.toString();
  }
  return null;
}

function rectanglesOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function findEntry(
  entries: InventoryEntry[],
  itemId: string,
): InventoryEntry | undefined {
  return entries.find((e) => entryItemId(e) === String(itemId));
}

export function canPlaceItem(
  entries: InventoryEntry[],
  item: ItemInterface | any,
  x: number,
  y: number,
  // Optional id of an entry to ignore (used when moving the same item).
  excludeItemId?: string,
  bag: number = 0,
): boolean {
  const { w, h } = dimsOf(item);
  if (x < 0 || y < 0) return false;
  // x indexes rows, y indexes columns (the rendering pairs them with
  // gridTemplateColumns=COLS); enforce the matching bounds.
  if (x + w > INVENTORY_ROWS || y + h > INVENTORY_COLS) return false;

  return entries.every((entry) => {
    if (bagOf(entry) !== bag) return true;
    if (excludeItemId && entryItemId(entry) === String(excludeItemId)) return true;
    const { w: ew, h: eh } = dimsOf(entry.item);
    return !rectanglesOverlap(x, y, w, h, entry.x, entry.y, ew, eh);
  });
}

export function findFreePosition(
  entries: InventoryEntry[],
  item: ItemInterface | any,
  excludeItemId?: string,
  bag: number = 0,
): { x: number; y: number } | null {
  for (let x = 0; x < INVENTORY_ROWS; x++) {
    for (let y = 0; y < INVENTORY_COLS; y++) {
      if (canPlaceItem(entries, item, x, y, excludeItemId, bag)) {
        return { x, y };
      }
    }
  }
  return null;
}

// Same as findFreePosition, but walks every bag from 0..BAG_COUNT-1 and
// returns the first match, so a new drop / unequip with no preferred
// bag still lands somewhere even if bag 0 is full.
export function findFreePositionAnyBag(
  entries: InventoryEntry[],
  item: ItemInterface | any,
  excludeItemId?: string,
): { x: number; y: number; bag: number } | null {
  for (let bag = 0; bag < BAG_COUNT; bag++) {
    const spot = findFreePosition(entries, item, excludeItemId, bag);
    if (spot) return { ...spot, bag };
  }
  return null;
}

export function removeItem(entries: InventoryEntry[], itemId: string): InventoryEntry[] {
  return entries.filter((e) => entryItemId(e) !== String(itemId));
}

export function placeItem(
  entries: InventoryEntry[],
  item: ItemInterface | any,
  x: number,
  y: number,
  bag: number = 0,
): InventoryEntry[] {
  const next = removeItem(entries, String(item._id ?? item.id ?? ''));
  next.push({ item: item._id ?? item, x, y, bag });
  return next;
}

// Build a 2-D grid of cell occupants (full Item / null) for rendering
// a SINGLE bag. Anchor cells get the populated item, all other cells
// covered by an item's rectangle get the same item so the renderer can
// grey them out or count them as occupied. The drag handle is only
// attached to anchors.
export interface GridCell {
  item: ItemInterface | null;
  isAnchor: boolean;
}

export function buildGrid(entries: InventoryEntry[], bag: number = 0): GridCell[][] {
  const grid: GridCell[][] = Array.from({ length: INVENTORY_ROWS }, () =>
    Array.from({ length: INVENTORY_COLS }, () => ({ item: null, isAnchor: false }))
  );
  for (const entry of entries) {
    if (bagOf(entry) !== bag) continue;
    const item = (entry.item && typeof entry.item === 'object' && 'name' in entry.item)
      ? (entry.item as ItemInterface)
      : null;
    if (!item) continue;
    const { w, h } = dimsOf(item);
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const r = entry.x + dx;
        const c = entry.y + dy;
        if (r >= 0 && r < INVENTORY_ROWS && c >= 0 && c < INVENTORY_COLS) {
          grid[r][c] = { item, isAnchor: dx === 0 && dy === 0 };
        }
      }
    }
  }
  return grid;
}

// Cell counts per bag, used to badge tab buttons with "•" or counts.
export function bagFillCounts(entries: InventoryEntry[]): number[] {
  const counts = new Array(BAG_COUNT).fill(0);
  for (const entry of entries) {
    const b = bagOf(entry);
    if (b >= 0 && b < BAG_COUNT) counts[b] += 1;
  }
  return counts;
}

// Migrate the legacy 2-D Mixed grid into the flat list. Anchor cells
// (objects/ObjectIds) become entries; string non-anchor cells are dropped
// because they were just markers for multi-cell items.
export function migrateLegacyInventory(legacy: any): InventoryEntry[] | null {
  if (!Array.isArray(legacy) || legacy.length === 0) return null;
  if (!Array.isArray(legacy[0])) return null; // already migrated
  const out: InventoryEntry[] = [];
  for (let x = 0; x < legacy.length; x++) {
    const row = legacy[x];
    if (!Array.isArray(row)) continue;
    for (let y = 0; y < row.length; y++) {
      const cell = row[y];
      if (!cell) continue;
      if (typeof cell === 'string') continue; // legacy non-anchor marker
      if (typeof cell === 'object') {
        out.push({ item: cell._id ?? cell, x, y, bag: 0 });
      }
    }
  }
  return out;
}
