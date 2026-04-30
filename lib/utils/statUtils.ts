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
const DEFAULT_VISUAL_MAX = 20;

function getUniqueCharacterItems(character: CharacterInterface): ItemInterface[] {
  const inventory = character.inventory || [];
  const seen = new Set<string>();
  const items: ItemInterface[] = [];

  for (const row of inventory) {
    for (const cell of row) {
      if (!cell || typeof cell !== 'object' || !('_id' in cell)) continue;

      const item = cell as ItemInterface;
      const id = String(item._id);

      if (seen.has(id)) continue;

      seen.add(id);
      items.push(item);
    }
  }

  return items;
}

// Each trained point adds +1 to max headroom (on top of also raising base by 1),
// and each level beyond 1 adds +2 to max headroom. So a stat trained N times
// at level L has max = base + N + (L - 1) * 2.
export function calculateStatBreakdown(
  character: CharacterInterface,
  stat: StatId,
  equippedItems: ItemInterface[] = []
): StatBreakdown {
  const base = ((character[stat] as number | undefined) ?? BASE_STAT);
  const items = equippedItems.length > 0 ? equippedItems : getUniqueCharacterItems(character);

  const fromItems = items.reduce(
    (sum, item) => sum + ((item?.[stat] as number | undefined) ?? 0),
    0
  );

  const trainedPoints = Math.max(base - BASE_STAT, 0);
  const levelBonus = Math.max(((character.level ?? 1) - 1) * 2, 0);
  const maxFromItems = trainedPoints + levelBonus;
  const total = base + fromItems;
  const max = Math.max(base + maxFromItems, base + fromItems, DEFAULT_VISUAL_MAX);

  return {
    base,
    fromItems,
    maxFromItems,
    total,
    max,
  };
}
