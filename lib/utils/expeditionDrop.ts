import { items as ITEM_CATALOG } from '@/constants/items';
import {
  AffixDef,
  PREFIXES,
  SUFFIXES,
  TOP_PREFIXES,
  TOP_SUFFIXES,
  mergeAffixes,
  pickAffix,
} from '@/constants/affixes';
import { ItemQuality } from '@/lib/interfaces/item.interface';

export type ExpeditionEnemyType = 'normal_1' | 'normal_2' | 'normal_3' | 'boss';
export type SearchMode = 'none' | 'quick' | 'thorough';

// Map an enemy's slot in its region (0..2) to a drop class. Bosses are
// detected separately via the enemy's `boss` flag.
export function enemyTypeFromIndex(index: number): ExpeditionEnemyType {
  if (index <= 0) return 'normal_1';
  if (index === 1) return 'normal_2';
  return 'normal_3';
}

// Per-slot base item drop chance (mid-point of the ranges in the design
// spec). Bosses are generous but never a guaranteed drop.
const DROP_CHANCE: Record<ExpeditionEnemyType, number> = {
  normal_1: 0.33,
  normal_2: 0.38,
  normal_3: 0.43,
  boss:     0.45,
};

export function getItemDropChance(enemyType: ExpeditionEnemyType, bonuses = 0) {
  return Math.min(DROP_CHANCE[enemyType] + bonuses, 0.90);
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

// Cumulative quality tables per enemy slot (design spec). A boss never
// drops Green -- if it drops at all, it's at least Blue.
const QUALITY_TABLE: Record<ExpeditionEnemyType, { quality: ItemQuality; upTo: number }[]> = {
  normal_1: [
    { quality: 'green',  upTo: 0.75 },
    { quality: 'blue',   upTo: 0.99 },
    { quality: 'purple', upTo: 1.00 },
  ],
  normal_2: [
    { quality: 'green',  upTo: 0.68 },
    { quality: 'blue',   upTo: 0.97 },
    { quality: 'purple', upTo: 1.00 },
  ],
  normal_3: [
    { quality: 'green',  upTo: 0.60 },
    { quality: 'blue',   upTo: 0.95 },
    { quality: 'purple', upTo: 0.998 },
    { quality: 'orange', upTo: 1.00 },
  ],
  boss: [
    { quality: 'blue',   upTo: 0.88 },
    { quality: 'purple', upTo: 0.975 },
    { quality: 'orange', upTo: 0.9995 },
    { quality: 'red',    upTo: 1.00 },
  ],
};

export function rollQuality(enemyType: ExpeditionEnemyType, qualityBonus = 0): ItemQuality {
  // qualityBonus nudges the roll toward the rarer end of the table.
  const r = Math.min(1, Math.max(0, Math.random() - qualityBonus));
  const table = QUALITY_TABLE[enemyType];
  for (const row of table) {
    if (r <= row.upTo) return row.quality;
  }
  return table[table.length - 1].quality;
}

// Drops are scaled to the *enemy* the player just killed -- a level-4
// gladiator who topples the Bear (lvl 8-10) should walk away with
// level-8-ish loot, not level-4 trash. Mirrors the "Item Level Drop"
// column on the gamerz-bg enemy sheets (e.g. Bear: 8-11, Wolf: 4-9).
export function rollItemLevel(enemyLevel: number, enemyType: ExpeditionEnemyType): number {
  const minOffset = enemyType === 'boss' ? -1 : -2;
  const maxOffset = enemyType === 'boss' ?  2 :  1;
  const offset = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
  return Math.max(1, enemyLevel + offset);
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
  prefix?: AffixDef | null;
  suffix?: AffixDef | null;
}

// Quality tier ordering used to decide whether a drop is "good enough"
// to roll a prefix / suffix. Common stays plain; green/green+ may get a
// suffix; blue+ also gets a prefix; orange+ pulls from the top tables.
const QUALITY_RANK: Record<ItemQuality, number> = {
  common: 0, common_plus: 1,
  green: 2, green_plus: 3,
  blue: 4, blue_plus: 5,
  purple: 6, purple_plus: 7,
  orange: 8, orange_plus: 9,
  red: 10,
};

function rollAffixesForQuality(quality: ItemQuality, itemLevel: number) {
  const rank = QUALITY_RANK[quality] ?? 0;
  let prefix: AffixDef | null = null;
  let suffix: AffixDef | null = null;
  // Suffix at green and above.
  if (rank >= QUALITY_RANK.green) {
    const pool = rank >= QUALITY_RANK.orange ? TOP_SUFFIXES : SUFFIXES;
    suffix = pickAffix(pool, itemLevel) ?? pickAffix(SUFFIXES, itemLevel);
  }
  // Prefix at blue and above.
  if (rank >= QUALITY_RANK.blue) {
    const pool = rank >= QUALITY_RANK.orange ? TOP_PREFIXES : PREFIXES;
    prefix = pickAffix(pool, itemLevel) ?? pickAffix(PREFIXES, itemLevel);
  }
  return { prefix, suffix };
}

export function rollExpeditionDrop(params: {
  enemyLevel: number;
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
  const itemLevel = rollItemLevel(params.enemyLevel, params.enemyType);
  const category = rollWeighted(CATEGORY_TABLE);
  const baseTemplate = pickItemTemplate(category, itemLevel);
  if (!baseTemplate) return { dropped: false, reason: 'No template' };

  const { prefix, suffix } = rollAffixesForQuality(quality, itemLevel);
  const template = mergeAffixes(baseTemplate, prefix, suffix);

  return { dropped: true, template, itemLevel, quality, category, prefix, suffix };
}
