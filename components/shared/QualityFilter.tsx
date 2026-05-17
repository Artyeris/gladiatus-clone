'use client';

import { ItemInterface } from '@/lib/interfaces/item.interface';
import { QUALITY_COLOR } from '@/lib/utils/itemUtils';

// Item quality strings the catalog uses. Plain colour names plus
// "<colour>_plus" upgrade tiers; we display them as e.g. "Green+".
const QUALITIES: NonNullable<ItemInterface['quality']>[] = [
  'common', 'common_plus',
  'green', 'green_plus',
  'blue', 'blue_plus',
  'orange', 'orange_plus',
  'purple', 'purple_plus',
  'red',
];

export type QualityFilterValue = 'all' | NonNullable<ItemInterface['quality']>;

const QUALITY_LABEL: Record<QualityFilterValue, string> = {
  all: 'All',
  common: 'Common',
  common_plus: 'Common+',
  green: 'Green',
  green_plus: 'Green+',
  blue: 'Blue',
  blue_plus: 'Blue+',
  orange: 'Orange',
  orange_plus: 'Orange+',
  purple: 'Purple',
  purple_plus: 'Purple+',
  red: 'Red',
};

interface Props {
  value: QualityFilterValue;
  onChange: (next: QualityFilterValue) => void;
  // Drop quality buttons whose count is 0 - keeps the strip from
  // listing tiers that aren't in the current shop.
  counts?: Partial<Record<QualityFilterValue, number>>;
}

const QualityFilter = ({ value, onChange, counts }: Props) => {
  return (
    <div className='flex flex-wrap items-center gap-1 px-2 py-2 border-b-[2px] border-cream2 bg-cream2/40'>
      <span className='text-xs font-semibold opacity-80 mr-1'>Quality:</span>
      {(['all', ...QUALITIES] as QualityFilterValue[]).map((q) => {
        const active = q === value;
        const count = q === 'all'
          ? Object.values(counts ?? {}).reduce((s, n) => s + (n ?? 0), 0)
          : counts?.[q] ?? 0;
        if (q !== 'all' && counts && count === 0) return null;
        const color = q === 'all' ? '#5c3a21' : QUALITY_COLOR[q as keyof typeof QUALITY_COLOR];
        return (
          <button
            key={q}
            type='button'
            onClick={() => onChange(q)}
            className={`text-xs px-2 py-[2px] rounded-sm border-[2px] font-semibold transition ${
              active ? 'bg-cream2/70' : 'border-transparent hover:bg-cream2/70'
            }`}
            style={{
              color,
              borderColor: active ? color : 'transparent',
            }}
          >
            {QUALITY_LABEL[q]}
            {counts && <span className='opacity-60 font-normal'> ({count})</span>}
          </button>
        );
      })}
    </div>
  );
};

export default QualityFilter;

export function countByQuality(
  items: (ItemInterface | null | undefined)[],
): Partial<Record<QualityFilterValue, number>> {
  const out: Partial<Record<QualityFilterValue, number>> = {};
  for (const it of items) {
    const q = (it?.quality ?? 'common') as QualityFilterValue;
    out[q] = (out[q] ?? 0) + 1;
  }
  return out;
}

export function matchesQuality(
  item: ItemInterface | null | undefined,
  filter: QualityFilterValue,
): boolean {
  if (filter === 'all') return true;
  return (item?.quality ?? 'common') === filter;
}
