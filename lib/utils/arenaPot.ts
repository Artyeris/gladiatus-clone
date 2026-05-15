import { ArenaTier, tierLevelRange } from '@/lib/utils/arena';

// The clone runs as a "5x server", so all hourly rates effectively tick
// 5x faster than the original game. Centralised here so it's easy to
// tune later.
export const SERVER_SPEED = 5;

// Reference level for a tier when computing pot/salary scaling -- use
// the top of the bracket so the late-game leagues earn more.
function tierLevel(tier: ArenaTier): number {
  return tierLevelRange(tier).max;
}

// Hourly salary the tier's champion earns while holding #1. Mirrors the
// spec the player provided: roughly 20 * level + 100 per real hour at 1x.
export function championHourlyGold(tier: ArenaTier): number {
  return 20 * tierLevel(tier) + 100;
}

// Hourly XP for the champion -- modest so it doesn't shove them out of
// the bracket too fast.
export function championHourlyExp(tier: ArenaTier): number {
  return Math.max(1, Math.floor(tierLevel(tier) / 5));
}

// How much pot accumulates per real hour. Late-game brackets grow much
// faster -- 50 + level^2 * 0.8 per the design notes.
export function potGrowthPerHour(tier: ArenaTier): number {
  const lvl = tierLevel(tier);
  return Math.floor(50 + lvl * lvl * 0.8);
}

// Wall-clock hours since `since` (clamped to 0). Multiplied by
// SERVER_SPEED so "1 real hour" is 5 game hours on a 5x server.
export function gameHoursSince(since: Date | null | undefined): number {
  if (!since) return 0;
  const ms = Date.now() - new Date(since).getTime();
  if (ms <= 0) return 0;
  return (ms / 3_600_000) * SERVER_SPEED;
}

// Lazily updates `pot.potAmount` based on elapsed time since
// potUpdatedAt. Mutates the document in place and returns the new
// amount. Safe to call repeatedly.
export function growPot(pot: any, tier: ArenaTier): number {
  if (!pot.championId) return pot.potAmount ?? 0;
  const hours = gameHoursSince(pot.potUpdatedAt);
  if (hours <= 0) return pot.potAmount ?? 0;
  const growth = Math.floor(hours * potGrowthPerHour(tier));
  pot.potAmount = (pot.potAmount ?? 0) + growth;
  pot.potUpdatedAt = new Date();
  return pot.potAmount;
}

export interface SalaryDelta {
  gold: number;
  exp: number;
}

// Computes how much salary (gold + exp) the champion has accrued since
// their last claim, updates `lastSalaryAt`, and returns the delta.
export function claimChampionSalary(pot: any, tier: ArenaTier): SalaryDelta {
  if (!pot.championId) return { gold: 0, exp: 0 };
  const hours = gameHoursSince(pot.lastSalaryAt ?? pot.championBecameAt);
  if (hours <= 0) {
    pot.lastSalaryAt = new Date();
    return { gold: 0, exp: 0 };
  }
  const gold = Math.floor(hours * championHourlyGold(tier));
  const exp = Math.floor(hours * championHourlyExp(tier));
  pot.lastSalaryAt = new Date();
  return { gold, exp };
}

// Reset the pot record onto a fresh champion. Caller has already
// transferred the previous pot to the new champion.
export function installChampion(pot: any, characterId: any, name: string) {
  pot.championId = characterId;
  pot.championName = name;
  pot.championBecameAt = new Date();
  pot.potAmount = 0;
  pot.potUpdatedAt = new Date();
  pot.lastSalaryAt = new Date();
}
