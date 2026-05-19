'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { calculatePower } from '@/lib/utils/characterUtils';

export interface GladiatorRow {
  _id: string;
  name: string;
  level: number;
  honor: number;
  power: number;
  gender: 'male' | 'female';
  isActive: boolean;
}

async function getMyUser() {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return null;
  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId);
    return user ?? null;
  } catch {
    return null;
  }
}

// Read the user's full gladiator roster. Backfills any legacy account
// that has only `user.character` but no `user.characters` array, so
// existing players see their first gladiator on the list too.
export async function listMyGladiators(): Promise<{
  gladiators?: GladiatorRow[];
  activeId?: string | null;
  error?: { message: string };
}> {
  const user = await getMyUser();
  if (!user) return { error: { message: 'Not authenticated' } };

  try {
    const owned: string[] = ((user.characters as any[] | undefined) ?? []).map(String);
    const activeId = user.character ? String(user.character) : null;
    if (activeId && !owned.includes(activeId)) owned.push(activeId);

    // Persist the backfill so subsequent reads are clean.
    if (owned.length > ((user.characters as any[] | undefined)?.length ?? 0)) {
      user.characters = owned as any;
      try { await user.save(); } catch {}
    }

    if (owned.length === 0) {
      return { gladiators: [], activeId: null };
    }

    const docs = await Character.find(
      { _id: { $in: owned } },
      { name: 1, level: 1, honor: 1, gender: 1, strength: 1, endurance: 1, agility: 1, dexterity: 1, intelligence: 1, charisma: 1, equipment: 1 },
    ).lean();

    const gladiators: GladiatorRow[] = (docs as any[]).map((c) => ({
      _id: String(c._id),
      name: c.name,
      level: c.level ?? 1,
      honor: c.honor ?? 0,
      power: calculatePower(c as any),
      gender: c.gender === 'female' ? 'female' : 'male',
      isActive: String(c._id) === activeId,
    }));

    // Order: active first, then by power desc.
    gladiators.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return b.power - a.power;
    });

    return { gladiators, activeId };
  } catch (err: any) {
    console.log(`${new Date()} - listMyGladiators failed - ${err}`);
    return { error: { message: err?.message || 'Failed to load gladiators' } };
  }
}

export async function switchGladiator({ id }: { id: string }) {
  const user = await getMyUser();
  if (!user) return { error: { message: 'Not authenticated' } };

  try {
    const owned: string[] = ((user.characters as any[] | undefined) ?? []).map(String);
    if (user.character && !owned.includes(String(user.character))) owned.push(String(user.character));
    if (!owned.includes(String(id))) {
      return { error: { message: 'You do not own that gladiator' } };
    }
    user.character = id as any;
    user.characters = owned as any;
    await user.save();
    revalidatePath('/');
    return { ok: true };
  } catch (err: any) {
    console.log(`${new Date()} - switchGladiator failed - ${err}`);
    return { error: { message: err?.message || 'Failed to switch' } };
  }
}
