import Image from 'next/image';

import StatBar from '@/components/shared/StatBar';
import { stats } from '@/constants';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import {
  calculateStatBreakdown,
  StatBreakdown,
  StatId,
} from '@/lib/utils/statUtils';

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
