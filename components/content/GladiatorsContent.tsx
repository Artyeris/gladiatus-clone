'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';

import type { GladiatorRow } from '@/lib/actions/character/gladiators.action';
import { switchGladiator } from '@/lib/actions/character/gladiators.action';

interface Props {
  gladiators: GladiatorRow[];
  activeId: string | null;
  maxGladiators: number;
}

function avatarBucket(level: number) {
  if (level > 80) return 80;
  return Math.floor(level / 10) * 10;
}

const GladiatorsContent = ({ gladiators, activeId, maxGladiators }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onSwitch = async (id: string) => {
    if (id === activeId) return;
    setBusy(true);
    const res = await switchGladiator({ id });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Switched gladiator');
    router.push('/game/overview');
    router.refresh();
  };

  const onCreate = () => {
    if (gladiators.length >= maxGladiators) {
      toast.error(`You already have ${maxGladiators} gladiators (the limit).`);
      return;
    }
    router.push('/onboarding');
  };

  return (
    <div className='px-6 flex flex-col gap-3 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm flex justify-between'>
        <span>Gladiators</span>
        <span className='text-xs opacity-90'>
          {gladiators.length} / {maxGladiators}
        </span>
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        {gladiators.length === 0 ? (
          <div className='px-3 py-3 italic opacity-80 text-sm'>
            No gladiators yet. Create one to get started.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '10px',
              padding: '10px',
            }}
          >
            {gladiators.map((g) => (
              <GladiatorTile
                key={g._id}
                glad={g}
                isActive={g._id === activeId}
                busy={busy}
                onSwitch={() => onSwitch(g._id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className='flex justify-end'>
        <button
          type='button'
          onClick={onCreate}
          disabled={busy || gladiators.length >= maxGladiators}
          className='general-button px-4 py-1 rounded-sm text-sm font-semibold hover:brightness-110 disabled:opacity-50'
        >
          Create new gladiator
        </button>
      </div>

      <p className='text-xs opacity-70 italic px-1'>
        Up to {maxGladiators} gladiators per account. Old characters keep
        their gold, gear and rank in the same world -- switch back any time.
      </p>
    </div>
  );
};

export default GladiatorsContent;

function GladiatorTile({
  glad, isActive, busy, onSwitch,
}: {
  glad: GladiatorRow;
  isActive: boolean;
  busy: boolean;
  onSwitch: () => void;
}) {
  const avatarUrl = `/characters/${glad.gender}/character-lvl-${avatarBucket(glad.level)}.jpg`;
  return (
    <div
      className='flex items-center gap-3 p-2 rounded-sm'
      style={{
        background: '#cdb88a',
        border: `2px solid ${isActive ? '#974342' : '#5c3a21'}`,
      }}
    >
      <Image
        src={avatarUrl}
        alt={glad.name}
        width={60}
        height={70}
        className='rounded-sm shrink-0'
        style={{ width: '60px', height: '70px', objectFit: 'cover' }}
      />
      <div className='flex flex-col flex-1 min-w-0 gap-[2px]'>
        <span className='font-semibold truncate text-base'>{glad.name}</span>
        <span className='text-xs opacity-90 tabular-nums'>
          Lvl {glad.level} &middot; Power {glad.power}
        </span>
        <span className='text-[10px] opacity-70 tabular-nums'>
          Honor {glad.honor}
        </span>
      </div>
      {isActive ? (
        <span
          className='px-2 py-[2px] rounded-sm text-[10px] font-semibold uppercase tracking-wider text-cream2'
          style={{ background: '#974342' }}
        >
          Active
        </span>
      ) : (
        <button
          type='button'
          onClick={onSwitch}
          disabled={busy}
          className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
        >
          Switch
        </button>
      )}
    </div>
  );
}
