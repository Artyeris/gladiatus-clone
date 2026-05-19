'use client';

import { ReactNode } from 'react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { calculateCombatStats, effectiveStats } from '@/lib/utils/combatStats';

interface Props {
  character: CharacterInterface | any;
  children: ReactNode;
}

// Breakdown for the player's max HP. Mirrors calculateHP exactly:
//   maxHP = level * 25 + effective_endurance * 2 - 10
// plus any +HP affixes from equipped weapon / armour.
const HealthTooltip = ({ character, children }: Props) => {
  const baseEnd = Number((character as any).endurance ?? 5);
  const level = Number((character as any).level ?? 1);
  const eff = effectiveStats(character);
  const itemEnd = Math.max(0, eff.endurance - baseEnd);

  const hpFromLevel = level * 25;
  const hpFromBaseEnd = baseEnd * 2;
  const hpFromItemEnd = itemEnd * 2;
  const hpConstant = -10;

  let healthFromItems = 0;
  try {
    const c = calculateCombatStats(character);
    healthFromItems = (c as any).healthBonus ?? 0;
  } catch {}

  const total = hpFromLevel + hpFromBaseEnd + hpFromItemEnd + hpConstant + healthFromItems;

  return (
    <HoverCard openDelay={120} closeDelay={0}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className='w-auto p-0 border-none shadow-md z-[9999]'
        side='right'
        align='start'
      >
        <div className='red-card flex flex-col min-w-[260px] px-3 py-2 text-cream2 text-xs gap-1'>
          <div className='flex justify-between gap-4 font-semibold text-sm border-b border-cream2 pb-1 mb-1'>
            <span>Health</span>
            <span className='text-yellow-300'>{total}</span>
          </div>
          <Row label={`Level x 25 (${level})`} value={`+${hpFromLevel}`} />
          <Row label={`Endurance base x 2 (${baseEnd})`} value={`+${hpFromBaseEnd}`} />
          {itemEnd > 0 && (
            <Row label={`Endurance from items x 2 (${itemEnd})`} value={`+${hpFromItemEnd}`} />
          )}
          <Row label='Base constant' value={`${hpConstant}`} />
          {healthFromItems > 0 && (
            <Row label='Flat +HP from weapon / armour' value={`+${healthFromItems}`} />
          )}
          <div className='text-[10px] opacity-80 italic mt-1 border-t border-cream2/40 pt-1'>
            HP formula: level x 25 + endurance x 2 - 10. Item endurance
            bonuses (rings, amulets, gear) and weapon/armour +HP
            affixes stack on top.
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default HealthTooltip;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between gap-4'>
      <span>{label}</span>
      <span className='font-semibold'>{value}</span>
    </div>
  );
}
