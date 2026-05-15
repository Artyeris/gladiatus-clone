'use server'

import Character from '@/lib/models/character.model';
import ArenaPot from '@/lib/models/arenaPot.model';
import { connectToDB } from '@/lib/mongoose';
import { ArenaTier, tierLevelRange } from '@/lib/utils/arena';
import { growPot, claimChampionSalary } from '@/lib/utils/arenaPot';

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

// Champion claims accrued hourly salary. Returns {gold, exp} actually
// awarded. Safe to call for anyone; if they're not the champion it
// no-ops.
export async function claimSalaryFor(characterId: any, tier: ArenaTier) {
  await connectToDB();
  const pot = await getOrCreatePot(tier);
  if (!pot.championId || String(pot.championId) !== String(characterId)) {
    return { gold: 0, exp: 0 };
  }
  const delta = claimChampionSalary(pot, tier);
  await pot.save();
  return delta;
}
