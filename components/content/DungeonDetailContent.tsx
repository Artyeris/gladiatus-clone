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
  cleared: boolean;
}

interface Props {
  characterLevel: number;
  ownedMercenaryCount: number;
  dungeons: DungeonRow[];
}

// Per-expedition dungeon panel. An expedition can have one or two
// dungeons attached (e.g. Pirate Harbour parents both "On the Run"
// and "The Last Resort"); each renders as its own card with an Enter
// button. If the expedition has no dungeon, the caller hides the tab.
const DungeonDetailContent = ({
  characterLevel, ownedMercenaryCount, dungeons,
}: Props) => {
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

  if (dungeons.length === 0) {
    return (
      <div className='px-4 py-6 italic opacity-80 text-center'>
        No dungeon hidden in this region.
      </div>
    );
  }

  return (
    <div className='px-4 flex flex-col gap-3 text-brown2'>
      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>Party</div>
        <div className='px-3 py-2 text-xs'>
          You enter with your gladiator and{' '}
          <strong>{ownedMercenaryCount}</strong>{' '}
          hired mercenar{ownedMercenaryCount === 1 ? 'y' : 'ies'}.{' '}
          Hire more from the{' '}
          <a className='underline text-red3' href='/game/mercenaries'>Mercenaries</a> shop.
        </div>
      </div>

      {dungeons.map((d) => (
        <div key={d.id} className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
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
              <span><strong>Entry:</strong> level {d.entryLevel}</span>
              <span><strong>Gold:</strong> <CompactNumber value={d.goldReward} /></span>
              <span><strong>XP:</strong> <CompactNumber value={d.xpReward} /></span>
            </div>
            <div className='flex justify-end mt-2'>
              <button
                type='button'
                onClick={() => onEnter(d.id)}
                disabled={characterLevel < d.entryLevel || busyId === d.id}
                className='general-button px-4 py-1 rounded-sm text-sm font-semibold hover:brightness-110 disabled:opacity-50'
                title={characterLevel < d.entryLevel ? `Unlocks at level ${d.entryLevel}` : 'Enter the dungeon'}
              >
                {busyId === d.id
                  ? 'Fighting...'
                  : characterLevel < d.entryLevel
                    ? `Locked (lvl ${d.entryLevel})`
                    : 'Enter'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DungeonDetailContent;
