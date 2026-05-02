import { ItemInterface } from '@/lib/interfaces/item.interface';

// Flat-list inventory: each entry is one item placed at (x, y). The 2-D grid
// is computed from the entries' rectangles (item width x height starting at
// the entry's x/y). This eliminates the fragile "anchor cell + non-anchor
// string cells" representation that produced phantom inventory items.

export interface InventoryEntry {
  // Either a populated Item, an ObjectId, or a string id reference.
  item: any;
  x: number;
  y: number;
}

export const INVENTORY_ROWS = 8;
export const INVENTORY_COLS = 5;

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
): boolean {
  const { w, h } = dimsOf(item);
  if (x < 0 || y < 0) return false;
  if (x + w > INVENTORY_ROWS || y + h > INVENTORY_COLS) return false;

  return entries.every((entry) => {
    if (excludeItemId && entryItemId(entry) === String(excludeItemId)) return true;
    const { w: ew, h: eh } = dimsOf(entry.item);
    return !rectanglesOverlap(x, y, w, h, entry.x, entry.y, ew, eh);
  });
}

export function findFreePosition(
  entries: InventoryEntry[],
  item: ItemInterface | any,
  excludeItemId?: string,
): { x: number; y: number } | null {
  for (let x = 0; x < INVENTORY_ROWS; x++) {
    for (let y = 0; y < INVENTORY_COLS; y++) {
      if (canPlaceItem(entries, item, x, y, excludeItemId)) {
        return { x, y };
      }
    }
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
): InventoryEntry[] {
  const next = removeItem(entries, String(item._id ?? item.id ?? ''));
  next.push({ item: item._id ?? item, x, y });
  return next;
}

// Build a 2-D grid of cell occupants (full Item / null) for rendering.
// Anchor cells get the populated item, all other cells covered by an
// item's rectangle get the same item so the renderer can grey them out
// or count them as occupied. The drag handle is only attached to anchors.
export interface GridCell {
  item: ItemInterface | null;
  isAnchor: boolean;
}

export function buildGrid(entries: InventoryEntry[]): GridCell[][] {
  const grid: GridCell[][] = Array.from({ length: INVENTORY_ROWS }, () =>
    Array.from({ length: INVENTORY_COLS }, () => ({ item: null, isAnchor: false }))
  );
  for (const entry of entries) {
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
        out.push({ item: cell._id ?? cell, x, y });
      }
    }
  }
  return out;
}
