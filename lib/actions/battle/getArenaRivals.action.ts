'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils';
import { getArenaTier, tierLevelRange } from '@/lib/utils/arena';
import { ensureArenaBots } from '@/lib/actions/arena/seedBots.action';
import { getOrCreatePot } from '@/lib/actions/arena/arenaPot.action';
import { potGrowthPerHour, championHourlyGold } from '@/lib/utils/arenaPot';
import { cookies } from 'next/headers';

export async function getArenaRivals() {
  const token = cookies().get(COOKIE_NAME);
  if (!token) throw new Error('Unauthorized');

  try {
    const userId = extractUserId(token);
    await connectToDB();
    await ensureArenaBots();

    const user = await User.findById(userId).populate({
      path: 'character',
      model: Character,
    });
    if (!user || !user.character) throw new Error('Unauthorized');

    const character = user.character as any;
    const tier = getArenaTier(character.level ?? 1);
    const range = tierLevelRange(tier);

    // Refresh the pot record (lazy-grow + sync champion to current
    // tier leader). Salary itself is claimed silently by the
    // background tick in getUser -- we don't want a UI toast on the
    // arena page, just an inbox note.
    const pot = await getOrCreatePot(tier);

    // Pool of contenders sharing the same league bracket.
    const tierFilter: any = {
      onboarded: true,
      level: { $gte: range.min, $lte: range.max },
      _id: { $ne: character._id },
    };

    const myRank = (await Character.countDocuments({
      ...tierFilter,
      honor: { $gt: character.honor },
    })) + 1;

    const above = await Character.find(
      { ...tierFilter, honor: { $gt: character.honor } },
      { name: 1, _id: 1, honor: 1, level: 1, isBot: 1 },
    )
      .sort({ honor: 1 })
      .limit(4);

    const below = await Character.find(
      { ...tierFilter, honor: { $lte: character.honor } },
      { name: 1, _id: 1, honor: 1, level: 1, isBot: 1 },
    )
      .sort({ honor: -1 })
      .limit(2);

    const rivals = [
      ...above.reverse().map((rival, index) => ({
        name: rival.name,
        _id: rival._id,
        honor: rival.honor,
        level: rival.level,
        isBot: !!(rival as any).isBot,
        rank: myRank - (above.length - index),
      })),
      {
        name: character.name,
        _id: character._id,
        honor: character.honor,
        level: character.level,
        isBot: false,
        rank: myRank,
        isMe: true,
      },
      ...below.map((rival, index) => ({
        name: rival.name,
        _id: rival._id,
        honor: rival.honor,
        level: rival.level,
        isBot: !!(rival as any).isBot,
        rank: myRank + 1 + index,
      })),
    ];

    return JSON.parse(JSON.stringify({
      tier: { id: tier.id, name: tier.name, minLevel: tier.minLevel, maxLevel: tier.maxLevel },
      myRank,
      rivals,
      pot: {
        amount: pot.potAmount ?? 0,
        championId: pot.championId ? String(pot.championId) : null,
        championName: pot.championName ?? null,
        growthPerHour: potGrowthPerHour(tier),
        salaryPerHour: championHourlyGold(tier),
      },
    }));
  } catch (error) {
    console.log(`${new Date()} - Failed to get arena rivals - ${error}`);
    throw error;
  }
}
