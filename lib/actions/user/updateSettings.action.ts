'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';

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
