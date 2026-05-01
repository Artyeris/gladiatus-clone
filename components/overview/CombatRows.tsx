'use client';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import { EQUIPMENT_SLOTS } from '@/lib/utils/equipment';

interface CombatRowsProps {
  user: CharacterInterface;
}

function getEquippedItems(user: CharacterInterface): ItemInterface[] {
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

// Gladiatus armor -> flat absorption range.
//   minAbsorb = ceil((armor/74) - (armor/74)/660 + 1), clamped at 0
//   maxAbsorb = floor((armor/66) + (armor/660))
function armorAbsorption(armor: number) {
  if (armor <= 0) return { min: 0, max: 0 };
  const a74 = armor / 74;
  const min = Math.max(Math.ceil(a74 - a74 / 660 + 1), 0);
  const max = Math.floor(armor / 66 + armor / 660);
  return { min, max };
}

const CombatRows = ({ user }: CombatRowsProps) => {
  const items = getEquippedItems(user);

  let armor = 0;
  let weaponMin = 0;
  let weaponMax = 0;
  for (const item of items) {
    armor += item.armor ?? 0;
    if (item.damage && item.damage.length === 2) {
      weaponMin += item.damage[0];
      weaponMax += item.damage[1];
    }
  }

  // 10 strength -> +1 damage (rounded down).
  const strength = user.strength ?? 5;
  const strBonus = Math.floor(strength / 10);
  const damageMin = weaponMin + strBonus;
  const damageMax = weaponMax + strBonus;

  const { min: absorbMin, max: absorbMax } = armorAbsorption(armor);

  return (
    <div className='brown-card w-full rounded-sm flex flex-col text-sm'>
      <HoverCard openDelay={120} closeDelay={0}>
        <HoverCardTrigger asChild>
          <div className='flex items-center justify-between gap-2 px-2 py-1 border-b-[3px] border-cream2 cursor-help'>
            <span className='w-[72px] shrink-0'>Armor</span>
            <span className='font-semibold text-red3'>{armor}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          className='w-auto p-0 border-none shadow-md'
          side='right'
          align='start'
        >
          <div className='red-card flex flex-col min-w-[200px] px-3 py-2 text-cream2 text-xs gap-1'>
            <div className='flex justify-between gap-4 font-semibold text-sm border-b border-cream2 pb-1 mb-1'>
              <span>Armor</span>
              <span className='text-yellow-300'>{armor}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span>Damage absorbed</span>
              <span className='font-semibold'>{absorbMin} - {absorbMax}</span>
            </div>
            <div className='text-[10px] opacity-80 italic mt-1'>
              Each enemy hit is reduced by a value in this range.
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard openDelay={120} closeDelay={0}>
        <HoverCardTrigger asChild>
          <div className='flex items-center justify-between gap-2 px-2 py-1 cursor-help'>
            <span className='w-[72px] shrink-0'>Damage</span>
            <span className='font-semibold text-red3'>{damageMin} - {damageMax}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          className='w-auto p-0 border-none shadow-md'
          side='right'
          align='start'
        >
          <div className='red-card flex flex-col min-w-[220px] px-3 py-2 text-cream2 text-xs gap-1'>
            <div className='flex justify-between gap-4 font-semibold text-sm border-b border-cream2 pb-1 mb-1'>
              <span>Damage</span>
              <span className='text-yellow-300'>{damageMin} - {damageMax}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span>From weapon</span>
              <span className='font-semibold'>+{weaponMin} - {weaponMax}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span>From strength</span>
              <span className='font-semibold'>+{strBonus}</span>
            </div>
            <div className='text-[10px] opacity-80 italic mt-1'>
              Strength grants +1 damage per 10 points.
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default CombatRows;
