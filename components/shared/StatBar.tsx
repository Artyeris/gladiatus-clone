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

const StatBar = ({ statName, breakdown, className, trigger }: StatBarProps) => {
  const { base, fromItems, maxFromItems, total } = breakdown;

  const fillPercent = maxFromItems > 0
    ? Math.min((fromItems / maxFromItems) * 100, 100)
    : 0;

  const bar = trigger ?? (
    <div
      className={`relative h-2 rounded-sm bg-black/30 overflow-hidden cursor-help ${className ?? ''}`}
    >
      <div
        className='absolute top-0 left-0 h-full bg-green-700'
        style={{ width: `${fillPercent}%` }}
      />
    </div>
  );

  return (
    <HoverCard openDelay={100} closeDelay={0}>
      <HoverCardTrigger asChild>{bar}</HoverCardTrigger>
      <HoverCardContent className='w-auto p-0 border-none shadow-md'>
        <div className='red-card flex flex-col min-w-[180px] px-3 py-2 text-cream2 text-xs gap-1'>
          <span className='font-semibold text-sm border-b border-cream2 pb-1 mb-1'>
            {statName}
          </span>
          <span className='flex justify-between gap-4'>
            Base:
            <span className='font-semibold'>{base}</span>
          </span>
          <span className='flex justify-between gap-4'>
            Maximum:
            <span className='font-semibold'>{total}</span>
          </span>
          <span className='flex justify-between gap-4'>
            From items:
            <span className='font-semibold'>
              +{fromItems} of +{maxFromItems}
            </span>
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default StatBar;
