import { ItemInterface, ItemQuality } from '@/lib/interfaces/item.interface';

// Color used for item names in tooltips, matching the Gladiatus quality wheel.
export const QUALITY_COLOR: Record<ItemQuality, string> = {
  common: '#dddddd',
  common_plus: '#ffffff',
  green: '#3ca33c',
  green_plus: '#5dd45d',
  blue: '#3a7bd6',
  blue_plus: '#6aa6ff',
  purple: '#a157c8',
  purple_plus: '#c47ee8',
  orange: '#e08a30',
  orange_plus: '#ffae5a',
  red: '#d63a3a',
};

export const QUALITY_LABEL: Record<ItemQuality, string> = {
  common: 'Common',
  common_plus: 'Common+',
  green: 'Green',
  green_plus: 'Green+',
  blue: 'Blue',
  blue_plus: 'Blue+',
  purple: 'Purple',
  purple_plus: 'Purple+',
  orange: 'Orange',
  orange_plus: 'Orange+',
  red: 'Red',
};

// "Sharp Short Dagger of the Bear" – combine prefix + base + suffix.
export function fullItemName(item: Pick<ItemInterface, 'name' | 'prefix' | 'suffix'>): string {
  return [item.prefix, item.name, item.suffix].filter(Boolean).join(' ');
}

const SCALED_STAT_KEYS = [
  'strength', 'endurance', 'agility', 'dexterity', 'intelligence', 'charisma',
] as const;

/**
 * Returns a level-scaled copy of a catalog template. The returned object can
 * be passed straight to Item.create so a level-120 character can wear a
 * Plate Helmet that matches their combat tier instead of a literal level-1
 * one. The base item identity (name, image, type, slot, dimensions) is
 * preserved; only numbers move.
 */
export function scaleItemTemplate(template: any, targetLevel: number): any {
  const baseLevel = Math.max(1, template.level ?? 1);
  const tgt = Math.max(1, Math.floor(targetLevel));
  if (tgt <= baseLevel) {
    return { ...template, level: tgt };
  }

  const factor = tgt / baseLevel;
  const scaled: any = { ...template, level: tgt };

  if (Array.isArray(template.damage) && template.damage.length === 2) {
    scaled.damage = [
      Math.max(1, Math.round(template.damage[0] * factor)),
      Math.max(1, Math.round(template.damage[1] * factor)),
    ];
  }
  if (typeof template.armor === 'number') {
    scaled.armor = Math.max(0, Math.round(template.armor * factor));
  }
  for (const key of SCALED_STAT_KEYS) {
    if (typeof template[key] === 'number') {
      scaled[key] = Math.max(0, Math.round(template[key] * factor));
    }
  }
  if (typeof template.power === 'number') {
    scaled.power = Math.max(1, Math.round(template.power * factor));
  }
  if (typeof template.sellPrice === 'number') {
    // Slightly super-linear so high-level loot is meaningfully more valuable.
    scaled.sellPrice = Math.max(1, Math.round(template.sellPrice * Math.pow(factor, 1.4)));
  }
  if (typeof template.durabilityMax === 'number') {
    scaled.durabilityMax = Math.max(1, Math.round(template.durabilityMax * Math.pow(factor, 0.5)));
    scaled.durability = scaled.durabilityMax;
  }
  if (typeof template.conditioningMax === 'number') {
    scaled.conditioningMax = Math.max(1, Math.round(template.conditioningMax * Math.pow(factor, 0.5)));
    scaled.conditioning = scaled.conditioningMax;
  }

  return scaled;
}
