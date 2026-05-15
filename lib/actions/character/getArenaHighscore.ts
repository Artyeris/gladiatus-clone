'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils';
import { cookies } from 'next/headers';

export const HIGHSCORE_PAGE_SIZE = 25;

export interface HighscorePage {
  characters: any[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function getArenaHighscore(page: number = 1): Promise<HighscorePage> {
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

    const filter = { onboarded: true };
    const safePage = Math.max(1, Math.floor(page));
    const total = await Character.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / HIGHSCORE_PAGE_SIZE));
    const clampedPage = Math.min(safePage, totalPages);

    const characters = await Character
      .find(filter)
      .sort({ honor: -1 })
      .skip((clampedPage - 1) * HIGHSCORE_PAGE_SIZE)
      .limit(HIGHSCORE_PAGE_SIZE);

    return JSON.parse(JSON.stringify({
      characters,
      page: clampedPage,
      pageSize: HIGHSCORE_PAGE_SIZE,
      total,
      totalPages,
    }));

  } catch (error) {
    console.log(`${new Date} - Failed to get highscore - ${error}`);
    throw error;
  }
}