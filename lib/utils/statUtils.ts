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
  base: number;
  fromItems: number;
  maxFromItems: number;
  total: number;
}

// Default value of an untrained stat.
const BASE_STAT = 5;

// Each trained point grants +1 to the cap an item can contribute,
// and each level beyond level 1 grants +2 to that cap.
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

  return {
    base,
    fromItems,
    maxFromItems,
    total: base + fromItems,
  };
}
