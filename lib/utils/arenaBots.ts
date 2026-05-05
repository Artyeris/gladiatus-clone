import { ARENA_TIERS, BOTS_PER_TIER, ArenaTier, tierLevelRange } from '@/lib/utils/arena';

const FIRST_NAMES = [
  'Aelius', 'Brutus', 'Cassius', 'Decimus', 'Ennius', 'Flavius', 'Galba',
  'Hostilius', 'Iulius', 'Lucanus', 'Maximus', 'Naevius', 'Octavius',
  'Publius', 'Quintus', 'Rufus', 'Servius', 'Titus', 'Ulpius', 'Varro',
  'Avitus', 'Crispus', 'Fabius', 'Gaius', 'Marcellus', 'Nero', 'Otho',
  'Pertinax', 'Regulus', 'Severus',
];

const SURNAMES = [
  'Magnus', 'Audax', 'Ferox', 'Lupus', 'Aquila', 'Tigris', 'Pugnax',
  'Vorenus', 'Crassus', 'Severus', 'Falx', 'Furor', 'Thrax', 'Murmillo',
  'Spiculus', 'Hermes', 'Verus', 'Priscus',
];

export function botName(rng: () => number): string {
  const a = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const b = SURNAMES[Math.floor(rng() * SURNAMES.length)];
  return `${a} ${b}`;
}

// Stat budget per level: each level grants ~4 trained points + ~6 baseline.
function botStats(level: number, rng: () => number): {
  strength: number; endurance: number; agility: number;
  dexterity: number; intelligence: number; charisma: number;
} {
  const base = 5;
  const trainedTotal = Math.floor(level * 4 + rng() * level);
  // Distribute roughly evenly with some spice.
  const stats = {
    strength: base, endurance: base, agility: base,
    dexterity: base, intelligence: base, charisma: base,
  } as Record<string, number>;
  const keys = Object.keys(stats);
  for (let i = 0; i < trainedTotal; i++) {
    stats[keys[Math.floor(rng() * keys.length)]] += 1;
  }
  return stats as any;
}

// Honor scales with level so bots roughly sort under stronger players in
// their bracket, with a wide spread inside the tier.
function botHonor(level: number, rng: () => number): number {
  return Math.floor(800 + level * 30 + rng() * level * 20);
}

// A small deterministic-ish RNG factory so seeding gives reproducible-ish
// bots per run.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 0) / 0xffffffff;
  };
}

export interface BotPlan {
  name: string;
  level: number;
  arenaTier: string;
  honor: number;
  isBot: true;
  gender: 'male' | 'female';
  strength: number; endurance: number; agility: number;
  dexterity: number; intelligence: number; charisma: number;
  power: number;
  onboarded: true;
}

export function planBotsForTier(tier: ArenaTier, seedOffset = 0): BotPlan[] {
  const count = BOTS_PER_TIER[tier.id] ?? 12;
  const range = tierLevelRange(tier);
  const rng = makeRng(0xC0FFEE ^ tier.id.length ^ seedOffset);
  const plans: BotPlan[] = [];

  for (let i = 0; i < count; i++) {
    const level = Math.max(
      tier.minLevel,
      Math.min(range.max, range.min + Math.floor(rng() * (range.max - range.min + 1))),
    );
    const stats = botStats(level, rng);
    const power =
      stats.strength + stats.endurance + stats.agility +
      stats.dexterity + stats.intelligence + stats.charisma + level * 10;

    plans.push({
      name: botName(rng),
      level,
      arenaTier: tier.id,
      honor: botHonor(level, rng),
      isBot: true,
      gender: rng() < 0.55 ? 'male' : 'female',
      ...stats,
      power,
      onboarded: true,
    });
  }
  return plans;
}

export function planAllBots(): BotPlan[] {
  return ARENA_TIERS.flatMap((tier, i) => planBotsForTier(tier, i));
}
