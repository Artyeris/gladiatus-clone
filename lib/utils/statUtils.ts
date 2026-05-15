import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import { EQUIPMENT_SLOTS } from '@/lib/utils/equipment';

export type StatId =
  | 'strength'
  | 'endurance'
  | 'agility'
  | 'dexterity'
  | 'intelligence'
  | 'charisma';

export interface StatBreakdown {
  base: number;          // trained value stored on the character
  fromItems: number;     // effective item bonus (capped at maxFromItems)
  rawFromItems: number;  // raw sum of equipped-item bonuses before the cap
  maxFromItems: number;  // how much items can add on top of the base
  total: number;         // base + fromItems (current effective stat)
  max: number;           // base + maxFromItems (cap if every item slot is filled)
}

// Default value of an untrained stat.
const BASE_STAT = 5;

function getEquippedItems(character: CharacterInterface): ItemInterface[] {
  const equipment = (character.equipment ?? {}) as Record<string, unknown>;
  const items: ItemInterface[] = [];

  for (const slot of EQUIPMENT_SLOTS) {
    const cell = equipment[slot];
    if (!cell || typeof cell !== 'object' || !('_id' in (cell as object))) continue;
    items.push(cell as ItemInterface);
  }

  return items;
}

// Per the design rule:
//   - every training point grows max by 2 (the +1 to base plus +1 of headroom)
//   - every level beyond 1 grows max by 4 (the +2 to base allowance plus +2
//     of headroom that items can fill)
// Closed form: max = 2 * base + (level - 1) * 4.
// Examples: base 10 at level 1 -> max 20; base 10 at level 2 -> max 24.
//
// Item bonuses are clamped to maxFromItems so the effective total never
// exceeds the displayed cap (the previous behaviour let +50 on a base-30
// level-4 character read as 80 vs a max of 72).
export function calculateStatBreakdown(
  character: CharacterInterface,
  stat: StatId,
  equippedItems: ItemInterface[] = []
): StatBreakdown {
  const base = ((character[stat] as number | undefined) ?? BASE_STAT);
  const items = equippedItems.length > 0 ? equippedItems : getEquippedItems(character);

  const rawFromItems = items.reduce(
    (sum, item) => sum + ((item?.[stat] as number | undefined) ?? 0),
    0
  );

  const levelBonus = Math.max(((character.level ?? 1) - 1) * 4, 0);
  const max = base * 2 + levelBonus;
  const maxFromItems = Math.max(max - base, 0);
  const fromItems = Math.min(rawFromItems, maxFromItems);
  const total = base + fromItems;

  return {
    base,
    fromItems,
    rawFromItems,
    maxFromItems,
    total,
    max,
  };
}

// Standalone cap used by effectiveStats (which can't import the full
// breakdown for circular-import reasons).
export function statCap(base: number, level: number): number {
  const levelBonus = Math.max((level - 1) * 4, 0);
  return base * 2 + levelBonus;
}
