import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { REAL_MINUTES_PER_GAME_HOUR, WorkJob } from '@/constants/work';

export function baseWorkGoldPerHour(level: number): number {
  return 20 * level + 20;
}

export function jobGoldPerHour(level: number, job: WorkJob): number {
  return Math.floor(baseWorkGoldPerHour(level) * job.goldMultiplier);
}

export function jobGoldReward(level: number, job: WorkJob, gameHours: number): number {
  return jobGoldPerHour(level, job) * gameHours;
}

export function realDurationMinutes(gameHours: number): number {
  return gameHours * REAL_MINUTES_PER_GAME_HOUR;
}

export interface ActiveWork {
  jobId: string;
  hours: number;
  startedAt: string | Date;
  endsAt: string | Date;
}

export function isWorking(character: CharacterInterface): boolean {
  const w = (character as any).currentWork as ActiveWork | null | undefined;
  return !!w && new Date(w.endsAt).getTime() > Date.now();
}

export function workSecondsLeft(character: CharacterInterface): number {
  const w = (character as any).currentWork as ActiveWork | null | undefined;
  if (!w) return 0;
  return Math.max(0, Math.floor((new Date(w.endsAt).getTime() - Date.now()) / 1000));
}
