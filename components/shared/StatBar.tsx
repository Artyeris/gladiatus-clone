'use client';

import { ReactNode } from 'react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { StatBreakdown } from '@/lib/utils/statUtils';

interface StatBarProps {
  statName: string;
  breakdown: StatBreakdown;
  // Layout-only knobs so the same bar fits both Training and Overview rows.
  className?: string;
  trigger?: ReactNode;
}

// Short, gameplay-relevant note for each stat. Kept lowercase-cased to
// match the existing tooltip register.
const STAT_NOTES: Record<string, string> = {
  Strength: 'Adds damage (+1 per 10) and raises your block value.',
  Endurance: 'Raises your maximum health.',
  Agility: 'Lowers the enemy hit chance and helps you avoid critical hits.',
  Dexterity: 'Boosts hit chance, double-hit and critical-hit chance.',
  Charisma: 'Increases your double-hit chance.',
  Intelligence: 'Lowers the enemy double-hit chance.',
};

const StatBar = ({ statName, breakdown, className, trigger }: StatBarProps) => {
  const { base, fromItems, rawFromItems, total, max } = breakdown;

  const fillPercent = max > 0
    ? Math.min((total / max) * 100, 100)
    : 0;

  // The raw item sum can exceed what the cap allows; surface both
  // numbers in the tooltip so the player can tell *why* a +50 ring only
  // pushes the displayed stat by +42.
  const itemsWasted = Math.max(0, rawFromItems - fromItems);

  const bar = trigger ?? (
    <div
      className={`relative h-3 w-full rounded-sm overflow-hidden cursor-help ${className ?? ''}`}
      style={{ backgroundColor: '#3e2714' }}
    >
      <div
        className='absolute top-0 left-0 h-full'
        style={{ width: `${fillPercent}%`, backgroundColor: '#6b8e23' }}
      />
    </div>
  );

  return (
    <HoverCard openDelay={100} closeDelay={0}>
      <HoverCardTrigger asChild>{bar}</HoverCardTrigger>
      <HoverCardContent className='w-auto p-0 border-none shadow-md'>
        <div className='red-card flex flex-col min-w-[210px] px-3 py-2 text-cream2 text-xs gap-1'>
          <div className='flex justify-between gap-4 font-semibold text-sm border-b border-cream2 pb-1 mb-1'>
            <span>{statName}</span>
            <span className='text-yellow-300'>{total}</span>
          </div>
          <span className='flex justify-between gap-4'>
            Basic:
            <span className='font-semibold'>{base}</span>
          </span>
          <span className='flex justify-between gap-4'>
            Maximum:
            <span className='font-semibold'>{max}</span>
          </span>
          <span className='flex justify-between gap-4'>
            From items:
            <span className='font-semibold'>
              +{fromItems}
              {itemsWasted > 0 && (
                <span className='opacity-70 font-normal'> / +{rawFromItems}</span>
              )}
            </span>
          </span>
          {itemsWasted > 0 && (
            <span className='text-[10px] opacity-80 italic'>
              {itemsWasted} item points wasted -- cap reached. Train this stat to unlock more headroom.
            </span>
          )}
          {STAT_NOTES[statName] && (
            <div className='text-[10px] opacity-90 italic mt-1 border-t border-cream2/40 pt-1'>
              {STAT_NOTES[statName]}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default StatBar;
