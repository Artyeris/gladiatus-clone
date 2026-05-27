import Image from 'next/image';

import StatBar from '@/components/shared/StatBar';
import CompactNumber from '@/components/shared/CompactNumber';

const QUALITY_COLOR: Record<string, string> = {
  green:  '#3b9b3b',
  blue:   '#3b6bb5',
  purple: '#9333ea',
  orange: '#d97706',
  red:    '#dc2626',
};
const QUALITY_LABEL: Record<string, string> = {
  green: 'Green', blue: 'Blue', purple: 'Purple', orange: 'Orange', red: 'Red',
};
const ROLE_LABEL: Record<string, string> = {
  tank: 'Tank', healer: 'Healer', damage: 'Damage',
};
const ROLE_AVATAR: Record<string, string> = {
  tank:   '/images/expedition.webp',
  healer: '/images/arena.webp',
  damage: '/images/fight.png',
};

interface MercForOverview {
  _id: string;
  templateId: string;
  name: string;
  type: 'tank' | 'healer' | 'damage';
  level: number;
  quality: string;
  stats: any;
  power: number;
}

// Read-only mercenary stat panel mirroring CharacterPanel's layout
// shape (name banner -> portrait -> level -> health -> stats grid).
// Mercenary equipment slots come in a later phase; for now the
// right-side card on the page shows a "coming soon" placeholder.
const MercenaryPanel = ({ merc }: { merc: MercForOverview }) => {
  const s = merc.stats ?? {};
  const maxHealth = s.health ?? 0;
  const damageRange = `${s.damageMin ?? 0} - ${s.damageMax ?? 0}`;

  return (
    <div className='flex flex-col items-center gap-3 p-4 text-brown2'>
      <h2 className='red-card font-semibold text-cream2 text-center w-full px-4 py-1 truncate drop-shadow-md'>
        {merc.name}{' '}
        <span style={{ color: QUALITY_COLOR[merc.quality] }}>
          ({QUALITY_LABEL[merc.quality]})
        </span>
      </h2>

      <div
        className='w-full flex items-center justify-center rounded-sm drop-shadow-xl border-[2px] border-cream2'
        style={{
          height: '230px',
          backgroundColor: '#3e2714',
        }}
      >
        <Image
          src={ROLE_AVATAR[merc.type]}
          alt={merc.type}
          width={140}
          height={140}
          style={{ width: '140px', height: '140px', objectFit: 'contain' }}
        />
      </div>

      <div className='w-full flex justify-between text-sm font-semibold'>
        <span>Role</span>
        <span className='text-red3'>{ROLE_LABEL[merc.type]}</span>
      </div>

      <div className='w-full flex justify-between text-sm font-semibold'>
        <span>Level</span>
        <span className='text-red3'>{merc.level}</span>
      </div>

      <div className='w-full'>
        <div className='flex justify-between text-xs font-semibold mb-1'>
          <span>Health</span>
          <span>
            <CompactNumber value={maxHealth} /> / <CompactNumber value={maxHealth} />
          </span>
        </div>
        <div className='relative h-3 rounded-sm overflow-hidden' style={{ backgroundColor: '#3e2714' }}>
          <div
            className='absolute top-0 left-0 h-full'
            style={{ width: '100%', backgroundColor: '#a32626' }}
          />
        </div>
      </div>

      <div className='brown-card w-full rounded-sm flex flex-col text-sm'>
        <StatLine label='Strength'     value={s.strength ?? 0} />
        <StatLine label='Dexterity'    value={s.dexterity ?? 0} />
        <StatLine label='Agility'      value={s.agility ?? 0} />
        <StatLine label='Endurance'    value={s.endurance ?? 0} />
        <StatLine label='Charisma'     value={s.charisma ?? 0} />
        <StatLine label='Intelligence' value={s.intelligence ?? 0} last />
      </div>

      <div className='brown-card w-full rounded-sm flex flex-col text-sm'>
        <StatLine label='Armor'  value={s.armor ?? 0} />
        <StatLine label='Damage' valueLabel={damageRange} />
        {merc.type === 'healer' && (
          <StatLine label='Healing' value={s.healing ?? 0} />
        )}
        <StatLine label='Power' value={merc.power} last />
      </div>
    </div>
  );
};

export default MercenaryPanel;

function StatLine({
  label, value, valueLabel, last,
}: {
  label: string;
  value?: number;
  valueLabel?: string;
  last?: boolean;
}) {
  // Pure decorative bar matching the player StatBar look -- merc
  // stats aren't split by source (no item bonuses yet), so the bar
  // just shows total / total.
  const v = value ?? 0;
  return (
    <div className={`flex items-center gap-2 px-2 py-1 ${!last && 'border-b-[3px] border-cream2'}`}>
      <span className='w-[88px] shrink-0'>{label}</span>
      {value !== undefined && (
        <div className='flex-1 min-w-0'>
          <StatBar
            statName={label}
            breakdown={{ total: v, base: v, fromItems: 0, byItem: [] } as any}
          />
        </div>
      )}
      <span className='font-semibold text-red3 ml-auto text-right shrink-0'>
        {valueLabel ?? <CompactNumber value={v} />}
      </span>
    </div>
  );
}
