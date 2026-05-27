'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

import { setDungeonPartySlot } from '@/lib/actions/dungeon/dungeon.action';

const SLOTS = ['tank', 'healer', 'damage1', 'damage2', 'damage3'] as const;
type Slot = typeof SLOTS[number];

const SLOT_LABEL: Record<Slot, string> = {
  tank: 'Tank', healer: 'Healer',
  damage1: 'Damage I', damage2: 'Damage II', damage3: 'Damage III',
};
const SLOT_ROLE: Record<Slot, 'tank' | 'healer' | 'damage'> = {
  tank: 'tank', healer: 'healer',
  damage1: 'damage', damage2: 'damage', damage3: 'damage',
};
const ROLE_AVATAR: Record<string, string> = {
  tank:   '/images/expedition.webp',
  healer: '/images/arena.webp',
  damage: '/images/fight.png',
};
const QUALITY_COLOR: Record<string, string> = {
  green: '#3b9b3b', blue: '#3b6bb5', purple: '#9333ea', orange: '#d97706', red: '#dc2626',
};

interface MercForOverview {
  _id: string;
  name: string;
  type: 'tank' | 'healer' | 'damage';
  level: number;
  quality: string;
}

interface Props {
  playerName: string;
  playerGender?: string;
  playerLevel: number;
  mercenaries: MercForOverview[];
  party: Record<string, string | null>;
}

const DungeonPartySlots = ({
  playerName, playerGender = 'male', playerLevel, mercenaries, party,
}: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [pickerSlot, setPickerSlot] = useState<Slot | null>(null);
  const [, startTransition] = useTransition();

  const onAssign = async (slot: Slot, source: string | null) => {
    setBusy(slot);
    const res: any = await setDungeonPartySlot({ slot, source });
    setBusy(null);
    if (res?.error) return toast.error(res.error.message);
    setPickerSlot(null);
    startTransition(() => router.refresh());
  };

  // Pre-compute which member is in which slot so we don't show the
  // same fighter as an "available" option in two places.
  const inUse = new Set(Object.values(party ?? {}).filter(Boolean) as string[]);

  return (
    <div className='brown-card w-full rounded-sm flex flex-col text-sm overflow-hidden'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>
        Dungeon party
      </div>
      <div className='flex flex-wrap gap-2 px-3 py-2'>
        {SLOTS.map((slot) => {
          const source = party?.[slot] ?? null;
          const assigned = source === 'player'
            ? { source: 'player', name: playerName, quality: null as string | null,
                avatar: `/characters/${playerGender}/character-lvl-${avatarLevelBucket(playerLevel)}.jpg`,
                sub: `Lvl ${playerLevel}` }
            : source
              ? (() => {
                  const m = mercenaries.find((mm) => mm._id === source);
                  if (!m) return null;
                  return {
                    source: m._id,
                    name: m.name,
                    quality: m.quality,
                    avatar: ROLE_AVATAR[m.type],
                    sub: `${m.type[0].toUpperCase()}${m.type.slice(1)} · Lvl ${m.level}`,
                  };
                })()
              : null;
          return (
            <Slot
              key={slot}
              label={SLOT_LABEL[slot]}
              role={SLOT_ROLE[slot]}
              assigned={assigned}
              busy={busy === slot}
              onClick={() => setPickerSlot(slot)}
              onClear={assigned ? () => onAssign(slot, null) : undefined}
            />
          );
        })}
      </div>

      {pickerSlot && (() => {
        const active: Slot = pickerSlot;
        return (
        <div className='border-t-[2px] border-cream2 px-3 py-2 text-xs text-brown2'>
          <div className='flex justify-between items-center mb-1'>
            <span className='font-semibold'>
              Assign {SLOT_LABEL[active]}
              <span className='opacity-70'> ({SLOT_ROLE[active]})</span>
            </span>
            <button
              type='button'
              onClick={() => setPickerSlot(null)}
              className='underline text-xs'
            >
              Cancel
            </button>
          </div>
          <div className='flex flex-wrap gap-1'>
            <Candidate
              label={`You (${playerName})`}
              sub={`Lvl ${playerLevel}`}
              avatar={`/characters/${playerGender}/character-lvl-${avatarLevelBucket(playerLevel)}.jpg`}
              disabled={busy !== null || inUse.has('player')}
              onClick={() => onAssign(active, 'player')}
            />
            {mercenaries
              .filter((m) => !inUse.has(m._id))
              .map((m) => (
                <Candidate
                  key={m._id}
                  label={m.name}
                  sub={`${m.type[0].toUpperCase()}${m.type.slice(1)} · Lvl ${m.level}`}
                  avatar={ROLE_AVATAR[m.type]}
                  tint={QUALITY_COLOR[m.quality]}
                  highlight={m.type === SLOT_ROLE[active]}
                  disabled={busy !== null}
                  onClick={() => onAssign(active, m._id)}
                />
              ))}
            {mercenaries.filter((m) => !inUse.has(m._id)).length === 0 && (
              <span className='italic opacity-80'>
                No more fighters available. Hire some at Mercenaries.
              </span>
            )}
          </div>
          <div className='text-[10px] opacity-70 italic mt-1'>
            Role-matched mercs are highlighted. Your gladiator can fill any slot.
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default DungeonPartySlots;

function avatarLevelBucket(level: number): number {
  if (level > 80) return 80;
  return Math.floor(level / 10) * 10;
}

function Slot({
  label, role, assigned, busy, onClick, onClear,
}: {
  label: string;
  role: string;
  assigned: { name: string; quality: string | null; avatar: string; sub: string } | null;
  busy: boolean;
  onClick: () => void;
  onClear?: () => void;
}) {
  return (
    <div className='flex flex-col items-center gap-1 w-[88px]'>
      <button
        type='button'
        onClick={onClick}
        disabled={busy}
        className='relative border-[2px] rounded-sm w-full h-[72px] flex items-center justify-center hover:brightness-110 transition'
        style={{
          background: '#3e2714',
          borderColor: assigned?.quality
            ? (QUALITY_COLOR[assigned.quality] ?? '#eed7a1')
            : '#eed7a1',
        }}
        title={assigned ? `${assigned.name} (${assigned.sub})` : `Empty ${role} slot`}
      >
        {assigned ? (
          <Image
            src={assigned.avatar}
            alt={assigned.name}
            width={56}
            height={56}
            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
          />
        ) : (
          <span className='text-[10px] text-cream2/80 uppercase tracking-wider text-center'>
            {label}
          </span>
        )}
        {onClear && (
          <button
            type='button'
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className='absolute -top-2 -right-2 w-5 h-5 rounded-full border-[2px] flex items-center justify-center text-[10px] font-bold'
            style={{ background: '#974342', borderColor: '#eed7a1', color: '#f4eac8' }}
            title='Clear'
          >
            ×
          </button>
        )}
      </button>
      <span className='text-[10px] font-semibold text-brown2 text-center leading-tight'>
        {label}
      </span>
      {assigned && (
        <span className='text-[9px] text-brown2/80 text-center truncate w-full'>
          {assigned.name}
        </span>
      )}
    </div>
  );
}

function Candidate({
  label, sub, avatar, tint, highlight, disabled, onClick,
}: {
  label: string;
  sub: string;
  avatar: string;
  tint?: string;
  highlight?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='flex items-center gap-2 border-[2px] rounded-sm px-2 py-1 hover:brightness-110 disabled:opacity-50'
      style={{
        background: highlight ? '#dcd0b8' : '#b59964',
        borderColor: highlight ? '#974342' : '#eed7a1',
      }}
    >
      <div
        className='w-7 h-7 rounded-sm overflow-hidden flex items-center justify-center'
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
        <span className='text-xs font-semibold'>{label}</span>
        <span className='text-[9px] opacity-80'>{sub}</span>
      </span>
    </button>
  );
}
