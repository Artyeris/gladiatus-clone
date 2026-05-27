'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { runDungeon } from '@/lib/actions/dungeon/dungeon.action';
import CompactNumber from '@/components/shared/CompactNumber';

interface DungeonRow {
  id: string;
  name: string;
  parentExpedition: string;
  entryLevel: number;
  bossName: string;
  bossLevel: number;
  description: string;
  goldReward: number;
  xpReward: number;
  unlocked: boolean;
  cleared: boolean;
}

interface Props {
  characterLevel: number;
  ownedMercenaryCount: number;
  dungeons: DungeonRow[];
}

const DungeonsContent = ({ characterLevel, ownedMercenaryCount, dungeons }: Props) => {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const onEnter = async (id: string) => {
    setBusyId(id);
    const res: any = await runDungeon({ dungeonId: id as any });
    setBusyId(null);
    if (res?.error) return toast.error(res.error.message);
    if (res.won) {
      toast.success(
        res.drop
          ? `Cleared ${res.dungeon.name}! Loot: ${res.drop.name}`
          : `Cleared ${res.dungeon.name}! +${res.goldGained} gold, +${res.xpGained} XP`,
      );
    } else {
      toast.error(`Wiped in ${res.dungeon.name} (${res.winChance}% chance). Salvaged ${res.goldGained} gold.`);
    }
    startTransition(() => router.refresh());
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <h1 className='text-xl font-bold border-b-[3px] border-brown2 text-center text-brown2'>
        Italy Dungeons
      </h1>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>Party</div>
        <div className='px-3 py-2 text-xs'>
          You enter every dungeon with your gladiator and{' '}
          <strong>{ownedMercenaryCount}</strong>{' '}
          hired mercenar{ownedMercenaryCount === 1 ? 'y' : 'ies'}.{' '}
          Visit the <a className='underline text-red3' href='/game/mercenaries'>Mercenaries</a> page to hire more.
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        {dungeons.map((d) => (
          <DungeonRowCard
            key={d.id}
            d={d}
            characterLevel={characterLevel}
            busy={busyId === d.id}
            onEnter={() => onEnter(d.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default DungeonsContent;

function DungeonRowCard({
  d, characterLevel, busy, onEnter,
}: {
  d: DungeonRow;
  characterLevel: number;
  busy: boolean;
  onEnter: () => void;
}) {
  const canEnter = d.unlocked;
  return (
    <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 flex justify-between items-center'>
        <span>{d.name}</span>
        <span className='text-xs opacity-90'>
          {d.cleared ? 'Cleared' : `from level ${d.entryLevel}`}
        </span>
      </div>
      <div className='px-3 py-2 flex flex-col gap-1'>
        <div className='text-xs italic opacity-80'>{d.description}</div>
        <div className='text-xs grid grid-cols-2 gap-y-0.5 mt-1'>
          <span><strong>Boss:</strong> {d.bossName} (lvl {d.bossLevel})</span>
          <span><strong>Parent:</strong> {d.parentExpedition}</span>
          <span><strong>Gold:</strong> <CompactNumber value={d.goldReward} /></span>
          <span><strong>XP:</strong> <CompactNumber value={d.xpReward} /></span>
        </div>
        <div className='flex justify-end mt-2'>
          <button
            type='button'
            onClick={onEnter}
            disabled={!canEnter || busy}
            className='general-button px-4 py-1 rounded-sm text-sm font-semibold hover:brightness-110 disabled:opacity-50'
            title={!canEnter ? `Unlocks at level ${d.entryLevel}` : 'Enter the dungeon'}
          >
            {busy ? 'Fighting...' : canEnter ? 'Enter' : `Locked (lvl ${d.entryLevel})`}
          </button>
        </div>
        {!canEnter && characterLevel < d.entryLevel && (
          <div className='text-[10px] text-red3 italic text-right'>
            requires level {d.entryLevel}
          </div>
        )}
      </div>
    </div>
  );
}
