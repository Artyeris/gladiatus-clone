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
    const tierBaseFilter: any = {
      onboarded: true,
      level: { $gte: range.min, $lte: range.max },
    };

    const myRank = (await Character.countDocuments({
      ...tierBaseFilter,
      _id: { $ne: character._id },
      honor: { $gt: character.honor },
    })) + 1;

    // Always show the tier's top 5 -- the actual leaderboard. If the
    // player isn't already in the top 5, append their own row at the
    // bottom so they can see where they stand.
    const topFive = await Character.find(
      tierBaseFilter,
      { name: 1, _id: 1, honor: 1, level: 1, isBot: 1 },
    )
      .sort({ honor: -1 })
      .limit(5);

    const rivals = topFive.map((rival, index) => ({
      name:  rival.name,
      _id:   rival._id,
      honor: rival.honor,
      level: rival.level,
      isBot: !!(rival as any).isBot,
      rank:  index + 1,
      isMe:  String(rival._id) === String(character._id),
    }));

    const playerInTop = rivals.some((r) => r.isMe);
    if (!playerInTop) {
      rivals.push({
        name:  character.name,
        _id:   character._id,
        honor: character.honor,
        level: character.level,
        isBot: false,
        rank:  myRank,
        isMe:  true,
      });
    }

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
