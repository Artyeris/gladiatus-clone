// Aggregates a mercenary's rolled stats with bonuses from equipped
// items. Mirrors the player's combatBreakdown but only walks the
// fields mercenaries actually use, plus the dungeon-specific ones
// (threat, hardening, healing, critical healing) so role AIs can
// read them.

import { mercenaryPower as mercenaryPowerFromStats } from '@/constants/mercenaries';

interface EquippedItem {
  damage?: number[];
  armor?: number;
  strength?: number;
  endurance?: number;
  agility?: number;
  dexterity?: number;
  intelligence?: number;
  charisma?: number;
  damageBonus?: number;
  health?: number;
  blockChanceBonus?: number;
  critChanceBonus?: number;
  // Dungeon-only.
  threat?: number;
  hardeningValue?: number;
  healing?: number;
  criticalHealingValue?: number;
}

export interface MercBreakdown {
  // Total stats after items.
  strength: number;
  dexterity: number;
  agility: number;
  endurance: number;
  charisma: number;
  intelligence: number;
  // Combat-derived.
  armor: number;
  damageMin: number;
  damageMax: number;
  health: number;
  // Dungeon stats.
  threat: number;
  hardening: number;
  healing: number;
  criticalHealing: number;
  // Derived power score.
  power: number;
}

type MercLite = {
  level: number;
  quality: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  type: 'tank' | 'healer' | 'damage';
  stats: any;
  equipment?: Record<string, EquippedItem | null>;
};

const EQUIPMENT_SLOTS = [
  'head', 'chest', 'legs', 'gloves', 'cloak', 'boots',
  'mainHand', 'offHand', 'necklace', 'ring1', 'ring2',
] as const;

export function mercenaryBreakdown(merc: MercLite): MercBreakdown {
  const base = merc.stats ?? {};
  let strength    = base.strength ?? 0;
  let dexterity   = base.dexterity ?? 0;
  let agility     = base.agility ?? 0;
  let endurance   = base.endurance ?? 0;
  let charisma    = base.charisma ?? 0;
  let intelligence = base.intelligence ?? 0;
  let armor       = base.armor ?? 0;
  let damageMin   = base.damageMin ?? 0;
  let damageMax   = base.damageMax ?? 0;
  let health      = base.health ?? 0;
  // Dungeon stats start at the rolled values too -- healers carry a
  // base healing value from their stat seed (Medicus pattern).
  let threat          = 0;
  let hardening       = 0;
  let healing         = base.healing ?? 0;
  let criticalHealing = 0;

  const eq = merc.equipment ?? {};
  for (const slot of EQUIPMENT_SLOTS) {
    const it = eq[slot] as EquippedItem | null | undefined;
    if (!it) continue;
    strength    += it.strength    ?? 0;
    dexterity   += it.dexterity   ?? 0;
    agility     += it.agility     ?? 0;
    endurance   += it.endurance   ?? 0;
    charisma    += it.charisma    ?? 0;
    intelligence += it.intelligence ?? 0;
    armor       += it.armor       ?? 0;
    health      += it.health      ?? 0;
    threat          += it.threat               ?? 0;
    hardening       += it.hardeningValue       ?? 0;
    healing         += it.healing              ?? 0;
    criticalHealing += it.criticalHealingValue ?? 0;
    if (slot === 'mainHand' && Array.isArray(it.damage) && it.damage.length === 2) {
      damageMin += it.damage[0];
      damageMax += it.damage[1];
    }
    damageMin += it.damageBonus ?? 0;
    damageMax += it.damageBonus ?? 0;
  }

  // Recompute power with augmented stats. Reuses the same role-weighted
  // formula from constants/mercenaries so the vendor preview and the
  // post-equip total stay on the same scale.
  const power = mercenaryPowerFromStats({
    level: merc.level,
    quality: merc.quality,
    type: merc.type,
    stats: {
      health, strength, dexterity, agility, endurance, charisma,
      intelligence, armor, damageMin, damageMax, healing,
    } as any,
  });

  return {
    strength, dexterity, agility, endurance, charisma, intelligence,
    armor, damageMin, damageMax, health,
    threat, hardening, healing, criticalHealing,
    power,
  };
}
