import Image from 'next/image';

import { stats } from '@/constants';
import type { CombatProfile } from '@/lib/utils/combatProfile';

function roundDownToNearestMultipleOf10(level: number): number {
  if (level > 80) return 80;
  return Math.floor(level / 10) * 10;
}

interface FighterCardProps {
  name: string;
  image: string;
  isEnemy?: boolean;
  expedition?: string;
  power: number;
  profile: CombatProfile;
}

const FighterCard = ({ name, image, expedition, power, profile, isEnemy = false }: FighterCardProps) => {
  const statValue: Record<string, number> = {
    strength: profile.strength,
    endurance: profile.endurance,
    agility: profile.agility,
    dexterity: profile.dexterity,
    intelligence: profile.intelligence,
    charisma: profile.charisma,
  };

  // No StatBreakdown available here (especially for NPC enemies), so the
  // bar is sized against the strongest stat on the card. That keeps the
  // relative shape readable - a high-STR fighter visibly outweighs the
  // other rows - without pretending we know the training cap.
  const softMax = Math.max(1, ...Object.values(statValue));

  return (
    <div className='flex flex-col w-[250px] gap-2 items-center'>
      <h2 className='font-semibold text-md red-card flex justify-center items-center text-cream2 h-10 px-4 w-full drop-shadow-xl truncate'>
        {name}
      </h2>
      <Image
        className='drop-shadow-xl'
        src={isEnemy ? `/enemies/${expedition}/${image}.jpg` : `/characters/${image}/character-lvl-${roundDownToNearestMultipleOf10(profile.level)}.jpg`}
        width={168}
        height={194}
        alt='character'
        style={{ width: 'auto', height: 'auto' }}
      />
      <div className='brown-card w-full drop-shadow-xl rounded-sm text-brown2 text-xs'>
        <Row label='Level' value={String(profile.level)} />
        <Row label='Health' value={`${profile.maxHP}`} />

        {stats.map((stat) => (
          <Row
            key={stat.id}
            label={stat.name}
            value={String(statValue[stat.id] ?? 0)}
            bar={{ value: statValue[stat.id] ?? 0, max: softMax }}
          />
        ))}

        <Row
          label='Armor'
          value={
            profile.armor > 0
              ? `${profile.armor} (${profile.absorbMin}-${profile.absorbMax})`
              : '0'
          }
        />
        <Row label='Damage' value={`${profile.damageMin} - ${profile.damageMax}`} />
        <Row label='Chance to hit' value={`${profile.chanceToHit}%`} />
        <Row label='Double hit' value={`${profile.doubleHitChance}%`} />
        <Row label='Critical hit' value={`${profile.critChance}%`} />
        <Row label='Block' value={`${profile.blockChance}%`} />
        <Row label='Avoid critical' value={`${profile.avoidCritChance}%`} />
        <Row label='Power Rank' value={String(power)} last />
      </div>
    </div>
  );
};

export default FighterCard;

function Row({
  label,
  value,
  last,
  bar,
}: {
  label: string;
  value: string;
  last?: boolean;
  bar?: { value: number; max: number };
}) {
  // Stat rows (with bar) use a tighter value column so the bar has
  // visible room. Non-stat rows (e.g. "245 - 349") get a wider one.
  const valueWidth = bar ? 40 : 78;
  return (
    <div className={`px-2 py-[3px] ${!last && 'border-b-[2px] border-cream2'}`}>
      <div className='flex items-center gap-2'>
        <span className='w-[88px] shrink-0'>{label}:</span>
        <div
          className='flex-1 min-w-[40px] h-3 rounded-sm overflow-hidden'
          style={{ backgroundColor: bar ? '#3e2714' : 'transparent' }}
        >
          {bar && (
            <div
              className='h-full'
              style={{
                width: `${Math.min(100, (bar.value / Math.max(1, bar.max)) * 100)}%`,
                backgroundColor: '#6b8e23',
              }}
            />
          )}
        </div>
        <span
          className='font-semibold text-red3 text-right shrink-0'
          style={{ width: `${valueWidth}px` }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
