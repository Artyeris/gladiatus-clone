import Link from 'next/link';

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

// Directory-style read-only list of every dungeon. The actual "Enter"
// flow lives on the parent expedition page (Expedition / Dungeon
// tabs), so this view links there instead of running the dungeon in
// place -- one combat flow, one progress bar.
const DungeonsContent = ({ characterLevel, ownedMercenaryCount, dungeons }: Props) => {
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
          Assign each fighter to a slot from{' '}
          <Link className='underline text-red3' href='/game/overview'>Overview</Link>{' '}
          before entering a run.
        </div>
      </div>

      <div className='flex flex-col gap-2'>
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
                <span><strong>Parent:</strong> {d.parentExpedition}</span>
                <span><strong>Gold:</strong> <CompactNumber value={d.goldReward} /></span>
                <span><strong>XP:</strong> <CompactNumber value={d.xpReward} /></span>
              </div>
              <div className='flex justify-end mt-2'>
                {d.unlocked ? (
                  <Link
                    href={`/game/expeditions/${d.parentExpedition}`}
                    className='general-button px-4 py-1 rounded-sm text-sm font-semibold hover:brightness-110'
                  >
                    Open expedition
                  </Link>
                ) : (
                  <span className='text-[10px] text-red3 italic'>
                    requires level {d.entryLevel}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DungeonsContent;
