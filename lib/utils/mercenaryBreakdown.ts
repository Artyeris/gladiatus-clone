// Aggregates a mercenary's rolled stats with bonuses from equipped
// items. Mirrors the player's combatBreakdown -- damage flows from
// strength + weapon (no intrinsic damage seed), armour from equipped
// pieces only, and every regular stat reports its "from items" share
// so the tooltips on the panel can show the breakdown.

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

type StatKey = 'strength' | 'dexterity' | 'agility' | 'endurance' | 'charisma' | 'intelligence';

export interface MercStatSplit {
  base: number;
  fromItems: number;
  total: number;
}

export interface MercBreakdown {
  // Per-stat splits with base / items attribution.
  stats: Record<StatKey, MercStatSplit>;
  // Combat-derived (mirrors the player's combatBreakdown shape).
  armor: number;
  damageMin: number;
  damageMax: number;
  weaponMin: number;
  weaponMax: number;
  hasWeapon: boolean;
  strDamageBonus: number;
  // Health: base from health-seed, plus +health from items.
  health: number;
  healthBase: number;
  healthFromItems: number;
  // Dungeon stats.
  threat: number;
  hardening: number;
  healing: number;
  healingBase: number;
  healingFromItems: number;
  criticalHealing: number;
  // Power score.
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

const STAT_KEYS: StatKey[] = [
  'strength', 'dexterity', 'agility', 'endurance', 'charisma', 'intelligence',
];

const UNARMED_DAMAGE_MIN = 1;
const unarmedMax = (str: number) => Math.max(2, Math.floor(str * 0.15));

export function mercenaryBreakdown(merc: MercLite): MercBreakdown {
  const base = merc.stats ?? {};

  // Stat sums: start with the rolled base, add up item contributions.
  const stats = {} as Record<StatKey, MercStatSplit>;
  for (const k of STAT_KEYS) {
    stats[k] = { base: base[k] ?? 0, fromItems: 0, total: base[k] ?? 0 };
  }

  let armor = 0;
  let weaponMin = 0;
  let weaponMax = 0;
  let flatDamageAdd = 0;
  let healthFromItems = 0;
  let healingFromItems = 0;
  let threat = 0;
  let hardening = 0;
  let criticalHealing = 0;
  let hasWeapon = false;

  const eq = merc.equipment ?? {};
  for (const slot of EQUIPMENT_SLOTS) {
    const it = eq[slot];
    if (!it) continue;
    for (const k of STAT_KEYS) {
      const v = (it as any)[k] ?? 0;
      if (v) {
        stats[k].fromItems += v;
        stats[k].total += v;
      }
    }
    armor            += it.armor ?? 0;
    healthFromItems  += it.health ?? 0;
    flatDamageAdd    += it.damageBonus ?? 0;
    healingFromItems += it.healing ?? 0;
    threat           += it.threat ?? 0;
    hardening        += it.hardeningValue ?? 0;
    criticalHealing  += it.criticalHealingValue ?? 0;
    if (slot === 'mainHand' && Array.isArray(it.damage) && it.damage.length === 2) {
      weaponMin += it.damage[0];
      weaponMax += it.damage[1];
      hasWeapon = true;
    }
  }

  // Damage: weapon (or unarmed) + flat affix add + strength bonus when
  // there's no intrinsic weapon damage (same rule as the player).
  const strTotal = stats.strength.total;
  const strBonus = hasWeapon ? 0 : Math.floor(strTotal / 10);
  const baseMin = hasWeapon ? weaponMin : UNARMED_DAMAGE_MIN;
  const baseMax = hasWeapon ? weaponMax : unarmedMax(strTotal);
  const damageMin = baseMin + flatDamageAdd + strBonus;
  const damageMax = baseMax + flatDamageAdd + strBonus;

  // Healing: base healer-seed + item healing. Only the healer role
  // converts these into combat-time output, but the breakdown surfaces
  // them for any role so the tooltip is consistent.
  const healingBase = base.healing ?? 0;
  const healing = healingBase + healingFromItems;

  const health = (base.health ?? 0) + healthFromItems;

  const power = mercenaryPowerFromStats({
    level: merc.level,
    quality: merc.quality,
    type: merc.type,
    stats: {
      health,
      strength: stats.strength.total,
      dexterity: stats.dexterity.total,
      agility: stats.agility.total,
      endurance: stats.endurance.total,
      charisma: stats.charisma.total,
      intelligence: stats.intelligence.total,
      armor,
      damageMin,
      damageMax,
      healing,
    },
  });

  return {
    stats,
    armor,
    damageMin, damageMax,
    weaponMin, weaponMax, hasWeapon, strDamageBonus: strBonus,
    health, healthBase: base.health ?? 0, healthFromItems,
    threat, hardening,
    healing, healingBase, healingFromItems, criticalHealing,
    power,
  };
}
