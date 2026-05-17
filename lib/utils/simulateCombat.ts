import { BattleCreatureParams, FightParams, Result, Round } from '@/lib/interfaces/battleReport.interface';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { EnemyInterface } from '@/lib/interfaces/enemy.interface';
import { calculateCriticalHitChance, calculateHP, calculateHitChance, getRandomEnemyStats } from '@/lib/utils/battleUtils';
import { calculateCombatStats, effectiveStats } from '@/lib/utils/combatStats';
import { getRandomNumber, randomBoolean } from '@/lib/utils/randomUtils';

// Roll an absorption amount inside the same range CombatRows shows in the
// hover-card. Same formula, just sampled instead of displayed.
function rollAbsorption(armor: number): number {
  if (armor <= 0) return 0;
  const a74 = armor / 74;
  const rawMin = Math.max(Math.ceil(a74 - a74 / 660 + 1), 0);
  const rawMax = Math.max(Math.floor(armor / 66 + armor / 660), 0);
  const min = Math.min(rawMin, rawMax);
  if (rawMax <= 0) return 0;
  return min + Math.floor(Math.random() * (rawMax - min + 1));
}

function rollDamageInRange(min: number, max: number): number {
  if (max <= min) return Math.max(1, Math.round(min));
  return Math.max(1, Math.round(min + Math.random() * (max - min)));
}

function rollCriticalDamage(weaponMax: number, strength: number): number {
  // Crits roughly double the high end of the swing and add an extra
  // strength kicker, matching the original calculateCriticalDamage feel.
  const base = Math.max(1, Math.round(weaponMax * 1.5));
  const kick = Math.floor(strength * 0.4);
  const min = base + Math.floor(kick * 0.5);
  const max = base + kick;
  return Math.max(min, Math.round(min + Math.random() * (max - min)));
}

// Simulates a battle between a character and a creature or another character.
export function fight({ attacker, defender }: FightParams): { rounds: Round[], result: Result } {
  // Pull effective stats (base + equipped item bonuses). NPC creatures
  // without equipment fall through unchanged.
  const A = effectiveStats(attacker);
  const D = effectiveStats(defender);

  const attackerCombat = calculateCombatStats(attacker as CharacterInterface);
  const defenderCombat = calculateCombatStats(defender as CharacterInterface);

  const attackerMaxHP = calculateHP({ level: A.level, endurance: A.endurance });
  const defenderMaxHP = calculateHP({ level: D.level, endurance: D.endurance });

  // Dev cheat: god-mode fighters fight at a massive HP pool so they
  // effectively cannot die during the simulation.
  const attackerGod = !!(attacker as any).godMode;
  const defenderGod = !!(defender as any).godMode;
  let attackerHP = attackerGod ? Number.MAX_SAFE_INTEGER : attackerMaxHP;
  let defenderHP = defenderGod ? Number.MAX_SAFE_INTEGER : defenderMaxHP;

  const attackerHitChance = calculateHitChance({
    attackerDexterity: A.dexterity,
    defenderAgility: D.agility,
  });
  const defenderHitChance = calculateHitChance({
    attackerDexterity: D.dexterity,
    defenderAgility: A.agility,
  });
  const attackerCriticalHitChance = calculateCriticalHitChance({
    attackerCharisma: A.charisma,
    attackerDexterity: A.dexterity,
    defenderIntelligence: D.intelligence,
    defenderAgility: D.agility,
  });
  const defenderCriticalHitChance = calculateCriticalHitChance({
    attackerCharisma: D.charisma,
    attackerDexterity: D.dexterity,
    defenderIntelligence: A.intelligence,
    defenderAgility: A.agility,
  });

  const attackerArmor = attackerCombat.armor;
  const defenderArmor = defenderCombat.armor;

  const rounds: Round[] = [];
  let roundNumber = 1;

  let attackerTotalDamage = 0;
  let defenderTotalDamage = 0;
  let attackerHitsAttempted = 0;
  let attackerHitsLanded = 0;
  let attackerCritsLanded = 0;
  let attackerArmorAbsorbed = 0;
  let defenderHitsAttempted = 0;
  let defenderHitsLanded = 0;
  let defenderCritsLanded = 0;
  let defenderArmorAbsorbed = 0;

  const hpLine = (current: number, max: number) =>
    `[HP: ${Math.max(0, Math.round(current))}/${Math.round(max)}]`;

  while (attackerHP > 0 && defenderHP > 0) {
    const round: Round = {
      roundNumber,
      attackerHP: parseFloat(attackerHP.toFixed(2)),
      defenderHP: parseFloat(defenderHP.toFixed(2)),
      events: [],
    };

    // Attacker normal hit
    attackerHitsAttempted++;
    if (randomBoolean(attackerHitChance)) {
      const raw = rollDamageInRange(attackerCombat.damageMin, attackerCombat.damageMax);
      const absorbed = Math.min(raw - 1, rollAbsorption(defenderArmor));
      const dealt = Math.max(1, raw - absorbed);
      attackerTotalDamage += dealt;
      defenderArmorAbsorbed += absorbed;
      defenderHP -= dealt;
      attackerHitsLanded++;
      round.events.push(
        `${attacker.name} hits ${defender.name} for ${dealt} damage`
          + (absorbed > 0 ? ` (-${absorbed} absorbed)` : '')
          + ` ${hpLine(defenderHP, defenderMaxHP)} -> ${defender.name}`,
      );
    } else {
      round.events.push(`${attacker.name} misses ${defender.name}.`);
    }

    // Defender normal hit
    defenderHitsAttempted++;
    if (randomBoolean(defenderHitChance)) {
      const raw = rollDamageInRange(defenderCombat.damageMin, defenderCombat.damageMax);
      const absorbed = Math.min(raw - 1, rollAbsorption(attackerArmor));
      const dealt = Math.max(1, raw - absorbed);
      defenderTotalDamage += dealt;
      attackerArmorAbsorbed += absorbed;
      attackerHP -= dealt;
      defenderHitsLanded++;
      round.events.push(
        `${defender.name} hits ${attacker.name} for ${dealt} damage`
          + (absorbed > 0 ? ` (-${absorbed} absorbed)` : '')
          + ` ${hpLine(attackerHP, attackerMaxHP)} -> ${attacker.name}`,
      );
    } else {
      round.events.push(`${defender.name} misses ${attacker.name}.`);
    }

    // Attacker critical
    if (randomBoolean(attackerCriticalHitChance)) {
      const raw = rollCriticalDamage(attackerCombat.weaponMax, A.strength);
      const absorbed = Math.min(raw - 1, rollAbsorption(defenderArmor));
      const dealt = Math.max(1, raw - absorbed);
      attackerTotalDamage += dealt;
      defenderArmorAbsorbed += absorbed;
      defenderHP -= dealt;
      attackerCritsLanded++;
      round.events.push(
        `${attacker.name} CRITICALLY strikes ${defender.name} for ${dealt} damage`
          + (absorbed > 0 ? ` (-${absorbed} absorbed)` : '')
          + ` ${hpLine(defenderHP, defenderMaxHP)} -> ${defender.name}`,
      );
    }

    // Defender critical
    if (randomBoolean(defenderCriticalHitChance)) {
      const raw = rollCriticalDamage(defenderCombat.weaponMax, D.strength);
      const absorbed = Math.min(raw - 1, rollAbsorption(attackerArmor));
      const dealt = Math.max(1, raw - absorbed);
      defenderTotalDamage += dealt;
      attackerArmorAbsorbed += absorbed;
      attackerHP -= dealt;
      defenderCritsLanded++;
      round.events.push(
        `${defender.name} CRITICALLY strikes ${attacker.name} for ${dealt} damage`
          + (absorbed > 0 ? ` (-${absorbed} absorbed)` : '')
          + ` ${hpLine(attackerHP, attackerMaxHP)} -> ${attacker.name}`,
      );
    }

    rounds.push(round);
    roundNumber++;
  }

  // Determine winner.
  const attackerFinalHealth = parseFloat(attackerHP.toFixed(2));
  const defenderFinalHealth = parseFloat(defenderHP.toFixed(2));
  const roundedAttackerTotalDamage = Math.round(attackerTotalDamage);
  const roundedDefenderTotalDamage = Math.round(defenderTotalDamage);

  let winner: string;
  if (attackerHP <= 0 && defenderHP <= 0) {
    winner = 'Draw';
  } else if (attackerHP <= 0) {
    winner = 'id' in defender ? defender.id.toString() : (defender as CharacterInterface)._id;
  } else {
    winner = (attacker as CharacterInterface)._id;
  }

  const result: Result = {
    winner,
    attackerFinalHealth,
    defenderFinalHealth,
    attackerTotalDamage: roundedAttackerTotalDamage,
    defenderTotalDamage: roundedDefenderTotalDamage,
    attackerHealth: attackerMaxHP,
    defenderHealth: defenderMaxHP,
    attackerHitsAttempted,
    attackerHitsLanded,
    attackerCritsLanded,
    attackerArmorAbsorbed: Math.round(attackerArmorAbsorbed),
    defenderHitsAttempted,
    defenderHitsLanded,
    defenderCritsLanded,
    defenderArmorAbsorbed: Math.round(defenderArmorAbsorbed),
    totalRounds: rounds.length,
  };

  return { rounds, result };
}

export function battleCreature({ character, enemy }: BattleCreatureParams): { battleSummary: { rounds: Round[], result: Result }, pickedEnemy: EnemyInterface } {
  const pickedEnemy = getRandomEnemyStats(enemy) as EnemyInterface;
  const battleSummary = fight({ attacker: character, defender: pickedEnemy });

  if (battleSummary.result.winner === 'Draw') {
    const experienceDrop = parseInt((getRandomNumber(pickedEnemy.experience[0], pickedEnemy.experience[1]) * 0.5).toFixed(0));
    const crownsDrop = parseInt(getRandomNumber(pickedEnemy.crowns[0], pickedEnemy.crowns[1] * 0.3).toFixed(0));
    battleSummary.result.experienceDrop = experienceDrop;
    battleSummary.result.crownsDrop = crownsDrop;
  }
  if (battleSummary.result.winner === character._id) {
    const experienceDrop = getRandomNumber(pickedEnemy.experience[0], pickedEnemy.experience[1]);
    const crownsDrop = getRandomNumber(pickedEnemy.crowns[0], pickedEnemy.crowns[1]);
    battleSummary.result.experienceDrop = experienceDrop;
    battleSummary.result.crownsDrop = crownsDrop;
  }
  if (battleSummary.result.winner === pickedEnemy.id.toString()) {
    const experienceDrop = parseInt((getRandomNumber(pickedEnemy.experience[0], pickedEnemy.experience[1]) * 0.3).toFixed(0));
    const crownsDrop = 0;
    battleSummary.result.experienceDrop = experienceDrop;
    battleSummary.result.crownsDrop = crownsDrop;
  }

  return { battleSummary, pickedEnemy };
}
