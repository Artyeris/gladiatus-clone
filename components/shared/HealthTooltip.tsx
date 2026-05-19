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

// Show what builds up the player's max-HP value: base endurance,
// level, item bonuses (separate endurance from items + flat +health
// affixes). Hover anywhere on the Health row to surface it.
const HealthTooltip = ({ character, children }: Props) => {
  const baseEnd = Number((character as any).endurance ?? 5);
  const level = Number((character as any).level ?? 1);
  const eff = effectiveStats(character);
  const itemEnd = Math.max(0, eff.endurance - baseEnd);

  // Re-derive the same numbers calculateHP uses so the breakdown
  // mirrors the displayed total. base 10 hp per endurance + 5 per level.
  const hpFromBaseEnd = baseEnd * 10;
  const hpFromItemEnd = itemEnd * 10;
  const hpFromLevel = level * 5;

  // Flat +health affixes from equipped weapons / armour.
  let healthFromItems = 0;
  try {
    const c = calculateCombatStats(character);
    healthFromItems = (c as any).healthBonus ?? 0;
  } catch {}

  const total = hpFromBaseEnd + hpFromItemEnd + hpFromLevel + healthFromItems;

  return (
    <HoverCard openDelay={120} closeDelay={0}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className='w-auto p-0 border-none shadow-md z-[9999]'
        side='right'
        align='start'
      >
        <div className='red-card flex flex-col min-w-[240px] px-3 py-2 text-cream2 text-xs gap-1'>
          <div className='flex justify-between gap-4 font-semibold text-sm border-b border-cream2 pb-1 mb-1'>
            <span>Health</span>
            <span className='text-yellow-300'>{total}</span>
          </div>
          <Row label={`Endurance base (${baseEnd} x 10)`} value={`+${hpFromBaseEnd}`} />
          {itemEnd > 0 && (
            <Row label={`Endurance from items (${itemEnd} x 10)`} value={`+${hpFromItemEnd}`} />
          )}
          <Row label={`Level (${level} x 5)`} value={`+${hpFromLevel}`} />
          {healthFromItems > 0 && (
            <Row label='Flat +HP from weapon / armour' value={`+${healthFromItems}`} />
          )}
          <div className='text-[10px] opacity-80 italic mt-1 border-t border-cream2/40 pt-1'>
            Endurance contributes 10 HP per point; every level adds 5
            HP. Item stat-bonuses (rings, amulets) and weapon/armour
            +HP affixes stack on top.
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
