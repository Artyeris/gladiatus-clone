'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils';
import { cookies } from 'next/headers';
import {
  HIGHSCORE_PAGE_SIZE,
  type HighscorePage,
  type HighscorePeriod,
} from '@/lib/types/highscore';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getArenaHighscore(
  page: number = 1,
  period: HighscorePeriod = 'all',
): Promise<HighscorePage> {
  const token = cookies().get(COOKIE_NAME);

  if (!token) throw new Error('Unathorized');

  try {
    const userId = extractUserId(token);

    connectToDB();

    const user = await User.findById(userId)
      .populate({
        path: 'character',
        model: Character,
      })

    if (!user || !user.character) throw new Error('Unauthorized');

    // "Weekly" tab is everyone who has actually won at least one
    // arena fight in the last 7 game days; pure honor sort otherwise.
    const filter: Record<string, any> = { onboarded: true };
    let sort: Record<string, 1 | -1> = { honor: -1 };
    if (period === 'week') {
      filter.weeklyWins = { $gt: 0 };
      filter.weekStartedAt = { $gte: new Date(Date.now() - WEEK_MS) };
      sort = { weeklyWins: -1, honor: -1 };
    }

    const safePage = Math.max(1, Math.floor(page));
    const total = await Character.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / HIGHSCORE_PAGE_SIZE));
    const clampedPage = Math.min(safePage, totalPages);

    const characters = await Character
      .find(filter)
      .sort(sort)
      .skip((clampedPage - 1) * HIGHSCORE_PAGE_SIZE)
      .limit(HIGHSCORE_PAGE_SIZE);

    return JSON.parse(JSON.stringify({
      characters,
      page: clampedPage,
      pageSize: HIGHSCORE_PAGE_SIZE,
      total,
      totalPages,
      period,
    }));

  } catch (error) {
    console.log(`${new Date} - Failed to get highscore - ${error}`);
    throw error;
  }
}