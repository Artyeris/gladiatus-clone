'use client';

import { ItemInterface } from '@/lib/interfaces/item.interface';

export type ItemTypeFilterValue = 'all' | NonNullable<ItemInterface['type']>;

const TYPE_LABELS: Record<ItemTypeFilterValue, string> = {
  all: 'All',
  mainHand: 'Weapon',
  offHand: 'Shield',
  head: 'Helmet',
  chest: 'Armor',
  legs: 'Legs',
  gloves: 'Gloves',
  boots: 'Boots',
  cloak: 'Cloak',
  necklace: 'Amulet',
  ring: 'Ring',
};

const TYPE_ORDER: ItemTypeFilterValue[] = [
  'all', 'mainHand', 'offHand', 'head', 'chest',
  'legs', 'gloves', 'boots', 'cloak', 'necklace', 'ring',
];

interface Props {
  value: ItemTypeFilterValue;
  onChange: (next: ItemTypeFilterValue) => void;
  // Optional per-type item counts for the "(N)" suffix.
  counts?: Partial<Record<ItemTypeFilterValue, number>>;
}

const ItemTypeFilter = ({ value, onChange, counts }: Props) => {
  return (
    <div className='flex flex-wrap items-center gap-1 px-2 py-2 border-b-[2px] border-cream2 bg-cream2/40'>
      <span className='text-xs font-semibold opacity-80 mr-1'>Filter:</span>
      {TYPE_ORDER.map((opt) => {
        const active = opt === value;
        const count = opt === 'all'
          ? Object.values(counts ?? {}).reduce((s, n) => s + (n ?? 0), 0)
          : counts?.[opt] ?? 0;
        if (opt !== 'all' && counts && count === 0) return null;
        return (
          <button
            key={opt}
            type='button'
            onClick={() => onChange(opt)}
            className={`text-xs px-2 py-[2px] rounded-sm border-[2px] font-semibold transition ${
              active
                ? 'border-red3 text-red3 bg-cream2/70'
                : 'border-transparent hover:bg-cream2/70'
            }`}
          >
            {TYPE_LABELS[opt]}
            {counts && <span className='opacity-60 font-normal'> ({count})</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ItemTypeFilter;

// Build a per-type tally from a list of items (some may be null). Use to
// drive the (N) badge on the filter buttons.
export function countByType(
  items: (ItemInterface | null | undefined)[],
): Partial<Record<ItemTypeFilterValue, number>> {
  const out: Partial<Record<ItemTypeFilterValue, number>> = {};
  for (const item of items) {
    const t = item?.type as ItemTypeFilterValue | undefined;
    if (!t) continue;
    out[t] = (out[t] ?? 0) + 1;
  }
  return out;
}

export function matchesType(
  item: ItemInterface | null | undefined,
  filter: ItemTypeFilterValue,
): boolean {
  if (filter === 'all') return true;
  return item?.type === filter;
}
