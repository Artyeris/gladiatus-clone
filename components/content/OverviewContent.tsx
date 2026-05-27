'use client';

import { useState } from 'react';
import Image from 'next/image';

import { CharacterInterface } from '@/lib/interfaces/character.interface';
import CharacterPanel from '../overview/CharacterPanel';
import InventoryEquipment from '../overview/InventoryEquipment';
import MercenaryPanel from '../overview/MercenaryPanel';

interface MercForOverview {
  _id: string;
  templateId: string;
  name: string;
  type: 'tank' | 'healer' | 'damage';
  level: number;
  quality: string;
  stats: any;
  power: number;
}

interface OverviewContentProps {
  character: CharacterInterface;
  mercenaries: MercForOverview[];
}

const ROLE_AVATAR: Record<string, string> = {
  tank:   '/images/expedition.webp',
  healer: '/images/arena.webp',
  damage: '/images/fight.png',
};
const QUALITY_COLOR: Record<string, string> = {
  green:  '#3b9b3b',
  blue:   '#3b6bb5',
  purple: '#9333ea',
  orange: '#d97706',
  red:    '#dc2626',
};

const OverviewContent = ({ character, mercenaries }: OverviewContentProps) => {
  // 'player' = main character; otherwise the selected mercenary _id.
  const [selected, setSelected] = useState<'player' | string>('player');
  const merc = mercenaries.find((m) => m._id === selected);

  return (
    <div className='game-container'>
      <div className='flex gap-2 px-4 mb-3 font-semibold text-brown2'>
        <Tab href='/game/overview'   label='Overview'   active />
        <Tab href='/game/statistics' label='Statistics' />
        <Tab href='/game/victories'  label='Victories'  />
      </div>

      {/* Party row: player + each owned mercenary as a clickable
          portrait pill. Mirrors the original "Požemių kovos" party
          selector where the active fighter sits left and the
          mercenaries line up next to it. */}
      <div className='flex gap-2 px-4 mb-3 flex-wrap'>
        <PartyPill
          active={selected === 'player'}
          onClick={() => setSelected('player')}
          label={character.name}
          subLabel={`Lvl ${character.level ?? 1}`}
          avatar={`/characters/${character.gender ?? 'male'}/character-lvl-${avatarLevelBucket(character.level ?? 1)}.jpg`}
        />
        {mercenaries.map((m) => (
          <PartyPill
            key={m._id}
            active={selected === m._id}
            onClick={() => setSelected(m._id)}
            label={m.name}
            subLabel={`${m.type[0].toUpperCase()}${m.type.slice(1)} · Lvl ${m.level}`}
            avatar={ROLE_AVATAR[m.type]}
            tint={QUALITY_COLOR[m.quality]}
          />
        ))}
      </div>

      <div className='flex gap-3 justify-center items-stretch px-3'>
        <div className='info-card rounded-sm shadow-md flex' style={{ flex: '0 0 330px', padding: '4px' }}>
          {merc ? <MercenaryPanel merc={merc} /> : <CharacterPanel user={character} />}
        </div>

        <div className='info-card rounded-sm shadow-md flex flex-col flex-1' style={{ padding: '12px' }}>
          {merc ? (
            <div className='flex flex-col items-center justify-center text-center py-10 text-brown2 gap-2'>
              <div className='text-lg font-bold tracking-wide'>
                Mercenary Equipment
              </div>
              <div className='text-xs italic opacity-80 max-w-[360px]'>
                Equipment slots and bag for mercenaries are still being
                forged. For now, mercenaries fight with their rolled
                stats only -- buy higher quality / higher level
                mercenaries from the Mercenaries shop to upgrade them.
              </div>
            </div>
          ) : (
            <InventoryEquipment character={character} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;

function avatarLevelBucket(level: number): number {
  if (level > 80) return 80;
  return Math.floor(level / 10) * 10;
}

function PartyPill({
  active, onClick, label, subLabel, avatar, tint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  subLabel?: string;
  avatar: string;
  tint?: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex items-center gap-2 px-2 py-1 rounded-sm border-[2px] hover:brightness-110 transition'
      style={{
        background: active ? '#974342' : '#b59964',
        borderColor: '#eed7a1',
        outline: `2px solid ${active ? '#974342' : '#b59964'}`,
        color: active ? '#f4eac8' : '#3e2714',
      }}
      title={label}
    >
      <div
        className='w-7 h-7 rounded-sm overflow-hidden flex items-center justify-center shrink-0'
        style={{ background: tint ? `${tint}33` : '#3e2714' }}
      >
        <Image
          src={avatar}
          alt={label}
          width={28}
          height={28}
          style={{ width: '28px', height: '28px', objectFit: 'cover' }}
        />
      </div>
      <span className='flex flex-col text-left leading-tight'>
        <span className='text-xs font-semibold truncate max-w-[80px]'>{label}</span>
        {subLabel && (
          <span className='text-[9px] opacity-80'>{subLabel}</span>
        )}
      </span>
    </button>
  );
}

function Tab({ href, label, active }: { href: string; label: string; active?: boolean }) {
  if (active) {
    return (
      <a
        href={href}
        className='px-8 py-1 rounded-sm font-semibold text-cream2 cursor-default text-sm'
        style={{
          background: '#974342',
          border: '2px solid #eed7a1',
          outline: '2px solid #974342',
        }}
      >
        {label}
      </a>
    );
  }
  return (
    <a
      href={href}
      className='px-8 py-1 rounded-sm font-semibold text-brown2 hover:text-red3 transition text-sm'
      style={{
        background: '#b59964',
        border: '2px solid #eed7a1',
        outline: '2px solid #b59964',
      }}
    >
      {label}
    </a>
  );
}
