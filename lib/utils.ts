import { type ClassValue, clsx } from 'clsx'
import { JwtPayload, verify } from 'jsonwebtoken';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { twMerge } from 'tailwind-merge'
import { ARENA_COOLDOWN, EXPEDITION_COOLDOWN } from '@/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extracts the user id from the jwt and returns it.
export function extractUserId(token: RequestCookie) {
  const { value } = token;

  const secret = process.env.JWT_SECRET || '';

  const { userId } = verify(value, secret) as JwtPayload;

  if (!userId) throw new Error('Unauthorized')

  return userId;
}

// XP required to advance from `level` to `level + 1`.
// Levels 1-79 follow the linear curve `10 * level - 5` (matches the
// observed Gladiatus progression: 1->2 = 5 XP, 10->11 = 95 XP,
// 79->80 = 785 XP). Past level 80 the curve softly accelerates so
// hitting late levels takes longer, the same trend the original game
// shows after level ~84.
export function calculateNextLevelExperience(level: number) {
  const linear = 10 * level - 5;
  if (level < 80) return linear;
  return Math.floor(linear * Math.pow(1.08, level - 79));
}

export function calculateProgressPercent(first: number, second: number) {
  return (first / second) * 100;
}

// Compact integer formatter for stat displays. Numbers under 10 000
// stay as-is; larger values are abbreviated to thousands (23 977 977
// -> "23977k") so they fit alongside small counters in the same row
// without breaking the layout. Negative values keep their sign.
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const abs = Math.abs(value);
  if (abs < 10_000) return Math.trunc(value).toString();
  const sign = value < 0 ? '-' : '';
  return `${sign}${Math.floor(abs / 1000)}k`;
}

export function canFight({ time, fight }: { time: number, fight: string }) {
  const lastFightTime = new Date(time);
  const currentTime = new Date();

  if (fight === 'expedition') {
    const futureTime = new Date(lastFightTime.getTime() + EXPEDITION_COOLDOWN * 1000);
    return currentTime >= futureTime;
  } else if (fight === 'arena') {
    const futureTime = new Date(lastFightTime.getTime() + ARENA_COOLDOWN * 1000);
    return currentTime >= futureTime;
  } else return false;

}
