'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { canFight, extractUserId } from '@/lib/utils';
import { cookies } from 'next/headers';
import Journal from '@/lib/models/journal.model';
import { fight } from '@/lib/utils/simulateCombat';
import { populateEquipment } from '@/lib/utils/populateEquipment';
import BattleReport from '@/lib/models/battleReport.model';
import ArenaPot from '@/lib/models/arenaPot.model';
import { calculateHonor } from '@/lib/utils/battleUtils';
import { getArenaTier } from '@/lib/utils/arena';
import { growPot, installChampion } from '@/lib/utils/arenaPot';
import { trackQuestProgress } from '@/lib/actions/quest/quest.action';
import { revalidatePath } from 'next/cache';

export async function battleArena(defenderId: string) {
  const token = cookies().get(COOKIE_NAME);

  if (!token) throw new Error('Unathorized');

  try {
    const userId = extractUserId(token);

    connectToDB();

    const user = await User.findById(userId)
      .populate({
        path: 'character',
        model: Character,
        populate: {
          path: 'journal',
          model: Journal,
        }
      })

    if (!user || !user.character) throw new Error('Unauthorized');

    if (!canFight({ time: user.character.arenaLastBattle, fight: 'arena' })) return { error: { message: `Arena cooldown didn't finished` } }

    const attacker = user.character;

    if (attacker._id == defenderId) throw new Error(`Can't fight the same character`);
    
    const defender = await Character.findById(defenderId)
      .populate({
        path: 'journal',
        model: Journal,
      })

    if (!defender) throw new Error('Rival not found');

    const attackerJournal = attacker.journal;
    const defenderJournal = defender.journal; // null for NPC bots, that's fine.

    // Resolve equipped-item refs for both fighters so item bonuses feed
    // into the combat simulation.
    await populateEquipment(attacker);
    await populateEquipment(defender);

    const { rounds, result } = fight({ attacker, defender });

    result.honorEarned = 0;
    result.honorLost = 0;

    const battleReport = {
      result,
      rounds,
      attacker: attacker._id,
      defender: defender._id,
    }

    // Old battle reports are kept so the player can browse their history
    // under /game/reports.

    if (result.winner === 'Draw') {
      if (attackerJournal) attackerJournal.arena.draws++;
      if (defenderJournal) defenderJournal.arena.draws++;
    }
    // Attacker won.
    else if (result.winner == attacker._id) {
      // Calculate honor using the Elo system, the first parameter is the character who won.
      const earnedAndLostHonor = calculateHonor(attacker, defender);

      const earnedHonor = earnedAndLostHonor;
      const lostHonor = earnedAndLostHonor * -1;

      battleReport.result.honorEarned = earnedHonor;
      battleReport.result.honorLost = lostHonor;

      if (attackerJournal) attackerJournal.arena.wins++;
      if (defenderJournal) defenderJournal.arena.defeats++;

      // Lifetime honor accounting on the journal so the Statistics
      // page can show "Honor earned" / "Honor lost" instead of zeros.
      if (attackerJournal) {
        attackerJournal.arena.honorEarned = (attackerJournal.arena.honorEarned ?? 0) + earnedHonor;
      }
      if (defenderJournal) {
        defenderJournal.arena.honorEarned = (defenderJournal.arena.honorEarned ?? 0) + lostHonor;
      }

      // Roll the weekly-wins window if the previous week is over,
      // then bump the counter for the 7-day highscore.
      const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      const since = attacker.weekStartedAt
        ? Date.now() - new Date(attacker.weekStartedAt).getTime()
        : Infinity;
      if (since >= WEEK_MS) {
        attacker.weekStartedAt = new Date();
        attacker.weeklyWins = 0;
      }
      attacker.weeklyWins = (attacker.weeklyWins ?? 0) + 1;

      attacker.honor += earnedHonor;
      defender.honor += lostHonor;

      // Guarantee the winner ends above the loser by at least 1 honor.
      // With raw Elo a player can beat the rival directly above them but
      // still trail in honor, so rank never moves -- this nudges the
      // remaining gap to ensure an overtake.
      if (attacker.honor <= defender.honor) {
        const bridge = Math.ceil((defender.honor - attacker.honor) / 2) + 1;
        attacker.honor += bridge;
        defender.honor -= bridge;
        battleReport.result.honorEarned = earnedHonor + bridge;
        battleReport.result.honorLost = lostHonor - bridge;
      }
    }
    // Defender won.
    else if (result.winner == defender._id) {
      const earnedAndLostHonor = calculateHonor(defender, attacker);

      const earnedHonor = earnedAndLostHonor;
      const lostHonor = earnedAndLostHonor * -1;

      battleReport.result.honorEarned = earnedHonor;
      battleReport.result.honorLost = lostHonor;

      if (attackerJournal) attackerJournal.arena.defeats++;
      if (defenderJournal) defenderJournal.arena.wins++;
      if (defenderJournal) {
        defenderJournal.arena.honorEarned = (defenderJournal.arena.honorEarned ?? 0) + earnedHonor;
      }
      if (attackerJournal) {
        attackerJournal.arena.honorEarned = (attackerJournal.arena.honorEarned ?? 0) + lostHonor;
      }

      defender.honor += earnedHonor;
      attacker.honor += lostHonor;

      // Mirror of the attacker-won overtake guarantee: the defender
      // (winner here) must end above the attacker (loser here).
      if (defender.honor <= attacker.honor) {
        const bridge = Math.ceil((attacker.honor - defender.honor) / 2) + 1;
        defender.honor += bridge;
        attacker.honor -= bridge;
        battleReport.result.honorEarned = earnedHonor + bridge;
        battleReport.result.honorLost = lostHonor - bridge;
      }
    }

    if (attackerJournal) {
      attackerJournal.arena.battles++;
      attackerJournal.arena.damageInflicted = (attackerJournal.arena.damageInflicted ?? 0) + result.attackerTotalDamage;
      attackerJournal.arena.damageReceived = (attackerJournal.arena.damageReceived ?? 0) + result.defenderTotalDamage;
      attackerJournal.markModified('arena');
    }

    if (defenderJournal) {
      defenderJournal.arena.battles++;
      defenderJournal.arena.damageInflicted = (defenderJournal.arena.damageInflicted ?? 0) + result.defenderTotalDamage;
      defenderJournal.arena.damageReceived = (defenderJournal.arena.damageReceived ?? 0) + result.attackerTotalDamage;
      defenderJournal.markModified('arena');
    }

    // ---- Arena pot / champion takeover ----
    // If the attacker beat the current tier's champion, hand over the
    // accumulated pot and install them as the new champion. Otherwise
    // just keep the pot growing (lazy in getOrCreatePot).
    let potClaimed = 0;
    try {
      const playerWon = String(result.winner) === String(attacker._id);
      if (playerWon) {
        const tier = getArenaTier(defender.level ?? 1);
        const pot = await ArenaPot.findOne({ tierId: tier.id });
        if (pot && pot.championId && String(pot.championId) === String(defender._id)) {
          growPot(pot, tier);
          potClaimed = Math.max(0, pot.potAmount ?? 0);
          if (potClaimed > 0) {
            attacker.crowns = (attacker.crowns ?? 0) + potClaimed;
            (battleReport as any).potClaimed = potClaimed;
          }
          installChampion(pot, attacker._id, attacker.name);
          await pot.save();
        } else if (pot) {
          // Defender wasn't the champion, but the attacker might still
          // be promoted to #1 by this win. The lazy sync in
          // getOrCreatePot picks that up next visit.
          await pot.save();
        }
      }
    } catch (err) {
      console.log(`${new Date()} - arena pot transfer failed - ${err}`);
    }

    const savedBattleReport = await BattleReport.create(battleReport);

    // Quest hooks: every initiated arena fight counts toward
    // "arena_attack"; a win additionally feeds "arena_win".
    try {
      await trackQuestProgress({ characterId: attacker._id, verb: 'arena_attack', amount: 1 });
      if (String(result.winner) === String(attacker._id)) {
        await trackQuestProgress({ characterId: attacker._id, verb: 'arena_win', amount: 1 });
      }
    } catch {}

    attacker.arenaLastBattle = new Date();

    if (attacker.honor < 0) attacker.honor = 0;
    attacker.battleReport = savedBattleReport._id;
    await attacker.save();
    if (attackerJournal) await attackerJournal.save();

    if (defender.honor < 0) defender.honor = 0;
    defender.battleReport = savedBattleReport._id;
    await defender.save();
    if (defenderJournal) await defenderJournal.save();

    revalidatePath('/game/arena');
    return JSON.parse(JSON.stringify(savedBattleReport._id));

  } catch (error) {
    console.log(`${new Date} - Failed to simulate arena battle - ${error}`);
    throw error;
  }
}