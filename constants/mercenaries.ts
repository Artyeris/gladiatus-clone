// Mercenary templates available from each country's vendor. Each
// template is a stat archetype -- the actual owned mercenary is rolled
// from the template at purchase time and gets a level + quality.

export type MercRole = 'tank' | 'healer' | 'damage';
export type MercQuality = 'green' | 'blue' | 'purple' | 'orange' | 'red';

export interface MercTemplate {
  id: string;
  name: string;
  type: MercRole;
  country: 'italy' | 'africa' | 'germania' | 'britannia';
  // Base price multiplier per level. Final vendor price scales with
  // the rolled level and quality.
  basePrice: number;
  // Per-level stat seed (before quality multiplier). Mercenaries
  // mirror the player: damage is derived from strength + weapon and
  // armour is sourced entirely from equipped pieces, so neither lives
  // in the base seed.
  baseStats: {
    health: number;
    strength: number;
    dexterity: number;
    agility: number;
    endurance: number;
    charisma: number;
    intelligence: number;
    healing: number; // healer-only base; comes through to combat
  };
}

// Italy vendor pool.
export const ITALY_MERCENARIES: MercTemplate[] = [
  {
    id: 'samnit',
    name: 'Samnit',
    type: 'damage',
    country: 'italy',
    basePrice: 80,
    baseStats: {
      health: 60, strength: 8, dexterity: 16, agility: 8,
      endurance: 5, charisma: 4, intelligence: 4, healing: 0,
    },
  },
  {
    id: 'murmillo',
    name: 'Murmillo',
    type: 'damage',
    country: 'italy',
    basePrice: 75,
    baseStats: {
      health: 70, strength: 8, dexterity: 14, agility: 12,
      endurance: 6, charisma: 7, intelligence: 4, healing: 0,
    },
  },
  {
    id: 'thracian',
    name: 'Thracian',
    type: 'damage',
    country: 'italy',
    basePrice: 60,
    baseStats: {
      health: 65, strength: 8, dexterity: 12, agility: 12,
      endurance: 5, charisma: 5, intelligence: 4, healing: 0,
    },
  },
  {
    id: 'hoplomachus',
    name: 'Hoplomachus',
    type: 'tank',
    country: 'italy',
    basePrice: 100,
    baseStats: {
      health: 120, strength: 12, dexterity: 5, agility: 5,
      endurance: 12, charisma: 12, intelligence: 4, healing: 0,
    },
  },
  {
    id: 'medicus',
    name: 'Medicus',
    type: 'healer',
    country: 'italy',
    basePrice: 110,
    baseStats: {
      health: 90, strength: 5, dexterity: 6, agility: 8,
      endurance: 10, charisma: 8, intelligence: 14, healing: 14,
    },
  },
];

// Quality stat multiplier and rarity weights at the vendor.
export const QUALITY_MULTIPLIER: Record<MercQuality, number> = {
  green:  1.00,
  blue:   1.10,
  purple: 1.25,
  orange: 1.45,
  red:    1.70,
};

// Vendor roll table -- cumulative weights. Tight at the top, very
// rare at the bottom (matches the fansite "almost never" for red).
const QUALITY_ROLL: { quality: MercQuality; upTo: number }[] = [
  { quality: 'green',  upTo: 0.60 },
  { quality: 'blue',   upTo: 0.92 },
  { quality: 'purple', upTo: 0.985 },
  { quality: 'orange', upTo: 0.999 },
  { quality: 'red',    upTo: 1.00 },
];

export function rollMercenaryQuality(): MercQuality {
  const r = Math.random();
  for (const row of QUALITY_ROLL) {
    if (r <= row.upTo) return row.quality;
  }
  return 'green';
}

// Rolled stat block for a level-N quality-Q mercenary. Armour and
// damage are intentionally absent -- they're derived at combat time
// from equipped gear (armour) and strength + weapon (damage), the
// same way the player handles them.
export function rollMercenaryStats(
  template: MercTemplate,
  level: number,
  quality: MercQuality,
) {
  const m = QUALITY_MULTIPLIER[quality];
  const lvl = Math.max(1, level);
  const s = template.baseStats;
  return {
    health:       Math.round(s.health * lvl * m),
    strength:     Math.round(s.strength * lvl * m),
    dexterity:    Math.round(s.dexterity * lvl * m),
    agility:      Math.round(s.agility * lvl * m),
    endurance:    Math.round(s.endurance * lvl * m),
    charisma:     Math.round(s.charisma * lvl * m),
    intelligence: Math.round(s.intelligence * lvl * m),
    healing:      Math.round(s.healing * lvl * m),
  };
}

// Vendor price for a rolled mercenary -- base * level * quality bump.
const PRICE_QUALITY_BUMP: Record<MercQuality, number> = {
  green:  1.0,
  blue:   1.5,
  purple: 2.5,
  orange: 5.0,
  red:    10.0,
};

export function mercenaryVendorPrice(
  template: MercTemplate,
  level: number,
  quality: MercQuality,
): number {
  return Math.max(
    template.basePrice,
    Math.round(template.basePrice * Math.max(1, level) * PRICE_QUALITY_BUMP[quality]),
  );
}

// Simple combat power summary for matchmaking dungeon difficulty.
// `stats` here is the rolled stat block plus any equipment bonuses
// that have already been folded in by mercenaryBreakdown -- which is
// why armour / damage live on `stats` even though they're not in the
// base seed.
export function mercenaryPower(merc: {
  level: number;
  quality: MercQuality;
  type: MercRole;
  stats: any;
}): number {
  const s = merc.stats ?? {};
  const avgDmg = ((s.damageMin ?? 0) + (s.damageMax ?? 0)) / 2;
  const offence = avgDmg * 2 + (s.strength ?? 0) * 1.2 + (s.dexterity ?? 0) * 1.4;
  const defence = (s.armor ?? 0) * 0.05 + (s.health ?? 0) * 0.05 + (s.endurance ?? 0) * 0.8;
  const support = merc.type === 'healer' ? (s.healing ?? 0) * 3 + (s.intelligence ?? 0) * 0.6 : 0;
  const roleBoost =
    merc.type === 'tank' ? defence * 0.4 :
    merc.type === 'healer' ? support * 0.6 :
    offence * 0.3;
  return Math.round(offence + defence + support + roleBoost);
}
