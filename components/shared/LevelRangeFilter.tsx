'use client';

interface Props {
  min: string;
  max: string;
  onMinChange: (s: string) => void;
  onMaxChange: (s: string) => void;
}

const LevelRangeFilter = ({ min, max, onMinChange, onMaxChange }: Props) => (
  <label className='flex items-center gap-2 text-xs'>
    <span className='font-semibold opacity-80'>Level:</span>
    <input
      type='number'
      min={1}
      value={min}
      onChange={(e) => onMinChange(e.target.value)}
      placeholder='min'
      className='border border-brown2 px-2 py-[2px] rounded-sm w-14 bg-cream-card tabular-nums'
    />
    <span className='opacity-60'>-</span>
    <input
      type='number'
      min={1}
      value={max}
      onChange={(e) => onMaxChange(e.target.value)}
      placeholder='max'
      className='border border-brown2 px-2 py-[2px] rounded-sm w-14 bg-cream-card tabular-nums'
    />
    {(min !== '' || max !== '') && (
      <button
        type='button'
        onClick={() => { onMinChange(''); onMaxChange(''); }}
        className='text-xs font-semibold underline text-red3'
      >
        clear
      </button>
    )}
  </label>
);

export default LevelRangeFilter;
