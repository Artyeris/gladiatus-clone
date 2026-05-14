import { calculateHP } from '@/lib/utils/battleUtils';
import { calculateCombatStats, effectiveStats } from '@/lib/utils/combatStats';

// Self-only derived combat figures, with each value split into the part
// contributed by the base (trained) stat and the part contributed by
// equipped items. Shared by the overview panel and the battle report
// fighter cards so the two always agree.
export interface CombatBreakdown {
  level: number;
  maxHP: number;

  damageMin: number;
  damageMax: number;
  weaponMin: number;
  weaponMax: number;
  hasWeapon: boolean;
  strDamageBonus: number;

  armor: number;
  absorbMin: number;
  absorbMax: number;

  critChance: number;
  critValue: number;
  critFromBase: number;
  critFromItems: number;

  blockChance: number;
  blockValue: number;
  blockFromBase: number;
  blockFromItems: number;

  avoidCritChance: number;
  avoidCritValue: number;
  avoidCritFromBase: number;
  avoidCritFromItems: number;
}

// Untrained stat default -- matches effectiveStats().
const BASE_STAT = 5;

const capPercent = (v: number, cap = 50) => Math.max(0, Math.min(cap, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

// Gladiatus armor -> flat absorption range.
function armorAbsorption(armor: number) {
  if (armor <= 0) return { min: 0, max: 0 };
  const a74 = armor / 74;
  const rawMin = Math.max(Math.ceil(a74 - a74 / 660 + 1), 0);
  const rawMax = Math.max(Math.floor(armor / 66 + armor / 660), 0);
  // The fan formula's +1 baseline can push min above max at low armor.
  return { min: Math.min(rawMin, rawMax), max: rawMax };
}

// `combatant` may be a Character (with equipment) or an NPC enemy object.
// NPCs have no equipment, so every "fromItems" figure is simply 0.
export function combatBreakdown(combatant: any): CombatBreakdown {
  const eff = effectiveStats(combatant);
  const cs = calculateCombatStats(combatant);

  const level = Math.max(1, eff.level);
  // The fan formulas divide by (level - 8); clamp so low levels don't
  // blow up or divide by zero/negatives.
  const levelDivisor = Math.max(1, level - 8);

  const baseStr = combatant.strength ?? BASE_STAT;
  const baseDex = combatant.dexterity ?? BASE_STAT;
  const baseAgi = combatant.agility ?? BASE_STAT;

  // Critical hit -- scales with dexterity.
  const critValue = Math.floor(eff.dexterity / 10);
  const critFromBase = Math.floor(baseDex / 10);
  const critFromItems = Math.max(0, critValue - critFromBase);
  const critChance = round1(capPercent((critValue * 52 / levelDivisor) / 5));

  // Block -- scales with strength.
  const blockValue = Math.floor(eff.strength / 10);
  const blockFromBase = Math.floor(baseStr / 10);
  const blockFromItems = Math.max(0, blockValue - blockFromBase);
  const blockChance = round1(capPercent((blockValue * 52 / levelDivisor) / 6));

  // Avoid critical -- scales with agility.
  const avoidCritValue = Math.floor(eff.agility / 10);
  const avoidCritFromBase = Math.floor(baseAgi / 10);
  const avoidCritFromItems = Math.max(0, avoidCritValue - avoidCritFromBase);
  const avoidCritChance = round1(capPercent((avoidCritValue * 52 / levelDivisor) / 4));

  const { min: absorbMin, max: absorbMax } = armorAbsorption(cs.armor);

  return {
    level,
    maxHP: calculateHP({ level, endurance: eff.endurance }),

    damageMin: cs.damageMin,
    damageMax: cs.damageMax,
    weaponMin: cs.weaponMin,
    weaponMax: cs.weaponMax,
    hasWeapon: cs.hasWeapon,
    strDamageBonus: cs.strBonus,

    armor: cs.armor,
    absorbMin,
    absorbMax,

    critChance,
    critValue,
    critFromBase,
    critFromItems,

    blockChance,
    blockValue,
    blockFromBase,
    blockFromItems,

    avoidCritChance,
    avoidCritValue,
    avoidCritFromBase,
    avoidCritFromItems,
  };
}
