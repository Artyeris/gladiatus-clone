export type ItemQuality =
  | 'common'
  | 'common_plus'
  | 'green'
  | 'green_plus'
  | 'blue'
  | 'blue_plus'
  | 'purple'
  | 'purple_plus'
  | 'orange'
  | 'orange_plus'
  | 'red';

export interface ItemInterface {
  _id: string,
  id: string,
  name: string,
  image: string,
  type?: 'head' | 'chest' | 'gloves' | 'cloak' | 'legs' | 'boots' | 'mainHand' | 'offHand' | 'necklace' | 'ring',
  quality?: ItemQuality,
  prefix?: string,
  suffix?: string,
  damage?: number[],
  armor?: number,
  strength?: number,
  endurance?: number,
  agility?: number,
  dexterity?: number,
  charisma?: number,
  intelligence?: number,
  power: number,
  probability: number,
  level: number,
  width: number,
  height: number,
  durability?: number,
  durabilityMax?: number,
  conditioning?: number,
  conditioningMax?: number,
  sellPrice?: number,

  // Affix-rolled bonuses (see constants/affixes).
  damageBonus?: number,
  health?: number,
  strengthPct?: number,
  dexterityPct?: number,
  agilityPct?: number,
  endurancePct?: number,
  charismaPct?: number,
  intelligencePct?: number,
  blockChanceBonus?: number,
  critChanceBonus?: number,
  // Dungeon-only, ignored by current combat.
  threat?: number,
  hardeningValue?: number,
  healing?: number,
  criticalHealingValue?: number,
}
