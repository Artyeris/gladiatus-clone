'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils';
import { cookies } from 'next/headers';

export async function getArenaHighscore() {
  const token = cookies().get(COOKIE_NAME);

  if (!token) throw new Error('Unathorized');

  try {
    const userId = extractUserId(token);

    await connectToDB();

    const user = await User.findById(userId)
      .populate({
        path: 'character',
        model: Character,
      })

    if (!user || !user.character) throw new Error('Unauthorized');

    const highcoreArena = await Character
      .find({ $or: [{ onboarded: true }, { onboarded: { $exists: false } }] })
      .sort({ honor: -1 })
      .limit(100);

      return JSON.parse(JSON.stringify(highcoreArena));

  } catch (error) {
    console.log(`${new Date()} - Failed to get highscore - ${error}`);
    throw error;
  }
}
