import { redirect } from 'next/navigation';

import DescriptionCard from '@/components/cards/DescriptionCard';
import { getExpeditionEnemies } from '@/lib/actions/battle/getExpeditionEnemies.action';
import { getActiveDungeonRun } from '@/lib/actions/dungeon/dungeon.action';
import { getUser } from '@/lib/actions/user/getUser.action';
import { expeditions } from '@/constants/expeditions';
import { DUNGEONS, DUNGEON_ORDER } from '@/constants/dungeons';
import NoResults from '@/components/shared/NoResults';
import ExpeditionContent from '@/components/content/ExpeditionContent';
import ExpeditionTabs from '@/components/content/ExpeditionTabs';
import DungeonDetailContent from '@/components/content/DungeonDetailContent';

const Page = async ({ params }: { params: { expedition: string } }) => {
  const user = await getUser().catch(() => redirect('/'));
  const expeditionName = params.expedition;
  const enemies = await getExpeditionEnemies(expeditionName);

  if (!user.character) redirect('/onboarding');

  const expeditionInfo = expeditions[expeditionName];
  if (!enemies) return <NoResults />;

  const character: any = user.character;
  const completed: string[] = character.completedDungeons ?? [];
  const matchingDungeons = DUNGEON_ORDER
    .map((id) => DUNGEONS[id])
    .filter((d) => d.parentExpedition === expeditionName)
    .map((d) => ({
      id: d.id,
      name: d.name,
      parentExpedition: d.parentExpedition,
      entryLevel: d.entryLevel,
      bossName: d.bossName,
      bossLevel: d.bossLevel,
      description: d.description,
      goldReward: d.goldReward,
      xpReward: d.xpReward,
      cleared: completed.includes(d.id),
    }));

  // Only surface the active run on the matching expedition tab so
  // entering Pirate Harbour doesn't show a run started on a different
  // region's dungeon.
  const runRes: any = await getActiveDungeonRun();
  const allRun = runRes?.ok ? runRes.run : null;
  const activeRun = allRun && matchingDungeons.some((d) => d.id === allRun.dungeonId) ? allRun : null;

  // The dungeon needs at least one assigned party slot to be enterable.
  const party = character.dungeonParty ?? {};
  const partyAssigned = Object.values(party).some((v) => !!v);

  const expeditionView = (
    <div className='px-4 flex flex-col gap-4'>
      <ExpeditionContent
        enemies={enemies}
        expeditionName={expeditionName}
        character={user.character}
      />
      <div className='flex flex-col gap-2'>
        <DescriptionCard title='Expedition description'>
          {expeditionInfo.intro && <p>{expeditionInfo.intro}</p>}
          <p>{expeditionInfo.description}</p>
          {(expeditionInfo.entryLevel !== undefined || expeditionInfo.enemyLevels || expeditionInfo.realLevel) && (
            <div className='grid grid-cols-3 gap-2 border-t border-cream2 pt-2 mt-1 text-xs'>
              <div>
                <span className='font-semibold'>Entry level:</span>{' '}
                {expeditionInfo.entryLevel ?? '-'}
              </div>
              <div>
                <span className='font-semibold'>Enemy levels:</span>{' '}
                {expeditionInfo.enemyLevels ?? '-'}
              </div>
              <div>
                <span className='font-semibold'>Real level:</span>{' '}
                {expeditionInfo.realLevel ?? '-'}
              </div>
            </div>
          )}
        </DescriptionCard>
        {expeditionInfo.additionalInfo && (
          <DescriptionCard title='Strategy'>
            <p>{expeditionInfo.additionalInfo}</p>
          </DescriptionCard>
        )}
      </div>
    </div>
  );

  const dungeonView = (
    <DungeonDetailContent
      characterLevel={character.level ?? 1}
      partyAssigned={partyAssigned}
      dungeons={matchingDungeons}
      activeRun={activeRun}
    />
  );

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-xl font-bold border-b-[3px] border-brown2 text-center text-brown2'>
        {expeditionInfo.name}
      </h1>
      <ExpeditionTabs
        expeditionLabel={expeditionInfo.name}
        expeditionContent={expeditionView}
        dungeonContent={dungeonView}
        hasDungeon={matchingDungeons.length > 0}
      />
    </div>
  );
};

export default Page;
