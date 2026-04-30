import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';

export type StatId =
  | 'strength'
  | 'endurance'
  | 'agility'
  | 'dexterity'
  | 'intelligence'
  | 'charisma';

export interface StatBreakdown {
  base: number;        // trained value stored on the character
  fromItems: number;   // current sum of equipped-item bonuses for this stat
  maxFromItems: number; // how much items can still add on top of the base
  total: number;       // base + fromItems (current effective stat)
  max: number;         // base + maxFromItems (cap if every item slot is filled)
}

// Default value of an untrained stat.
const BASE_STAT = 5;

// Each trained point adds +1 to max headroom (on top of also raising base by 1),
// and each level beyond 1 adds +2 to max headroom. So a stat trained N times
// at level L has max = base + N + (L - 1) * 2.
export function calculateStatBreakdown(
  character: CharacterInterface,
  stat: StatId,
  equippedItems: ItemInterface[] = []
): StatBreakdown {
  const base = ((character[stat] as number | undefined) ?? BASE_STAT);

  const fromItems = equippedItems.reduce(
    (sum, item) => sum + ((item?.[stat] as number | undefined) ?? 0),
    0
  );

  const trainedPoints = Math.max(base - BASE_STAT, 0);
  const levelBonus = Math.max(((character.level ?? 1) - 1) * 2, 0);
  const maxFromItems = trainedPoints + levelBonus;
  const total = base + fromItems;
  const max = base + maxFromItems;

  return {
    base,
    fromItems,
    maxFromItems,
    total,
    max,
  };
}
