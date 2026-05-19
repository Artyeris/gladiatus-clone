'use client';

import type { ItemTypeFilterValue } from '@/components/shared/ItemTypeFilter';

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
  counts?: Partial<Record<ItemTypeFilterValue, number>>;
}

// Compact dropdown version of ItemTypeFilter, used by Market and
// Auction so the three filter rows (type / quality / sort) fit
// into a single horizontal strip.
const ItemTypeDropdown = ({ value, onChange, counts }: Props) => {
  return (
    <label className='flex items-center gap-2 text-xs'>
      <span className='font-semibold opacity-80'>Type:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ItemTypeFilterValue)}
        className='fancy-select text-xs'
      >
        {TYPE_ORDER.map((opt) => {
          const count = opt === 'all'
            ? Object.values(counts ?? {}).reduce((s, n) => s + (n ?? 0), 0)
            : counts?.[opt] ?? 0;
          if (opt !== 'all' && counts && count === 0) return null;
          return (
            <option key={opt} value={opt}>
              {TYPE_LABELS[opt]}{counts ? ` (${count})` : ''}
            </option>
          );
        })}
      </select>
    </label>
  );
};

export default ItemTypeDropdown;
