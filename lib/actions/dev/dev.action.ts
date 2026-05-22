'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';

// Cheat actions intended only for testing. Each action mutates the
// caller's own character; no admin/whitelist gating because the whole
// game is single-tenant during development. Should be hidden behind a
// feature flag before any public deployment.

async function getMyCharacter() {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return null;
  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId).populate({ path: 'character', model: Character });
    if (!user?.character) return null;
    return user.character as any;
  } catch {
    return null;
  }
}

export async function devToggleGodMode() {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  character.godMode = !character.godMode;
  await character.save();
  revalidatePath('/');
  return { ok: true, godMode: !!character.godMode };
}

export async function devGrantGold({ amount = 100_000 }: { amount?: number } = {}) {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  character.crowns = (character.crowns ?? 0) + Math.max(0, Math.floor(amount));
  await character.save();
  revalidatePath('/');
  return { ok: true, crowns: character.crowns };
}

export async function devGrantDiamonds({ amount = 10 }: { amount?: number } = {}) {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  character.diamonds = (character.diamonds ?? 0) + Math.max(0, Math.floor(amount));
  await character.save();
  revalidatePath('/');
  return { ok: true, diamonds: character.diamonds };
}

export async function devGrantLevels({ amount = 1 }: { amount?: number } = {}) {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  const inc = Math.max(0, Math.floor(amount));
  character.level = (character.level ?? 1) + inc;
  // Reset partial XP so the next-level bar starts clean.
  character.experience = 0;
  await character.save();
  revalidatePath('/');
  return { ok: true, level: character.level };
}

export async function devResetTimers() {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  // Backdate by a generous margin so canFight returns true immediately.
  const longAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  character.expeditionLastBattle = longAgo;
  character.arenaLastBattle = longAgo;
  // Also clear the new-quest cooldown so the player can grab another
  // quest immediately when testing the cooldown flow.
  character.lastQuestTakenAt = null;
  await character.save();
  revalidatePath('/');
  return { ok: true };
}
