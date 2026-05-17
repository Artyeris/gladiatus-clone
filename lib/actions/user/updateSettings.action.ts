'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';

import { RENAME_COST_GOLD } from './updateSettings.constants';

const LANGUAGES = ['en', 'lt'] as const;

export async function updateLanguage({ language }: { language: string }) {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return { error: { message: 'Not authenticated' } };
  if (!LANGUAGES.includes(language as any)) {
    return { error: { message: 'Unsupported language' } };
  }
  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    await User.updateOne({ _id: userId }, { $set: { language } });
    revalidatePath('/game/settings');
    return { ok: true };
  } catch (err: any) {
    console.log(`${new Date()} - updateLanguage failed - ${err}`);
    return { error: { message: err?.message || 'Failed to save' } };
  }
}

export async function renameCharacter({ name }: { name: string }) {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return { error: { message: 'Not authenticated' } };

  const trimmed = (name ?? '').trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { error: { message: 'Name must be 3-20 characters' } };
  }
  if (!/^[A-Za-z0-9 _'-]+$/.test(trimmed)) {
    return { error: { message: 'Only letters, digits, space, _, - and \' allowed' } };
  }

  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId).populate({ path: 'character', model: Character });
    if (!user?.character) return { error: { message: 'Character not found' } };
    const character: any = user.character;

    if (character.name === trimmed) return { error: { message: 'That is already your name' } };

    const taken = await Character.findOne({ name: trimmed, _id: { $ne: character._id } });
    if (taken) return { error: { message: 'Name already taken' } };

    if ((character.crowns ?? 0) < RENAME_COST_GOLD) {
      return { error: { message: `Renaming costs ${RENAME_COST_GOLD} gold` } };
    }

    character.name = trimmed;
    character.crowns = (character.crowns ?? 0) - RENAME_COST_GOLD;
    await character.save();

    revalidatePath('/game/settings');
    revalidatePath('/game/overview');
    return { ok: true };
  } catch (err: any) {
    console.log(`${new Date()} - renameCharacter failed - ${err}`);
    return { error: { message: err?.message || 'Rename failed' } };
  }
}
