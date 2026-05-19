'use client';

import type { SortMode } from '@/components/shared/SortStrip';

const LABELS: Record<SortMode, string> = {
  default: 'Default',
  levelAsc: 'Level ↑',
  levelDesc: 'Level ↓',
  priceAsc: 'Price ↑',
  priceDesc: 'Price ↓',
};

interface Props {
  value: SortMode;
  onChange: (next: SortMode) => void;
  allow?: SortMode[];
}

const SortDropdown = ({ value, onChange, allow }: Props) => {
  const options = (allow ?? ['default', 'levelAsc', 'levelDesc', 'priceAsc', 'priceDesc'])
    .filter((o, i, arr) => arr.indexOf(o) === i);
  return (
    <label className='flex items-center gap-2 text-xs'>
      <span className='font-semibold opacity-80'>Sort:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortMode)}
        className='fancy-select text-xs'
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{LABELS[opt]}</option>
        ))}
      </select>
    </label>
  );
};

export default SortDropdown;
