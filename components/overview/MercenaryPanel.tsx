import Image from 'next/image';

import StatBar from '@/components/shared/StatBar';
import CompactNumber from '@/components/shared/CompactNumber';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { MercBreakdown } from '@/lib/utils/mercenaryBreakdown';

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

// Mercenary panel portraits reuse the player-style portraits so a
// mercenary looks like a real fighter instead of a placeholder icon.
// Mapping is per-template-id; templates without a custom portrait
// fall back to the player male portrait at the merc's level bucket.
const TEMPLATE_PORTRAIT: Record<string, string> = {
  samnit:      '/characters/male/character-lvl-30.jpg',
  murmillo:    '/characters/male/character-lvl-40.jpg',
  thracian:    '/characters/male/character-lvl-20.jpg',
  hoplomachus: '/characters/male/character-lvl-50.jpg',
  medicus:     '/characters/male/character-lvl-60.jpg',
};

function portraitLevelBucket(level: number): number {
  if (level > 80) return 80;
  return Math.floor(level / 10) * 10;
}

interface MercForOverview {
  _id: string;
  templateId: string;
  name: string;
  type: 'tank' | 'healer' | 'damage';
  level: number;
  quality: string;
  stats: any;
  breakdown?: MercBreakdown;
  power: number;
}

// Read-only mercenary stat panel. Layout mirrors CharacterPanel so a
// merc tab looks like a real fighter card -- proper portrait, the
// same StatBar with base/items breakdown, the same combat rows.
const MercenaryPanel = ({ merc }: { merc: MercForOverview }) => {
  const b = merc.breakdown;
  const health = b?.health ?? merc.stats?.health ?? 0;
  const damageRange = b ? `${b.damageMin} - ${b.damageMax}` : '?';
  const portrait =
    TEMPLATE_PORTRAIT[merc.templateId] ??
    `/characters/male/character-lvl-${portraitLevelBucket(merc.level)}.jpg`;

  return (
    <div className='flex flex-col items-center gap-3 p-4 text-brown2'>
      <h2 className='red-card font-semibold text-cream2 text-center w-full px-4 py-1 truncate drop-shadow-md'>
        {merc.name}{' '}
        <span style={{ color: QUALITY_COLOR[merc.quality] }}>
          ({QUALITY_LABEL[merc.quality]})
        </span>
      </h2>

      <Image
        src={portrait}
        alt={merc.name}
        width={230}
        height={266}
        className='drop-shadow-xl rounded-sm'
      />

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
          <div className='absolute top-0 left-0 h-full' style={{ width: '100%', backgroundColor: '#a32626' }} />
        </div>
      </div>

      <div className='brown-card w-full rounded-sm flex flex-col text-sm'>
        <StatRow label='Strength'     split={b?.stats.strength} />
        <StatRow label='Dexterity'    split={b?.stats.dexterity} />
        <StatRow label='Agility'      split={b?.stats.agility} />
        <StatRow label='Endurance'    split={b?.stats.endurance} />
        <StatRow label='Charisma'     split={b?.stats.charisma} />
        <StatRow label='Intelligence' split={b?.stats.intelligence} last />
      </div>

      <div className='brown-card w-full rounded-sm flex flex-col text-sm'>
        <FlatRow
          label='Armor'
          value={b?.armor ?? 0}
          tooltip={
            <>
              <div className='flex justify-between gap-4'>
                <span>Source:</span>
                <span>equipped pieces</span>
              </div>
              <div className='text-[10px] opacity-80 italic mt-1'>
                Armour only comes from armour items. Equip helmets,
                chest, legs, cloak, gloves and boots to raise it.
              </div>
            </>
          }
        />
        <FlatRow
          label='Damage'
          valueLabel={damageRange}
          tooltip={
            b && (
              <>
                <div className='flex justify-between gap-4'>
                  <span>{b.hasWeapon ? 'From weapon' : 'Bare hands'}</span>
                  <span>{b.weaponMin} - {b.weaponMax}</span>
                </div>
                <div className='flex justify-between gap-4'>
                  <span>From strength</span>
                  <span>+{b.strDamageBonus}</span>
                </div>
                <div className='text-[10px] opacity-80 italic mt-1'>
                  Damage = weapon (or bare hands) + strength / 10 (only
                  applied bare-handed) + any rolled damage affixes.
                </div>
              </>
            )
          }
        />
        {merc.type === 'healer' && (
          <FlatRow
            label='Healing'
            value={b?.healing ?? 0}
            tooltip={
              b && (
                <>
                  <div className='flex justify-between gap-4'>
                    <span>Base seed</span>
                    <span>{b.healingBase}</span>
                  </div>
                  <div className='flex justify-between gap-4'>
                    <span>From items</span>
                    <span>+{b.healingFromItems}</span>
                  </div>
                  <div className='text-[10px] opacity-80 italic mt-1'>
                    Healing fires once per dungeon step between fights.
                  </div>
                </>
              )
            }
          />
        )}
        {merc.type === 'tank' && (b?.threat ?? 0) > 0 && (
          <FlatRow label='Threat' value={b?.threat ?? 0} />
        )}
        {merc.type === 'tank' && (b?.hardening ?? 0) > 0 && (
          <FlatRow label='Hardening' value={b?.hardening ?? 0} />
        )}
        <FlatRow label='Power' value={merc.power} last />
      </div>
    </div>
  );
};

export default MercenaryPanel;

function StatRow({
  label, split, last,
}: {
  label: string;
  split?: { base: number; fromItems: number; total: number };
  last?: boolean;
}) {
  const s = split ?? { base: 0, fromItems: 0, total: 0 };
  // Mercenaries have no training cap; max = total + a small headroom
  // so the bar reads "mostly full" if items contribute heavily.
  const max = Math.max(1, s.total + Math.max(0, s.fromItems));
  return (
    <div className={`flex items-center gap-2 px-2 py-1 ${!last && 'border-b-[3px] border-cream2'}`}>
      <span className='w-[88px] shrink-0'>{label}</span>
      <div className='flex-1 min-w-0'>
        <StatBar
          statName={label}
          breakdown={{
            base: s.base,
            fromItems: s.fromItems,
            rawFromItems: s.fromItems,
            total: s.total,
            max,
            byItem: [],
          } as any}
        />
      </div>
      <span className='font-semibold text-red3 ml-auto text-right shrink-0'>
        <CompactNumber value={s.total} />
      </span>
    </div>
  );
}

function FlatRow({
  label, value, valueLabel, tooltip, last,
}: {
  label: string;
  value?: number;
  valueLabel?: string;
  tooltip?: React.ReactNode;
  last?: boolean;
}) {
  const v = value ?? 0;
  const bar = (
    <div className='relative h-3 w-full rounded-sm overflow-hidden cursor-help' style={{ backgroundColor: '#3e2714' }}>
      <div className='absolute top-0 left-0 h-full' style={{ width: '100%', backgroundColor: '#6b8e23' }} />
    </div>
  );
  const row = (
    <div className={`flex items-center gap-2 px-2 py-1 ${!last && 'border-b-[3px] border-cream2'}`}>
      <span className='w-[88px] shrink-0'>{label}</span>
      <div className='flex-1 min-w-0'>{bar}</div>
      <span className='font-semibold text-red3 ml-auto text-right shrink-0'>
        {valueLabel ?? <CompactNumber value={v} />}
      </span>
    </div>
  );
  if (!tooltip) return row;
  return (
    <HoverCard openDelay={100} closeDelay={0}>
      <HoverCardTrigger asChild>{row}</HoverCardTrigger>
      <HoverCardContent className='w-auto p-0 border-none shadow-md'>
        <div className='red-card flex flex-col min-w-[210px] px-3 py-2 text-cream2 text-xs gap-1'>
          <div className='flex justify-between gap-4 font-semibold text-sm border-b border-cream2 pb-1 mb-1'>
            <span>{label}</span>
            <span className='text-yellow-300'>{valueLabel ?? v}</span>
          </div>
          {tooltip}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
