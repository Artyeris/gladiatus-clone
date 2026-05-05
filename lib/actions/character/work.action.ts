'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import { REAL_MINUTES_PER_GAME_HOUR, findJob } from '@/constants/work';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { jobGoldReward } from '@/lib/utils/work';

async function getMyCharacter() {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return { error: { message: 'Not authenticated' } } as const;
  const userId = extractUserId(token.value);
  await connectToDB();
  const user = await User.findById(userId).populate({ path: 'character', model: Character });
  if (!user || !user.character) return { error: { message: 'Character not found' } } as const;
  return { character: user.character as any };
}

export async function startWorkAction({
  jobId,
  hours,
}: { jobId: string; hours: number }) {
  const me = await getMyCharacter();
  if ('error' in me) return me;
  const character = me.character;

  const job = findJob(jobId);
  if (!job) return { error: { message: 'Unknown job' } };
  if (!Number.isFinite(hours) || hours < job.minHours || hours > job.maxHours) {
    return { error: { message: `Hours must be between ${job.minHours} and ${job.maxHours}` } };
  }

  const existing = character.currentWork as any;
  if (existing && new Date(existing.endsAt).getTime() > Date.now()) {
    return { error: { message: 'You are already working' } };
  }

  try {
    const startedAt = new Date();
    const endsAt = new Date(
      startedAt.getTime() + hours * REAL_MINUTES_PER_GAME_HOUR * 60 * 1000,
    );

    character.currentWork = {
      jobId: job.id,
      hours,
      startedAt,
      endsAt,
    };
    character.markModified('currentWork');
    await character.save();

    revalidatePath('/game/work');
    return { ok: true, endsAt };
  } catch (error: any) {
    console.log(`${new Date()} - startWorkAction failed - ${error}`);
    return { error: { message: error?.message || 'Failed to start work' } };
  }
}

export async function claimWorkAction() {
  const me = await getMyCharacter();
  if ('error' in me) return me;
  const character = me.character;

  const work = character.currentWork as any;
  if (!work) return { error: { message: 'No active work' } };
  if (new Date(work.endsAt).getTime() > Date.now()) {
    return { error: { message: 'Shift not finished yet' } };
  }

  const job = findJob(work.jobId);
  if (!job) {
    character.currentWork = null;
    character.markModified('currentWork');
    await character.save();
    return { error: { message: 'Job no longer exists' } };
  }

  try {
    const reward = jobGoldReward(character.level ?? 1, job, work.hours);
    character.crowns = (character.crowns ?? 0) + reward;
    character.currentWork = null;
    character.markModified('currentWork');
    await character.save();

    revalidatePath('/game/work');
    revalidatePath('/game/overview');
    return { ok: true, reward };
  } catch (error: any) {
    console.log(`${new Date()} - claimWorkAction failed - ${error}`);
    return { error: { message: error?.message || 'Failed to claim work' } };
  }
}

export async function cancelWorkAction() {
  const me = await getMyCharacter();
  if ('error' in me) return me;
  const character = me.character;

  if (!character.currentWork) return { error: { message: 'No active work' } };

  try {
    character.currentWork = null;
    character.markModified('currentWork');
    await character.save();
    revalidatePath('/game/work');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - cancelWorkAction failed - ${error}`);
    return { error: { message: error?.message || 'Failed to cancel work' } };
  }
}
