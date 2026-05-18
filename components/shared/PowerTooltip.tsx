'use client';

import { ReactNode } from 'react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { calculatePower } from '@/lib/utils/characterUtils';
import { effectiveStats } from '@/lib/utils/combatStats';
import { stats } from '@/constants';

interface Props {
  character: CharacterInterface;
  children: ReactNode;
}

// Show the maths behind the Power Rank number on hover: level
// contribution (level x 10) plus each stat's effective value (which
// already folds in equipment bonuses). Weapon and armour show up
// here as the stat-bonuses they grant, since Power itself is just
// level + sum(stats).
const PowerTooltip = ({ character, children }: Props) => {
  const eff = effectiveStats(character);
  const level = character.level ?? 1;
  const levelContribution = level * 10;
  const total = calculatePower(character);

  const baseStat = (id: string) => Number((character as any)[id] ?? 5);

  return (
    <HoverCard openDelay={120} closeDelay={0}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className='w-auto p-0 border-none shadow-md'
        side='right'
        align='start'
      >
        <div className='red-card flex flex-col min-w-[230px] px-3 py-2 text-cream2 text-xs gap-1'>
          <div className='flex justify-between gap-4 font-semibold text-sm border-b border-cream2 pb-1 mb-1'>
            <span>Power Rank</span>
            <span className='text-yellow-300'>{total}</span>
          </div>

          <Row label={`Level x 10 (${level})`} value={`+${levelContribution}`} />

          {stats.map((stat) => {
            const base = baseStat(stat.id);
            const effVal = (eff as any)[stat.id] as number;
            const fromItems = effVal - base;
            return (
              <Row
                key={stat.id}
                label={stat.name}
                value={
                  fromItems > 0
                    ? `+${base} (+${fromItems})`
                    : fromItems < 0
                      ? `+${base} (${fromItems})`
                      : `+${base}`
                }
                hint={fromItems !== 0 ? `${base} base, ${fromItems > 0 ? '+' : ''}${fromItems} from items` : undefined}
              />
            );
          })}

          <div className='text-[10px] opacity-80 italic mt-1 border-t border-cream2/40 pt-1'>
            Item bonuses come from equipped weapon, armour, rings and
            amulets - they show as the +N on each stat row above.
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default PowerTooltip;

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className='flex justify-between gap-4' title={hint}>
      <span>{label}</span>
      <span className='font-semibold'>{value}</span>
    </div>
  );
}
