'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import {
  COUNTRIES,
  Country,
  COUNTRY_ORDER,
} from '@/constants/expeditions';

async function getMyCharacter() {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return null;
  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId).populate({ path: 'character', model: Character });
    return user?.character ?? null;
  } catch {
    return null;
  }
}

export async function travelTo({ country }: { country: Country }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  if (!COUNTRY_ORDER.includes(country)) {
    return { error: { message: 'Unknown country' } };
  }

  const info = COUNTRIES[country];
  if ((character.level ?? 1) < info.entryLevel) {
    return { error: { message: `${info.name} unlocks at level ${info.entryLevel}` } };
  }

  const current: Country = (character.currentCountry as Country) ?? 'italy';
  if (current === country) {
    return { error: { message: `You are already in ${info.name}` } };
  }

  // Every trip pays the destination's fare -- there is no first-visit
  // discount any more. Italy alone is free to return to (travelCost
  // = 0 in COUNTRIES) because it's the home country.
  const cost = info.travelCost;
  const unlocked: Country[] = ((character.unlockedCountries as Country[]) ?? ['italy']);
  const alreadyUnlocked = unlocked.includes(country) || country === 'italy';

  if ((character.crowns ?? 0) < cost) {
    return { error: { message: `Need ${cost} gold to travel to ${info.name}` } };
  }

  character.crowns = (character.crowns ?? 0) - cost;
  character.currentCountry = country;
  if (!alreadyUnlocked) {
    character.unlockedCountries = Array.from(new Set([...unlocked, country]));
    character.markModified('unlockedCountries');
  }
  await character.save();

  revalidatePath('/');
  revalidatePath('/game/expeditions/travel');
  return { ok: true, country, cost };
}
