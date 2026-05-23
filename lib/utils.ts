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

// Tiered compact formatter for stat displays. Falls back to the raw
// integer under 1 000, then steps through k / mil / bil / tril.
// Negative values keep their sign. Pair with `CompactNumber` to get a
// tooltip showing the full value on hover.
//
//   999            -> "999"
//   78 588         -> "78k"
//   23 977 977     -> "23mil"
//   1 234 567 890  -> "1bil"
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs < 1_000) return `${sign}${Math.trunc(abs)}`;
  if (abs < 1_000_000) return `${sign}${Math.floor(abs / 1_000)}k`;
  if (abs < 1_000_000_000) return `${sign}${Math.floor(abs / 1_000_000)}mil`;
  if (abs < 1_000_000_000_000) return `${sign}${Math.floor(abs / 1_000_000_000)}bil`;
  return `${sign}${Math.floor(abs / 1_000_000_000_000)}tril`;
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
