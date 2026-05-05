// Arena league brackets. Players compete only within their level bracket;
// promotion happens automatically when they hit the next bracket's minLevel.

export interface ArenaTier {
  id: string;
  name: string;
  minLevel: number;
  // null = no upper bound (endgame).
  maxLevel: number | null;
}

export const ARENA_TIERS: ArenaTier[] = [
  { id: 'circus_fighters', name: 'League of the Circus Fighters',     minLevel: 1,   maxLevel: 9   },
  { id: 'show_fights',     name: 'League of the Show Fights',          minLevel: 10,  maxLevel: 19  },
  { id: 'butchers',        name: 'League of the Butchers',             minLevel: 20,  maxLevel: 29  },
  { id: 'pit_fighters',    name: 'League of the Pit Fighters',         minLevel: 30,  maxLevel: 39  },
  { id: 'warriors',        name: 'League of the Warriors',             minLevel: 40,  maxLevel: 49  },
  { id: 'gladiators',      name: 'League of the Gladiators',           minLevel: 50,  maxLevel: 59  },
  { id: 'duel_fighters',   name: 'League of the Duel Fighters',        minLevel: 60,  maxLevel: 69  },
  { id: 'veterans',        name: 'League of the Veterans',             minLevel: 70,  maxLevel: 79  },
  { id: 'legends',         name: 'League of the Grace of the Legends', minLevel: 80,  maxLevel: 89  },
  { id: 'gods_1',          name: 'League of the Grace of the Gods I',  minLevel: 90,  maxLevel: 100 },
  { id: 'gods_2',          name: 'League of the Grace of the Gods II', minLevel: 101, maxLevel: null },
];

// Number of bot rivals seeded per tier. Endgame gets the largest pool.
export const BOTS_PER_TIER: Record<string, number> = {
  circus_fighters: 12,
  show_fights:     14,
  butchers:        14,
  pit_fighters:    14,
  warriors:        16,
  gladiators:      16,
  duel_fighters:   16,
  veterans:        18,
  legends:         18,
  gods_1:          20,
  gods_2:          50,
};

export function getArenaTier(level: number): ArenaTier {
  const t = ARENA_TIERS.find(
    (tier) => level >= tier.minLevel && (tier.maxLevel === null || level <= tier.maxLevel),
  );
  return t ?? ARENA_TIERS[0];
}

// Inclusive level range of a tier, clamped for the open-ended endgame.
export function tierLevelRange(tier: ArenaTier): { min: number; max: number } {
  return { min: tier.minLevel, max: tier.maxLevel ?? tier.minLevel + 19 };
}

export interface ArenaRankReward {
  rank: number;
  goldMultiplier: number;
  victoryPoints: number;
}

export const ARENA_RANK_REWARDS: ArenaRankReward[] = [
  { rank: 20, goldMultiplier: 1.05, victoryPoints: 1  },
  { rank: 10, goldMultiplier: 1.10, victoryPoints: 2  },
  { rank: 5,  goldMultiplier: 1.20, victoryPoints: 5  },
  { rank: 3,  goldMultiplier: 1.35, victoryPoints: 8  },
  { rank: 2,  goldMultiplier: 1.50, victoryPoints: 10 },
  { rank: 1,  goldMultiplier: 2.00, victoryPoints: 20 },
];
