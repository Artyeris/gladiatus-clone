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

// Bulk train up to MAX_PURCHASES levels of `stat` in one call.
// Counts only the levels actually affordable; partial buys are
// allowed so a "+5" shift-click that can only cover three trains
// still spends the gold and returns the new state honestly.
const MAX_BULK_PURCHASES = 50;

export async function trainCharacter(stat: string, count: number = 1) {
  try {
    if (!ALLOWED_STATS.includes(stat)) {
      return { error: { message: 'Invalid stat' } };
    }
    const wanted = Math.min(MAX_BULK_PURCHASES, Math.max(1, Math.floor(count)));

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

    let purchased = 0;
    let totalCost = 0;
    let value = Number((character as any)[stat] ?? 5);
    for (let i = 0; i < wanted; i++) {
      const cost = calculateStatCost(value);
      if ((character.crowns ?? 0) - totalCost < cost) break;
      totalCost += cost;
      value += 1;
      purchased += 1;
    }

    if (purchased === 0) {
      return { error: { message: 'Not enough gold' } };
    }

    (character as any)[stat] = value;
    character.crowns -= totalCost;

    if (!character.trainCount) character.trainCount = {} as any;
    const tc: any = character.trainCount;
    tc[stat] = (tc[stat] ?? 0) + purchased;
    character.markModified('trainCount');

    await character.save();

    revalidatePath('/game/training');
    revalidatePath('/game/overview');
    revalidatePath('/game/arena');
    revalidatePath('/game/expeditions');

    return {
      message: 'Stat trained successfully',
      character: JSON.parse(JSON.stringify(character)),
      purchased,
      spent: totalCost,
    };
  } catch (error) {
    console.error(`${new Date()} - Failed to train stat - ${error}`);
    return { error: { message: 'Failed to train stat' } };
  }
}
