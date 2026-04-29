'use server';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const TRAINABLE_STATS = [
  'strength',
  'endurance',
  'agility',
  'dexterity',
  'intelligence',
  'charisma',
] as const;

type TrainableStat = typeof TRAINABLE_STATS[number];
type TrainCharacterParams = { stat: TrainableStat } | TrainableStat;

const calculateStatCost = (stat: number) => Math.pow(stat, 2) + stat + 1;

function normalizeStat(params: TrainCharacterParams): TrainableStat | null {
  const stat = typeof params === 'string' ? params : params?.stat;

  if (TRAINABLE_STATS.includes(stat as TrainableStat)) {
    return stat as TrainableStat;
  }

  return null;
}

export async function trainCharacter(params: TrainCharacterParams) {
  const stat = normalizeStat(params);

  if (!stat) {
    return { error: { message: 'Invalid stat' } };
  }

  const token = cookies().get(COOKIE_NAME);

  if (!token) {
    return { error: { message: 'Unauthorized' } };
  }

  try {
    await connectToDB();

    const userId = extractUserId(token);
    const user = await User.findById(userId).populate({
      path: 'character',
      model: Character,
    });

    if (!user || !user.character) {
      return { error: { message: 'Character not found' } };
    }

    const character = user.character as any;
    const currentStatValue = Number(character[stat] ?? 5);
    const cost = calculateStatCost(currentStatValue);

    if (character.crowns < cost) {
      return { error: { message: 'Not enough crowns' } };
    }

    character[stat] = currentStatValue + 1;
    character.crowns -= cost;

    await character.save();

    revalidatePath('/game/training');
    revalidatePath('/game/overview');
    revalidatePath('/game/arena');
    revalidatePath('/game/expeditions');

    return { message: 'Stat trained successfully' };
  } catch (error) {
    console.log(`${new Date()} - Failed to train stat - ${error}`);
    return { error: { message: 'Failed to train stat' } };
  }
}
