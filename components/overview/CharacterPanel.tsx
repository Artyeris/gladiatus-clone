import Image from 'next/image';

import StatBar from '@/components/shared/StatBar';
import { stats } from '@/constants';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import { calculateNextLevelExperience } from '@/lib/utils';
import { EQUIPMENT_SLOTS } from '@/lib/utils/equipment';
import {
  calculateStatBreakdown,
  StatBreakdown,
  StatId,
} from '@/lib/utils/statUtils';

function equippedItems(user: CharacterInterface): ItemInterface[] {
  const equipment = (user.equipment ?? {}) as Record<string, unknown>;
  const items: ItemInterface[] = [];
  for (const slot of EQUIPMENT_SLOTS) {
    const cell = equipment[slot];
    if (cell && typeof cell === 'object' && '_id' in (cell as object)) {
      items.push(cell as ItemInterface);
    }
  }
  return items;
}

function combatTotals(user: CharacterInterface) {
  const items = equippedItems(user);
  let armor = 0;
  let damageMin = 0;
  let damageMax = 0;
  for (const item of items) {
    armor += item.armor ?? 0;
    if (item.damage && item.damage.length === 2) {
      damageMin += item.damage[0];
      damageMax += item.damage[1];
    }
  }
  // Strength contributes a bit of damage even bare-handed.
  const strBonus = Math.floor((user.strength ?? 5) / 2);
  damageMin += strBonus;
  damageMax += strBonus;
  return { armor, damageMin, damageMax };
}

interface CharacterPanelProps {
  user: CharacterInterface;
}

function avatarLevelBucket(level: number): number {
  if (level > 80) return 80;
  return Math.floor(level / 10) * 10;
}

export default function CharacterPanel({ user }: CharacterPanelProps) {
  const level = user.level || 1;
  const gender = user.gender || 'male';
  const avatarUrl = `/characters/${gender}/character-lvl-${avatarLevelBucket(level)}.jpg`;

  const maxHealth = (user.endurance || 5) * 10 + level * 5;
  const currentHealth = (user as any).health || maxHealth;
  const healthPercent = Math.min((currentHealth / maxHealth) * 100, 100);

  const experience = user.experience || 0;
  const xpForNextLevel = calculateNextLevelExperience(level);
  const xpPercent = xpForNextLevel > 0
    ? Math.min((experience / xpForNextLevel) * 100, 100)
    : 0;

  return (
    <div className='flex flex-col items-center gap-3 p-4 text-brown2'>

      <h2 className='red-card font-semibold text-cream2 text-center w-full px-4 py-1 truncate drop-shadow-md'>
        {user.name}
      </h2>

      <Image
        src={avatarUrl}
        alt='Character avatar'
        width={168}
        height={194}
        className='drop-shadow-xl'
      />

      <div className='w-full flex justify-between text-sm font-semibold'>
        <span>Level</span>
        <span className='text-red3'>{level}</span>
      </div>

      <div className='w-full'>
        <div className='flex justify-between text-xs font-semibold mb-1'>
          <span>Health</span>
          <span>{currentHealth} / {maxHealth}</span>
        </div>
        <div className='relative h-3 rounded-sm overflow-hidden' style={{ backgroundColor: '#3e2714' }}>
          <div
            className='absolute top-0 left-0 h-full'
            style={{ width: `${healthPercent}%`, backgroundColor: '#a32626' }}
          />
        </div>
      </div>

      <div className='w-full'>
        <div className='flex justify-between text-xs font-semibold mb-1'>
          <span>Experience</span>
          <span>{experience} / {xpForNextLevel} ({xpPercent.toFixed(1)}%)</span>
        </div>
        <div className='relative h-3 rounded-sm overflow-hidden' style={{ backgroundColor: '#3e2714' }}>
          <div
            className='absolute top-0 left-0 h-full'
            style={{ width: `${xpPercent}%`, backgroundColor: '#d4af37' }}
          />
        </div>
      </div>

      <div className='brown-card w-full rounded-sm flex flex-col text-sm'>
        {stats.map((stat, index) => {
          const breakdown = calculateStatBreakdown(user, stat.id as StatId);
          return (
            <StatRow
              key={stat.id}
              label={stat.name}
              breakdown={breakdown}
              last={index === stats.length - 1}
            />
          );
        })}
      </div>

      <CombatRows user={user} />
    </div>
  );
}

function CombatRows({ user }: { user: CharacterInterface }) {
  const { armor, damageMin, damageMax } = combatTotals(user);

  return (
    <div className='brown-card w-full rounded-sm flex flex-col text-sm'>
      <div className='flex items-center justify-between gap-2 px-2 py-1 border-b-[3px] border-cream2'>
        <span className='w-[72px] shrink-0'>Armor</span>
        <span className='font-semibold text-red3'>{armor}</span>
      </div>
      <div className='flex items-center justify-between gap-2 px-2 py-1'>
        <span className='w-[72px] shrink-0'>Damage</span>
        <span className='font-semibold text-red3'>{damageMin} - {damageMax}</span>
      </div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  breakdown: StatBreakdown;
  last?: boolean;
}

function StatRow({ label, breakdown, last = false }: StatRowProps) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 ${
        !last && 'border-b-[3px] border-cream2'
      }`}
    >
      <span className='w-[72px] shrink-0'>{label}</span>
      <div className='flex-1 min-w-0'>
        <StatBar statName={label} breakdown={breakdown} />
      </div>
      <span className='font-semibold text-red3 w-7 text-right shrink-0'>
        {breakdown.total}
      </span>
    </div>
  );
}
