// Work job catalog. Hourly gold is 20 * level + 20 multiplied by the job's
// goldMultiplier. SERVER_SPEED controls how compressed in-game hours are
// against real time -- 1 means a 1-hour job takes a real hour.

export interface WorkJob {
  id: string;
  name: string;
  description: string;
  image: string;
  goldMultiplier: number;
  minHours: number;
  maxHours: number;
  possibleRewards?: string[];
  // Premium gem cost to start this job (placeholder for future premium UI).
  premiumCost?: number;
}

export const SERVER_SPEED = 1;

// One real minute corresponds to SERVER_SPEED minutes of in-game time, so a
// 1-hour job ends after 60 / SERVER_SPEED real minutes (1 real hour at 1x).
export const REAL_MINUTES_PER_GAME_HOUR = 60 / SERVER_SPEED;

export const WORK_JOBS: WorkJob[] = [
  {
    id: 'senator',
    name: 'Senator',
    description: 'Plead and barter in the curia for the wealthy elite.',
    image: 'work-senator',
    goldMultiplier: 1.25,
    minHours: 1,
    maxHours: 24,
    possibleRewards: ['Rare Delicacy'],
    premiumCost: 3,
  },
  {
    id: 'jeweller',
    name: 'Jeweller',
    description: 'Polish gems for the patricians; rare jewels surface now and then.',
    image: 'work-jeweller',
    goldMultiplier: 1.1,
    minHours: 1,
    maxHours: 24,
    possibleRewards: ['Polished Gem'],
    premiumCost: 3,
  },
  {
    id: 'stable_boy',
    name: 'Stable Boy',
    description: 'Tend the racing horses. Steady, simple, gold-only work.',
    image: 'work-stable',
    goldMultiplier: 1.0,
    minHours: 1,
    maxHours: 8,
  },
  {
    id: 'farmer',
    name: 'Farmer',
    description: 'Work the fields. Lower wage, but produce sometimes finds its way into your pack.',
    image: 'work-farmer',
    goldMultiplier: 0.85,
    minHours: 1,
    maxHours: 6,
    possibleRewards: ['Apple', 'Banana', 'Cheese'],
  },
  {
    id: 'butcher',
    name: 'Butcher',
    description: 'Cleave and trim cuts at the city market. Short shifts, meaty bonuses.',
    image: 'work-butcher',
    goldMultiplier: 0.9,
    minHours: 1,
    maxHours: 3,
    possibleRewards: ['Steak', 'Chicken', 'Lamb Leg'],
  },
  {
    id: 'fisherman',
    name: 'Fisherman',
    description: 'Cast nets along the harbour. Long shifts, but the catch can be valuable.',
    image: 'work-fisherman',
    goldMultiplier: 0.95,
    minHours: 4,
    maxHours: 10,
    possibleRewards: ['Fish'],
  },
  {
    id: 'baker',
    name: 'Baker',
    description: 'Knead bread before dawn. Quick shifts, hearth-fresh extras.',
    image: 'work-baker',
    goldMultiplier: 0.9,
    minHours: 1,
    maxHours: 4,
    possibleRewards: ['Bread', 'Cake'],
  },
];

export function findJob(id: string): WorkJob | undefined {
  return WORK_JOBS.find((j) => j.id === id);
}
