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

    // No arena fights during a work shift.
    if ((user.character as any).currentWork) {
      return { error: { message: 'You are at work right now. Claim or cancel your shift first.' } };
    }

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
        // Snapshot the current level / honor so the 7-day highscore
        // can render the delta accumulated during this new window.
        attacker.weekStartLevel = attacker.level ?? 1;
        attacker.weekStartHonor = attacker.honor ?? 0;
      }
      attacker.weeklyWins = (attacker.weeklyWins ?? 0) + 1;

      // Arena gold reward. Roughly 20 * defender_level + 50 to keep
      // it modest compared to expedition gold. Under level 100 we
      // suppress the reward when the defender is more than 5 levels
      // below the attacker (i.e. atk - def >= 6 -- attacking someone
      // 5 levels below still pays out, 6+ does not). At level 100+
      // the cap no longer applies.
      const atkLvl = attacker.level ?? 1;
      const defLvl = defender.level ?? 1;
      const eligibleForGold = atkLvl >= 100 || (atkLvl - defLvl) < 6;
      // Initialise the field so a subsequent UI check on
      // crownsDrop never trips on undefined.
      (battleReport.result as any).crownsDrop = 0;
      if (eligibleForGold) {
        const gold = Math.max(1, 20 * defLvl + 50);
        attacker.crowns = (attacker.crowns ?? 0) + gold;
        (battleReport.result as any).crownsDrop = gold;
      }

      // Rank takeover: if the attacker ranked below the defender on the
      // honor leaderboard, they swap honor values. That promotes the
      // winner straight into the loser's rank (e.g. 5th beats 1st ->
      // attacker becomes 1st, defender drops to 5th). When the attacker
      // was already ranked above the defender, fall back to plain Elo.
      const attackerHonorBefore = attacker.honor ?? 0;
      const defenderHonorBefore = defender.honor ?? 0;

      if (attackerHonorBefore < defenderHonorBefore) {
        attacker.honor = defenderHonorBefore;
        defender.honor = attackerHonorBefore;
        battleReport.result.honorEarned = defenderHonorBefore - attackerHonorBefore;
        battleReport.result.honorLost = -(defenderHonorBefore - attackerHonorBefore);
      } else {
        attacker.honor += earnedHonor;
        defender.honor += lostHonor;
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

      // Mirror of the attacker-won rank-takeover: if the defender was
      // ranked below the attacker on the honor leaderboard, the two
      // swap honor values so the defender (winner) inherits the
      // attacker's rank.
      const attackerHonorBefore = attacker.honor ?? 0;
      const defenderHonorBefore = defender.honor ?? 0;

      if (defenderHonorBefore < attackerHonorBefore) {
        defender.honor = attackerHonorBefore;
        attacker.honor = defenderHonorBefore;
        battleReport.result.honorEarned = attackerHonorBefore - defenderHonorBefore;
        battleReport.result.honorLost = -(attackerHonorBefore - defenderHonorBefore);
      } else {
        defender.honor += earnedHonor;
        attacker.honor += lostHonor;
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