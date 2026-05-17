'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import {
  DAILY_REWARD_DIAMONDS,
  MONTHLY_REWARD_DIAMONDS,
  RewardsStatus,
  WEEKLY_REWARD_DIAMONDS,
} from './rewards.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 28 * DAY_MS;

// Same-calendar-day check (server time) so a daily reward can only fire
// once per actual day, not once per 24h rolling window.
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

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

function computeStatus(character: any): RewardsStatus {
  const now = new Date();
  const lastDaily = character.lastDailyClaim ? new Date(character.lastDailyClaim) : null;
  const lastWeekly = character.lastWeeklyClaim ? new Date(character.lastWeeklyClaim) : null;
  const lastMonthly = character.lastMonthlyClaim ? new Date(character.lastMonthlyClaim) : null;

  const dailyReady = !lastDaily || !isSameDay(lastDaily, now);
  const dailyNext = dailyReady
    ? null
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const weeklyReady = !lastWeekly || now.getTime() - lastWeekly.getTime() >= WEEK_MS;
  const weeklyNext = weeklyReady
    ? null
    : new Date(lastWeekly!.getTime() + WEEK_MS).toISOString();

  const monthlyReady = !lastMonthly || now.getTime() - lastMonthly.getTime() >= MONTH_MS;
  const monthlyNext = monthlyReady
    ? null
    : new Date(lastMonthly!.getTime() + MONTH_MS).toISOString();

  return {
    diamonds: character.diamonds ?? 0,
    daily: { ready: dailyReady, nextAt: dailyNext },
    weekly: { ready: weeklyReady, nextAt: weeklyNext },
    monthly: { ready: monthlyReady, nextAt: monthlyNext },
  };
}

export async function getRewardsStatus(): Promise<{ status?: RewardsStatus; error?: { message: string } }> {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  return { status: computeStatus(character) };
}

export async function claimDailyReward() {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const now = new Date();
  const lastDaily = character.lastDailyClaim ? new Date(character.lastDailyClaim) : null;
  if (lastDaily && isSameDay(lastDaily, now)) {
    return { error: { message: 'Already claimed today' } };
  }

  character.diamonds = (character.diamonds ?? 0) + DAILY_REWARD_DIAMONDS;
  character.lastDailyClaim = now;
  await character.save();

  revalidatePath('/game/rewards');
  return { ok: true, awarded: DAILY_REWARD_DIAMONDS };
}

export async function claimWeeklyReward() {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const now = new Date();
  const lastWeekly = character.lastWeeklyClaim ? new Date(character.lastWeeklyClaim) : null;
  if (lastWeekly && now.getTime() - lastWeekly.getTime() < WEEK_MS) {
    return { error: { message: 'Weekly reward not ready yet' } };
  }

  character.diamonds = (character.diamonds ?? 0) + WEEKLY_REWARD_DIAMONDS;
  character.lastWeeklyClaim = now;
  await character.save();

  revalidatePath('/game/rewards');
  return { ok: true, awarded: WEEKLY_REWARD_DIAMONDS };
}

export async function claimMonthlyReward() {
  const character = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const now = new Date();
  const lastMonthly = character.lastMonthlyClaim ? new Date(character.lastMonthlyClaim) : null;
  if (lastMonthly && now.getTime() - lastMonthly.getTime() < MONTH_MS) {
    return { error: { message: 'Monthly reward not ready yet' } };
  }

  character.diamonds = (character.diamonds ?? 0) + MONTHLY_REWARD_DIAMONDS;
  character.lastMonthlyClaim = now;
  await character.save();

  revalidatePath('/game/rewards');
  return { ok: true, awarded: MONTHLY_REWARD_DIAMONDS };
}
