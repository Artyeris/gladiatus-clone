'use client';

import { ReactNode } from 'react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { combatBreakdown } from '@/lib/utils/combatBreakdown';

interface CombatRowsProps {
  user: CharacterInterface;
}

// Only Armor and Damage are visible rows; Block / Avoid critical fold
// into Armor's tooltip and Critical hit folds into Damage's. Hovering
// either row surfaces the deeper breakdown so the panel stays terse
// at rest.
const CombatRows = ({ user }: CombatRowsProps) => {
  const b = combatBreakdown(user);

  return (
    <div className='brown-card w-full rounded-sm flex flex-col text-sm'>
      <CombatRow label='Armor' value={String(b.armor)}>
        <TooltipCard title='Armor' headline={String(b.armor)}>
          <TipRow label='Damage absorbed' value={`${b.absorbMin} - ${b.absorbMax}`} />
          <TipNote>Each enemy hit is reduced by a value in this range.</TipNote>
          <Divider />
          <TipSection title='Block' value={`${b.blockChance}%`}>
            <TipRow label='Block value' value={String(b.blockValue)} />
            <TipRow label='From strength' value={`+${b.blockFromBase}`} />
            <TipRow label='From items' value={`+${b.blockFromItems}`} />
            <TipNote>A blocked hit is fully negated. Scales with strength.</TipNote>
          </TipSection>
          <Divider />
          <TipSection title='Avoid critical' value={`${b.avoidCritChance}%`}>
            <TipRow label='Resilience value' value={String(b.avoidCritValue)} />
            <TipRow label='From agility' value={`+${b.avoidCritFromBase}`} />
            <TipRow label='From items' value={`+${b.avoidCritFromItems}`} />
            <TipNote>Chance an enemy critical deals only normal damage.</TipNote>
          </TipSection>
        </TooltipCard>
      </CombatRow>

      <CombatRow label='Damage' value={`${b.damageMin} - ${b.damageMax}`} last>
        <TooltipCard title='Damage' headline={`${b.damageMin} - ${b.damageMax}`}>
          <TipRow
            label={b.hasWeapon ? 'From weapon' : 'Bare hands'}
            value={`${b.weaponMin} - ${b.weaponMax}`}
          />
          <TipRow label='From strength' value={`+${b.strDamageBonus}`} />
          <TipNote>Strength grants +1 damage per 10 points.</TipNote>
          <Divider />
          <TipSection title='Critical hit' value={`${b.critChance}%`}>
            <TipRow label='Critical value' value={String(b.critValue)} />
            <TipRow label='From dexterity' value={`+${b.critFromBase}`} />
            <TipRow label='From items' value={`+${b.critFromItems}`} />
            <TipNote>A critical hit deals double damage. Scales with dexterity.</TipNote>
          </TipSection>
        </TooltipCard>
      </CombatRow>
    </div>
  );
};

export default CombatRows;

interface CombatRowProps {
  label: string;
  value: string;
  last?: boolean;
  children: ReactNode;
}

function CombatRow({ label, value, last = false, children }: CombatRowProps) {
  return (
    <HoverCard openDelay={120} closeDelay={0}>
      <HoverCardTrigger asChild>
        <div
          className={`flex items-center justify-between gap-2 px-2 py-1 cursor-help ${
            !last && 'border-b-[3px] border-cream2'
          }`}
        >
          <span className='w-[90px] shrink-0'>{label}</span>
          <span className='font-semibold text-red3'>{value}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className='w-auto p-0 border-none shadow-md'
        side='right'
        align='start'
      >
        {children}
      </HoverCardContent>
    </HoverCard>
  );
}

function TooltipCard({
  title,
  headline,
  children,
}: {
  title: string;
  headline: string;
  children: ReactNode;
}) {
  return (
    <div className='red-card flex flex-col min-w-[230px] px-3 py-2 text-cream2 text-xs gap-1'>
      <div className='flex justify-between gap-4 font-semibold text-sm border-b border-cream2 pb-1 mb-1'>
        <span>{title}</span>
        <span className='text-yellow-300'>{headline}</span>
      </div>
      {children}
    </div>
  );
}

function TipSection({
  title,
  value,
  children,
}: {
  title: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <div className='flex justify-between gap-4 font-semibold'>
        <span>{title}</span>
        <span className='text-yellow-300'>{value}</span>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className='h-px bg-cream2/40 my-1' />;
}

function TipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between gap-4'>
      <span>{label}</span>
      <span className='font-semibold'>{value}</span>
    </div>
  );
}

function TipNote({ children }: { children: ReactNode }) {
  return <div className='text-[10px] opacity-80 italic mt-1'>{children}</div>;
}
