'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { COOKIE_NAME, stats } from '@/constants';
import { connectToDB } from '@/lib/mongoose';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { extractUserId } from '@/lib/utils/jwtUtils';

const ALLOWED_STATS = stats.map((s) => s.id);
const calculateStatCost = (stat: number) => Math.pow(stat, 2) + stat + 1;

export async function trainCharacter(stat: string) {
  try {
    if (!ALLOWED_STATS.includes(stat)) {
      return { error: { message: 'Invalid stat' } };
    }

    const tokenCookie = cookies().get(COOKIE_NAME);
    if (!tokenCookie || !tokenCookie.value) {
      return { error: { message: 'Not authenticated' } };
    }

    const userId = extractUserId(tokenCookie.value);

    await connectToDB();

    const user = await User.findById(userId).select('character');
    if (!user || !user.character) {
      return { error: { message: 'Character not found' } };
    }

    const character = await Character.findById(user.character);
    if (!character) {
      return { error: { message: 'Character not found' } };
    }

    const currentStatValue = Number((character as any)[stat] ?? 5);
    const cost = calculateStatCost(currentStatValue);

    if (character.crowns < cost) {
      return { error: { message: 'Not enough crowns' } };
    }

    (character as any)[stat] = currentStatValue + 1;
    character.crowns -= cost;
    await character.save();

    revalidatePath('/game/training');
    revalidatePath('/game/overview');
    revalidatePath('/game/arena');
    revalidatePath('/game/expeditions');

    return {
      message: 'Stat trained successfully',
      character: JSON.parse(JSON.stringify(character)),
    };
  } catch (error) {
    console.error(`${new Date()} - Failed to train stat - ${error}`);
    return { error: { message: 'Failed to train stat' } };
  }
}
