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
  breakdown?: any;
  power: number;
}

// Read-only mercenary stat panel. Reads from `merc.breakdown` (rolled
// stats + equipped item bonuses + dungeon stats) when present, falling
// back to the raw `stats` for older mercs without a breakdown.
const MercenaryPanel = ({ merc }: { merc: MercForOverview }) => {
  const b = merc.breakdown ?? merc.stats ?? {};
  const damageRange = `${b.damageMin ?? 0} - ${b.damageMax ?? 0}`;
  const health = b.health ?? merc.stats?.health ?? 0;

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
        style={{ height: '230px', backgroundColor: '#3e2714' }}
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
            <CompactNumber value={health} /> / <CompactNumber value={health} />
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
        <StatLine label='Strength'     value={b.strength ?? 0} />
        <StatLine label='Dexterity'    value={b.dexterity ?? 0} />
        <StatLine label='Agility'      value={b.agility ?? 0} />
        <StatLine label='Endurance'    value={b.endurance ?? 0} />
        <StatLine label='Charisma'     value={b.charisma ?? 0} />
        <StatLine label='Intelligence' value={b.intelligence ?? 0} last />
      </div>

      <div className='brown-card w-full rounded-sm flex flex-col text-sm'>
        <StatLine label='Armor'  value={b.armor ?? 0} />
        <StatLine label='Damage' valueLabel={damageRange} />
        {/* Role-specific dungeon stats. Healing is now active in combat
            for healers; threat / hardening surface for tanks. */}
        {merc.type === 'healer' && <StatLine label='Healing'           value={b.healing ?? 0} />}
        {merc.type === 'healer' && (b.criticalHealing ?? 0) > 0 && (
          <StatLine label='Crit Healing' value={b.criticalHealing ?? 0} />
        )}
        {merc.type === 'tank' && (b.threat ?? 0) > 0 && (
          <StatLine label='Threat'    value={b.threat ?? 0} />
        )}
        {merc.type === 'tank' && (b.hardening ?? 0) > 0 && (
          <StatLine label='Hardening' value={b.hardening ?? 0} />
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
