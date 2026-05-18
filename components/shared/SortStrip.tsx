'use client';

export type SortMode =
  | 'default'
  | 'levelAsc' | 'levelDesc'
  | 'priceAsc' | 'priceDesc';

const ALL_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'default',   label: 'Default' },
  { id: 'levelAsc',  label: 'Level ↑' },
  { id: 'levelDesc', label: 'Level ↓' },
  { id: 'priceAsc',  label: 'Price ↑' },
  { id: 'priceDesc', label: 'Price ↓' },
];

interface Props {
  value: SortMode;
  onChange: (next: SortMode) => void;
  // Restrict which sort modes show up. By default all five appear;
  // pass e.g. ['default','levelAsc','levelDesc'] to omit price sorts.
  allow?: SortMode[];
}

const SortStrip = ({ value, onChange, allow }: Props) => {
  const options = allow
    ? ALL_OPTIONS.filter((o) => allow.includes(o.id))
    : ALL_OPTIONS;
  return (
    <div className='flex flex-wrap items-center gap-1 px-2 py-2 border-b-[2px] border-cream2 bg-cream2/40'>
      <span className='text-xs font-semibold opacity-80 mr-1'>Sort:</span>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type='button'
            onClick={() => onChange(opt.id)}
            className={`text-xs px-2 py-[2px] rounded-sm border-[2px] font-semibold transition ${
              active
                ? 'border-red3 text-red3 bg-cream2/70'
                : 'border-transparent hover:bg-cream2/70'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default SortStrip;
