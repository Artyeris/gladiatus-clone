// Type & constant exports shared between the rewards server action
// and the client UI. Kept out of the 'use server' file because that
// file may only export async functions.

export const DAILY_REWARD_DIAMONDS = 1;
export const WEEKLY_REWARD_DIAMONDS = 7;
export const MONTHLY_REWARD_DIAMONDS = 28;

export interface RewardsStatus {
  diamonds: number;
  dailyStreak: number;
  daily: { ready: boolean; nextAt: string | null };
  weekly: { ready: boolean; nextAt: string | null };
  monthly: { ready: boolean; nextAt: string | null; progress: number };
}
