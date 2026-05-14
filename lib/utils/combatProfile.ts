import { combatBreakdown } from '@/lib/utils/combatBreakdown';
import { effectiveStats } from '@/lib/utils/combatStats';

// Derived combat figures shown on the battle report fighter cards.
// Self-only figures come from combatBreakdown (shared with the overview
// panel); chance-to-hit and double-hit additionally depend on the
// opponent.
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

// `combatant` and `opponent` may be a Character or an NPC enemy object.
export function combatProfile(combatant: any, opponent: any): CombatProfile {
  const self = effectiveStats(combatant);
  const foe = effectiveStats(opponent);
  const b = combatBreakdown(combatant);

  // Chance to hit = Dex / (Dex + EnemyAgility) * 100
  const chanceToHit = Math.floor(
    (self.dexterity / Math.max(1, self.dexterity + foe.agility)) * 100,
  );

  // Double hit = (Charisma * Dexterity * 10) / (EnemyIntelligence * EnemyAgility)
  const doubleHitChance = Math.floor(
    (self.charisma * self.dexterity * 10) /
      Math.max(1, foe.intelligence * foe.agility),
  );

  return {
    level: b.level,
    strength: self.strength,
    endurance: self.endurance,
    agility: self.agility,
    dexterity: self.dexterity,
    intelligence: self.intelligence,
    charisma: self.charisma,
    maxHP: b.maxHP,
    armor: b.armor,
    absorbMin: b.absorbMin,
    absorbMax: b.absorbMax,
    damageMin: b.damageMin,
    damageMax: b.damageMax,
    chanceToHit: capPercent(chanceToHit, 100),
    doubleHitChance: capPercent(doubleHitChance, 100),
    critChance: b.critChance,
    blockChance: b.blockChance,
    avoidCritChance: b.avoidCritChance,
  };
}
