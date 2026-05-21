'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import ArenaPot from '@/lib/models/arenaPot.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { ArenaTier, getArenaTier, tierLevelRange } from '@/lib/utils/arena';
import { championHourlyGold, gameHoursSince, growPot, claimChampionSalary } from '@/lib/utils/arenaPot';
import { sendMessageToCharacter } from '@/lib/actions/message/message.action';

// Returns the current top character in a tier (highest honor in the
// tier's level range). Null when nobody is in the bracket yet.
async function findTierLeader(tier: ArenaTier): Promise<any | null> {
  const range = tierLevelRange(tier);
  return Character.findOne({
    onboarded: true,
    level: { $gte: range.min, $lte: range.max },
  })
    .sort({ honor: -1 })
    .select({ _id: 1, name: 1, honor: 1 })
    .lean();
}

// Fetch (creating if missing) the pot record for a tier. Re-syncs the
// champion to whoever is currently sorted #1, so we don't pay salary or
// drop a pot onto an empty seat.
export async function getOrCreatePot(tier: ArenaTier) {
  await connectToDB();
  let pot = await ArenaPot.findOne({ tierId: tier.id });
  if (!pot) {
    pot = await ArenaPot.create({ tierId: tier.id });
  }

  const leader = await findTierLeader(tier);
  if (!leader) {
    // Empty tier: park the pot so it doesn't grow on nobody.
    pot.championId = null;
    pot.championName = null;
    pot.championBecameAt = null;
    pot.potUpdatedAt = new Date();
    pot.lastSalaryAt = null;
    await pot.save();
    return pot;
  }

  const leaderId = String(leader._id);
  if (String(pot.championId ?? '') !== leaderId) {
    // Champion changed without going through a recorded fight (e.g.
    // the previous champion levelled out of the bracket, or the
    // bracket was just seeded). Only arena combat hands over a pot,
    // so reset the chair AND the pot to zero -- otherwise leaving
    // the tier would silently gift the next #1 a free jackpot.
    pot.championId = leader._id;
    pot.championName = leader.name;
    pot.championBecameAt = new Date();
    pot.lastSalaryAt = new Date();
    pot.potAmount = 0;
    pot.potUpdatedAt = new Date();
  }

  growPot(pot, tier);
  await pot.save();
  return pot;
}

// Champion claims accrued hourly salary. Returns the gold actually
// awarded. Safe to call for anyone; if they're not the champion it
// no-ops.
export async function claimSalaryFor(characterId: any, tier: ArenaTier) {
  await connectToDB();
  const pot = await getOrCreatePot(tier);
  if (!pot.championId || String(pot.championId) !== String(characterId)) {
    return { gold: 0 };
  }
  const delta = claimChampionSalary(pot, tier);
  await pot.save();
  return delta;
}

// Player-facing salary claim. Looks up the caller's character, checks
// they hold the champion seat for their bracket, pays out any
// accrued whole-hour salary and returns the awarded amount so the UI
// can show it. No-ops gracefully when they're not the champion or
// haven't accrued a full hour yet.
export async function claimMyChampionSalary(): Promise<{
  ok?: boolean;
  awarded?: number;
  pending?: number;
  error?: { message: string };
}> {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return { error: { message: 'Not authenticated' } };

  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId).populate({ path: 'character', model: Character });
    const character: any = user?.character;
    if (!character?._id) return { error: { message: 'Character not found' } };

    const tier = getArenaTier(character.level ?? 1);
    const pot = await ArenaPot.findOne({ tierId: tier.id });
    if (!pot || !pot.championId || String(pot.championId) !== String(character._id)) {
      return { error: { message: 'You do not hold the champion seat' } };
    }

    const delta = claimChampionSalary(pot, tier);
    if (delta.gold === 0) {
      const hours = gameHoursSince(pot.lastSalaryAt ?? pot.championBecameAt);
      const minsToNext = Math.max(1, Math.ceil((1 - (hours % 1)) * 60));
      if (pot.isModified()) await pot.save();
      return { error: { message: `Next salary in ~${minsToNext} min` } };
    }

    character.crowns = (character.crowns ?? 0) + delta.gold;
    await character.save();
    await pot.save();

    revalidatePath('/game/arena');
    revalidatePath('/');
    return { ok: true, awarded: delta.gold };
  } catch (err: any) {
    console.log(`${new Date()} - claimMyChampionSalary failed - ${err}`);
    return { error: { message: err?.message || 'Claim failed' } };
  }
}

// Background tick: awarded silently to a champion's character on any
// page load (called from getUser). Mutates the character doc in-place
// (caller must save it) and drops a single "Champion salary" message
// per claim into their inbox -- never raises a UI toast. Skipped when
// the user isn't actually #1, or when less than a full game-hour has
// accrued since the last claim. Pays gold only -- no XP, so a long
// champion run can't shove the player out of their bracket.
export async function tickChampionSalary(character: any): Promise<{
  gold: number;
} | null> {
  if (!character?._id) return null;
  await connectToDB();
  const tier = getArenaTier(character.level ?? 1);
  const pot = await ArenaPot.findOne({ tierId: tier.id });
  if (!pot || !pot.championId || String(pot.championId) !== String(character._id)) {
    return null;
  }

  const delta = claimChampionSalary(pot, tier);
  if (delta.gold === 0) {
    // Persist the lastSalaryAt advance so the clock initialises even
    // before the first hourly payment.
    if (pot.isModified()) await pot.save();
    return null;
  }

  character.crowns = (character.crowns ?? 0) + delta.gold;
  await pot.save();

  try {
    await sendMessageToCharacter(
      String(character._id),
      'system',
      `Champion salary -- ${tier.name}`,
      `You earned ${delta.gold} gold for holding the champion seat in ${tier.name}.`,
    );
  } catch (err) {
    console.log(`${new Date()} - champion salary message failed - ${err}`);
  }

  return delta;
}
