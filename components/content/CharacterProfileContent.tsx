'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import ItemImage from '@/components/shared/ItemImage';
import ItemTooltip from '@/components/overview/ItemTooltip';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import { battleArena } from '@/lib/actions/battle/battleArena.action';
import { calculateNextLevelExperience } from '@/lib/utils';
import { calculatePower } from '@/lib/utils/characterUtils';
import { stats as STATS } from '@/constants';
import { EquipmentSlot, SLOT_LABELS } from '@/lib/utils/equipment';
import {
  calculateStatBreakdown,
  StatId,
} from '@/lib/utils/statUtils';
import CombatRows from '@/components/overview/CombatRows';
import StatBar from '@/components/shared/StatBar';
import PowerTooltip from '@/components/shared/PowerTooltip';
import HealthTooltip from '@/components/shared/HealthTooltip';

interface Props {
  character: CharacterInterface;
  isMine: boolean;
}

const SLOT_LAYOUT: (EquipmentSlot | null)[][] = [
  [null,        'head',  null,        'cloak'   ],
  ['mainHand',  'chest', 'offHand',   'gloves'  ],
  [null,        'legs',  null,        'necklace'],
  [null,        'boots', 'ring1',     'ring2'   ],
];

const SLOT_ICON: Record<EquipmentSlot, string> = {
  head: '🪖', chest: '🥋', legs: '👖', gloves: '🧤', cloak: '🧥', boots: '👢',
  mainHand: '⚔️', offHand: '🛡️', necklace: '📿', ring1: '💍', ring2: '💍',
};

function avatarBucket(level: number) {
  if (level > 80) return 80;
  return Math.floor(level / 10) * 10;
}


const CharacterProfileContent = ({ character, isMine }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const level = character.level ?? 1;
  const gender = character.gender || 'male';
  const avatarUrl = `/characters/${gender}/character-lvl-${avatarBucket(level)}.jpg`;

  const maxHp = (character.endurance || 5) * 10 + level * 5;
  const xpForNext = calculateNextLevelExperience(level);
  const xpPercent = xpForNext > 0
    ? Math.min(((character.experience ?? 0) / xpForNext) * 100, 100)
    : 0;

  const equipment = (character.equipment ?? {}) as Record<string, ItemInterface | null | undefined>;

  const onArenaFight = async () => {
    setBusy(true);
    const res = await battleArena(String(character._id));
    setBusy(false);
    if (res && (res as any).error) {
      toast.error((res as any).error.message);
      return;
    }
    router.push(`/game/battle/${res}`);
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm'>
        {character.name}
        {(character as any).isBot && (
          <span className='ml-2 text-[10px] opacity-80 italic'>NPC</span>
        )}
      </div>

      <div className='flex gap-4'>
        <div className='flex flex-col items-center gap-2 w-[240px]'>
          <Image
            src={avatarUrl}
            alt={`${character.name} avatar`}
            width={200}
            height={232}
            className='drop-shadow-xl rounded-sm'
          />

          <div className='w-full flex justify-between text-sm font-semibold'>
            <span>Level</span>
            <span className='text-red3'>{level}</span>
          </div>

          <HealthTooltip character={character}>
            <div className='w-full cursor-help'>
              <div className='flex justify-between text-xs font-semibold mb-1'>
                <span>Health</span>
                <span>{maxHp} / {maxHp}</span>
              </div>
              <div className='relative h-3 rounded-sm overflow-hidden' style={{ backgroundColor: '#3e2714' }}>
                <div className='absolute top-0 left-0 h-full w-full' style={{ backgroundColor: '#a32626' }} />
              </div>
            </div>
          </HealthTooltip>

          <div className='w-full'>
            <div className='flex justify-between text-xs font-semibold mb-1'>
              <span>Experience</span>
              <span>{character.experience ?? 0} / {xpForNext} ({xpPercent.toFixed(1)}%)</span>
            </div>
            <div className='relative h-3 rounded-sm overflow-hidden' style={{ backgroundColor: '#3e2714' }}>
              <div
                className='absolute top-0 left-0 h-full'
                style={{ width: `${xpPercent}%`, backgroundColor: '#d4af37' }}
              />
            </div>
          </div>

          <div className='brown-card w-full rounded-sm flex flex-col text-sm'>
            {STATS.map((s, index) => {
              const breakdown = calculateStatBreakdown(character, s.id as StatId);
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-2 px-2 py-1 ${
                    index < STATS.length - 1 && 'border-b-[3px] border-cream2'
                  }`}
                >
                  <span className='w-[72px] shrink-0'>{s.name}</span>
                  <div className='flex-1 min-w-0'>
                    <StatBar statName={s.name} breakdown={breakdown} />
                  </div>
                  <span className='font-semibold text-red3 w-7 text-right shrink-0'>
                    {breakdown.total}
                  </span>
                </div>
              );
            })}
          </div>

          <div className='w-full'>
            <CombatRows user={character} />
          </div>
        </div>

        <div className='flex flex-col gap-3 flex-1'>
          <div
            style={{
              background: '#dcd0b8',
              border: '3px solid #5c3a21',
              padding: '12px',
              borderRadius: '5px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 60px)',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              {SLOT_LAYOUT.flatMap((row, ri) =>
                row.map((slot, ci) =>
                  slot ? (
                    <ProfileSlot key={slot} slot={slot} item={equipment[slot] ?? null} />
                  ) : (
                    <div key={`empty-${ri}-${ci}`} />
                  ),
                ),
              )}
            </div>
          </div>

          {!isMine && (
            <div className='brown-card rounded-sm p-3 text-sm'>
              <p className='mb-2'>
                Seeking revenge against this gladiator? Challenge them in the arena.
              </p>
              <button
                onClick={onArenaFight}
                disabled={busy}
                className='general-button px-4 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50'
              >
                Challenge in arena
              </button>
            </div>
          )}

          <div className='brown-card rounded-sm p-3 text-xs flex flex-col gap-1'>
            <div className='font-semibold text-sm mb-1'>More information</div>
            <div>Honor: <strong>{character.honor ?? 0}</strong></div>
            <div>Can use items up to level {Math.max(1, level + 6)}.</div>
            <div>Can see items on the market up to level {Math.max(1, level + 9)}.</div>
            <div>Can see items on the auction from {Math.max(1, level - 9)} to {level + 6}.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterProfileContent;

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center px-2 py-1 ${!last && 'border-b-[2px] border-cream2'}`}>
      <span className='text-sm'>{label}</span>
      <span className='font-semibold text-red3 text-sm'>{value}</span>
    </div>
  );
}

function ProfileSlot({ slot, item }: { slot: EquipmentSlot; item: ItemInterface | null }) {
  return (
    <div
      style={{
        width: '60px',
        height: '60px',
        background: '#a89f91',
        border: '2px solid #5c3a21',
        borderRadius: '4px',
        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {item ? (
        <ItemTooltip item={item}>
          <div style={{ position: 'absolute', inset: 0, cursor: 'help' }}>
            <ItemImage
              imageId={item.image}
              alt={item.name}
              fill
              sizes='60px'
              style={{ objectFit: 'contain', padding: '4px' }}
            />
          </div>
        </ItemTooltip>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.45,
            filter: 'grayscale(1) contrast(0.85)',
          }}
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{SLOT_ICON[slot]}</span>
          <span style={{ fontSize: '8px', color: '#3e2714', fontWeight: 600 }}>
            {SLOT_LABELS[slot]}
          </span>
        </div>
      )}
    </div>
  );
}
