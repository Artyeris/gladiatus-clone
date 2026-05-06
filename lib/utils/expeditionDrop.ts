import { items as ITEM_CATALOG } from '@/constants/items';
import { ItemQuality } from '@/lib/interfaces/item.interface';

export type ExpeditionEnemyType = 'normal_1' | 'normal_2' | 'normal_3' | 'boss';
export type SearchMode = 'none' | 'quick' | 'thorough';

// Map an enemy's slot in the region (id 0..3) to its drop class.
export function enemyTypeFromIndex(index: number): ExpeditionEnemyType {
  if (index === 0) return 'normal_1';
  if (index === 1) return 'normal_2';
  if (index === 2) return 'normal_3';
  return 'boss';
}

export function getItemDropChance(enemyType: ExpeditionEnemyType, bonuses = 0) {
  const base = enemyType === 'boss' ? 0.18 : 0.10;
  return Math.min(base + bonuses, 0.80);
}

export function getSearchModifier(mode: SearchMode) {
  switch (mode) {
    case 'quick':
      return { cooldownMultiplier: 1.15, dropChanceBonus: 0.05, qualityBonus: 0.01, failChance: 0 };
    case 'thorough':
      return { cooldownMultiplier: 1.40, dropChanceBonus: 0.10, qualityBonus: 0.05, failChance: 0.10 };
    default:
      return { cooldownMultiplier: 1.00, dropChanceBonus: 0,    qualityBonus: 0,    failChance: 0 };
  }
}

// Quality roll. Per the spec: normals can hit Green/Blue/Purple,
// bosses minimally Blue with rare Orange/Red.
export function rollQuality(enemyType: ExpeditionEnemyType, qualityBonus = 0): ItemQuality {
  const r = Math.random() - qualityBonus;
  if (enemyType === 'boss') {
    if (r < 0.86)  return 'blue';
    if (r < 0.97)  return 'purple';
    if (r < 0.998) return 'orange';
    return 'red';
  }
  if (r < 0.6858)            return 'green';
  if (r < 0.6858 + 0.2740)   return 'blue';
  return 'purple';
}

export function rollItemLevel(playerLevel: number, enemyType: ExpeditionEnemyType): number {
  const minOffset = enemyType === 'boss' ? -2 : -4;
  const maxOffset = enemyType === 'boss' ?  3 :  1;
  const offset = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
  return Math.max(1, playerLevel + offset);
}

const CATEGORY_TABLE: { value: string; weight: number }[] = [
  { value: 'mainHand', weight: 12 }, // weapon
  { value: 'offHand',  weight: 10 }, // shield
  { value: 'chest',    weight: 12 }, // armor
  { value: 'head',     weight: 10 }, // helmet
  { value: 'gloves',   weight: 10 },
  { value: 'boots',    weight: 10 },
  { value: 'legs',     weight: 8  },
  { value: 'cloak',    weight: 4  },
  { value: 'ring',     weight: 8  },
  { value: 'necklace', weight: 8  },
];

function rollWeighted<T extends string>(table: { value: T; weight: number }[]): T {
  const total = table.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const row of table) {
    roll -= row.weight;
    if (roll <= 0) return row.value;
  }
  return table[table.length - 1].value;
}

// Pick a base template from the catalog matching the rolled category and
// roughly matching the rolled level. Falls back to any category match if
// the level filter empties the pool.
export function pickItemTemplate(category: string, itemLevel: number): any | null {
  const all = Object.values(ITEM_CATALOG).filter((it: any) => it.type === category);
  if (all.length === 0) return null;
  const inRange = all.filter((it: any) => Math.abs(it.level - itemLevel) <= 3);
  const pool = inRange.length > 0 ? inRange : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

export interface ExpeditionDropResult {
  dropped: boolean;
  reason?: string;
  template?: any;
  itemLevel?: number;
  quality?: ItemQuality;
  category?: string;
}

export function rollExpeditionDrop(params: {
  playerLevel: number;
  enemyType: ExpeditionEnemyType;
  searchMode?: SearchMode;
  eventDropBonus?: number;
  gearDropBonus?: number;
}): ExpeditionDropResult {
  const search = getSearchModifier(params.searchMode ?? 'none');
  if (Math.random() < search.failChance) {
    return { dropped: false, reason: 'Search failed' };
  }
  const dropChance =
    getItemDropChance(params.enemyType) +
    search.dropChanceBonus +
    (params.eventDropBonus ?? 0) +
    (params.gearDropBonus  ?? 0);

  if (Math.random() > dropChance) {
    return { dropped: false, reason: 'No drop' };
  }

  const quality = rollQuality(params.enemyType, search.qualityBonus);
  const itemLevel = rollItemLevel(params.playerLevel, params.enemyType);
  const category = rollWeighted(CATEGORY_TABLE);
  const template = pickItemTemplate(category, itemLevel);
  if (!template) return { dropped: false, reason: 'No template' };

  return { dropped: true, template, itemLevel, quality, category };
}
