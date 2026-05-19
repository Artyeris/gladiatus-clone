'use client';

import type { QualityFilterValue } from '@/components/shared/QualityFilter';
import { QUALITY_COLOR } from '@/lib/utils/itemUtils';

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

const ORDER: QualityFilterValue[] = [
  'all',
  'common', 'common_plus',
  'green', 'green_plus',
  'blue', 'blue_plus',
  'orange', 'orange_plus',
  'purple', 'purple_plus',
  'red',
];

interface Props {
  value: QualityFilterValue;
  onChange: (next: QualityFilterValue) => void;
  counts?: Partial<Record<QualityFilterValue, number>>;
}

const QualityDropdown = ({ value, onChange, counts }: Props) => {
  const color = value === 'all' ? '#5c3a21' : QUALITY_COLOR[value as keyof typeof QUALITY_COLOR];
  return (
    <label className='flex items-center gap-2 text-xs'>
      <span className='font-semibold opacity-80'>Quality:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as QualityFilterValue)}
        className='fancy-select text-xs'
        style={{ color, fontWeight: 700 }}
      >
        {ORDER.map((opt) => {
          const count = opt === 'all'
            ? Object.values(counts ?? {}).reduce((s, n) => s + (n ?? 0), 0)
            : counts?.[opt] ?? 0;
          if (opt !== 'all' && counts && count === 0) return null;
          const optColor = opt === 'all'
            ? '#5c3a21'
            : QUALITY_COLOR[opt as keyof typeof QUALITY_COLOR];
          return (
            <option
              key={opt}
              value={opt}
              style={{ color: optColor, fontWeight: 700, background: '#fbf2d6' }}
            >
              {QUALITY_LABEL[opt]}{counts ? ` (${count})` : ''}
            </option>
          );
        })}
      </select>
    </label>
  );
};

export default QualityDropdown;
