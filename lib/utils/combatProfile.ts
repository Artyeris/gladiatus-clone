import { calculateHP } from '@/lib/utils/battleUtils';
import { calculateCombatStats, effectiveStats } from '@/lib/utils/combatStats';

// Derived combat figures shown on the battle report fighter cards.
// Formulas follow the player-provided Gladiatus reference.
export interface CombatProfile {
  level: number;
  strength: number;
  endurance: number;
  agility: number;
  dexterity: number;
  intelligence: number;
  charisma: number;
  maxHP: number;
  armor: number;
  absorbMin: number;
  absorbMax: number;
  damageMin: number;
  damageMax: number;
  // Percentages (0-100, the last three capped at 50).
  chanceToHit: number;
  doubleHitChance: number;
  critChance: number;
  blockChance: number;
  avoidCritChance: number;
}

const capPercent = (v: number, cap = 50) => Math.max(0, Math.min(cap, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

// `combatant` and `opponent` may be a Character or an NPC enemy object.
// Chance-to-hit and double-hit compare against the opponent; the rest are
// self-only.
export function combatProfile(combatant: any, opponent: any): CombatProfile {
  const self = effectiveStats(combatant);
  const foe = effectiveStats(opponent);
  const cs = calculateCombatStats(combatant);

  const level = Math.max(1, self.level);
  // The fan formulas divide by (level - 8); clamp so low levels don't
  // blow up or divide by zero/negatives.
  const levelDivisor = Math.max(1, level - 8);

  // Chance to hit = Dex / (Dex + EnemyAgility) * 100
  const chanceToHit = Math.floor(
    (self.dexterity / Math.max(1, self.dexterity + foe.agility)) * 100,
  );

  // Double hit = (Charisma * Dexterity * 10) / (EnemyIntelligence * EnemyAgility)
  const doubleHitChance = Math.floor(
    (self.charisma * self.dexterity * 10) /
      Math.max(1, foe.intelligence * foe.agility),
  );

  // Critical chance = (critValue * 52 / (level - 8)) / 5, cap 50
  const critValue = Math.floor(self.dexterity / 10);
  const critChance = round1(capPercent((critValue * 52 / levelDivisor) / 5));

  // Block chance = (blockValue * 52 / (level - 8)) / 6, cap 50
  const blockValue = Math.floor(self.strength / 10);
  const blockChance = round1(capPercent((blockValue * 52 / levelDivisor) / 6));

  // Avoid critical = (resilience * 52 / (level - 8)) / 4, cap 50
  const resilience = Math.floor(self.agility / 10);
  const avoidCritChance = round1(capPercent((resilience * 52 / levelDivisor) / 4));

  // Armor -> flat absorption interval (same formula CombatRows shows).
  const armor = cs.armor;
  let absorbMin = 0;
  let absorbMax = 0;
  if (armor > 0) {
    const a74 = armor / 74;
    const rawMin = Math.max(Math.ceil(a74 - a74 / 660 + 1), 0);
    const rawMax = Math.max(Math.floor(armor / 66 + armor / 660), 0);
    absorbMax = rawMax;
    absorbMin = Math.min(rawMin, rawMax);
  }

  return {
    level,
    strength: self.strength,
    endurance: self.endurance,
    agility: self.agility,
    dexterity: self.dexterity,
    intelligence: self.intelligence,
    charisma: self.charisma,
    maxHP: calculateHP({ level, endurance: self.endurance }),
    armor,
    absorbMin,
    absorbMax,
    damageMin: cs.damageMin,
    damageMax: cs.damageMax,
    chanceToHit: capPercent(chanceToHit, 100),
    doubleHitChance: capPercent(doubleHitChance, 100),
    critChance,
    blockChance,
    avoidCritChance,
  };
}
