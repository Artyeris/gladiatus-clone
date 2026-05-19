import formatDateTime from '@/lib/utils/formatDateTime';
import Image from 'next/image';
import { calculatePower } from '@/lib/utils/characterUtils';
import { combatProfile } from '@/lib/utils/combatProfile';
import { BattleReport } from '@/lib/interfaces/battleReport.interface';
import DescriptionCard from '@/components/cards/DescriptionCard';
import FighterCard from '@/components/cards/FighterCard';
import ItemImage from '@/components/shared/ItemImage';
import ItemTooltip from '@/components/overview/ItemTooltip';
import Item from '@/lib/models/item.model';
import { getBattleReport } from '@/lib/actions/battle/getBattleReport.action';
import { getUser } from '@/lib/actions/user/getUser.action';
import { redirect } from 'next/navigation';
import NoResults from '@/components/shared/NoResults';
import type { ItemInterface } from '@/lib/interfaces/item.interface';

const Page = async ({ params }: { params: { id: string } }) => {
  const user = await getUser().catch(() => redirect('/'));
  const battleReportId = params.id;
  const battleReport = await getBattleReport(battleReportId) as BattleReport;

  const defender = battleReport?.defender;
  const attacker = battleReport?.attacker;
  
  if (!user) return null;

  if (!user.character) redirect('/onboarding');

  const currentCharacter = user.character;

  if (!battleReport || !attacker || !defender) return <NoResults />;

  // If the report has an item id on its loot summary, resolve the
  // full Item doc so the loot row can render the same hover tooltip
  // the inventory uses (stats / level / value / durability).
  let lootItem: ItemInterface | null = null;
  const lootItemId = (battleReport.loot as any)?.itemId;
  if (lootItemId) {
    try {
      const doc = await Item.findById(lootItemId).lean();
      if (doc) lootItem = JSON.parse(JSON.stringify(doc)) as ItemInterface;
    } catch {}
  }

  // If the defender has "id" property (not "_id") it means is an npc enemy, if it doesn't, then its an another player character.
  const isNpc = 'id' in battleReport.defender
  const battleDate = new Date(battleReport!.createdAt);

  let resultTitle = '';
  let resultCard = '';

  if (battleReport.result.winner === 'Draw') {
    resultTitle = 'Draw';
    resultCard = 'brown-card';
  }
  else if (battleReport.result.winner === attacker._id) {
    resultTitle = `Winner: ${attacker.name}`;

    if (attacker._id === currentCharacter._id) resultCard = 'green-card';
    else if (defender._id === currentCharacter._id) resultCard = 'red-card';
    else resultCard = 'brown-card';
  }
  else {
    resultTitle = `Winner: ${defender.name}`;

    if (defender._id === currentCharacter._id) resultCard = 'green-card';
    else if (attacker._id === currentCharacter._id) resultCard = 'red-card';
    else resultCard = 'brown-card';
  }

  if (battleReport.result.winner === currentCharacter._id) resultCard = 'green-card';

  return (
    <div className='flex flex-col mb-4 px-4 gap-4'>
      <div className='w-full'>
        <div className={`w-full text-lg flex items-center justify-center h-12 font-semibold text-cream2 ${resultCard}`}>
          {resultTitle}
        </div>
      </div>

      {isNpc ?
        <DescriptionCard
        title='Rewards'
        >
          <p className='text-sm px-2 py-1 flex items-center gap-1'>
            <span className='font-semibold'>{attacker.name}</span> earned {battleReport.result.crownsDrop}
            <Image
              src={'/images/crowns.png'}
              width={12}
              height={12}
              alt='crowns'
              style={{ width: 'auto', height: 'auto' }}
            />
          </p>
          <p className='text-sm px-2 py-1'>
            <span className='font-semibold'>{attacker.name}</span> has received {battleReport.result.experienceDrop} experience.
          </p>
          {battleReport.loot && (
            <p className='text-sm px-2 py-1 font-semibold text-red3 flex items-center gap-2'>
              <span>Loot:</span>
              {/* Wrap the icon + name in ItemTooltip so hovering shows
                  the same stat card the inventory uses. Falls back to
                  the plain icon when we couldn't resolve the Item. */}
              {lootItem ? (
                <ItemTooltip item={lootItem}>
                  <span className='flex items-center gap-2 cursor-help'>
                    {battleReport.loot.image && (
                      <span
                        className='relative inline-block shrink-0'
                        style={{
                          width: '24px',
                          height: '24px',
                          background: '#a89f91',
                          border: '1px solid #5c3a21',
                          borderRadius: '2px',
                        }}
                      >
                        <ItemImage
                          imageId={battleReport.loot.image}
                          alt={battleReport.loot.name}
                          fill
                          sizes='24px'
                          style={{ objectFit: 'contain', padding: '2px' }}
                        />
                      </span>
                    )}
                    <span>{battleReport.loot.name}</span>
                    {battleReport.loot.quality && battleReport.loot.quality !== 'common' && (
                      <span className='opacity-80 font-normal'>({battleReport.loot.quality.replace('_plus', '+')})</span>
                    )}
                  </span>
                </ItemTooltip>
              ) : (
                <>
                  {battleReport.loot.image && (
                    <span
                      className='relative inline-block shrink-0'
                      style={{
                        width: '24px',
                        height: '24px',
                        background: '#a89f91',
                        border: '1px solid #5c3a21',
                        borderRadius: '2px',
                      }}
                    >
                      <ItemImage
                        imageId={battleReport.loot.image}
                        alt={battleReport.loot.name}
                        fill
                        sizes='24px'
                        style={{ objectFit: 'contain', padding: '2px' }}
                      />
                    </span>
                  )}
                  <span>{battleReport.loot.name}</span>
                  {battleReport.loot.quality && battleReport.loot.quality !== 'common' && (
                    <span className='opacity-80 font-normal'>({battleReport.loot.quality.replace('_plus', '+')})</span>
                  )}
                </>
              )}
            </p>
          )}
        </DescriptionCard>
      :
        <DescriptionCard
          title='Rewards'
        >
          {battleReport.result.winner === attacker.name ?
          <>
            <p className='text-sm px-2 py-1 flex items-center gap-1'>
              <span className='font-semibold'>{attacker.name}</span> earned {battleReport.result.honorEarned} honor.
            </p>
            <p className='text-sm px-2 py-1'>
              <span className='font-semibold'>{defender.name}</span> has lost {battleReport.result.honorLost * -1} honor.
            </p>
            {(battleReport.result.crownsDrop ?? 0) > 0 && (
              <p className='text-sm px-2 py-1 flex items-center gap-1'>
                <span className='font-semibold'>{attacker.name}</span> looted{' '}
                {battleReport.result.crownsDrop}
                <Image src={'/images/crowns.png'} width={12} height={12} alt='gold' style={{ width: 'auto', height: 'auto' }} />
                {' '}from the win.
              </p>
            )}
          </>
          :
          <>
            <p className='text-sm px-2 py-1 flex items-center gap-1'>
              <span className='font-semibold'>{defender.name}</span> earned {battleReport.result.honorEarned} honor.
            </p>
            <p className='text-sm px-2 py-1'>
              <span className='font-semibold'>{attacker.name}</span> has lost {battleReport.result.honorLost * -1} honor.
            </p>
          </>
          }
          {battleReport.potClaimed && battleReport.potClaimed > 0 && (
            <p className='text-sm px-2 py-1 flex items-center gap-1 font-semibold text-red3'>
              Champion pot claimed: {battleReport.potClaimed}
              <Image
                src={'/images/crowns.png'}
                width={12}
                height={12}
                alt='crowns'
                style={{ width: 'auto', height: 'auto' }}
              />
            </p>
          )}
        </DescriptionCard>
      }

      <div className='flex flex-row justify-between items-start w-full px-4 gap-2'>
        <FighterCard
          image={attacker.gender}
          name={attacker.name}
          power={calculatePower(attacker)}
          profile={combatProfile(attacker, defender)}
        />

        <div className='text-lg text-red3 font-bold items-center flex flex-col pt-20'>
          <Image
            src={`/images/fight.png`}
            width={55}
            height={22}
            alt='fight'
            style={{ width: 'auto', height: 'auto' }}
          />
          Vs
        </div>

        <FighterCard
          image={isNpc ? defender.image : defender.gender}
          name={defender.name}
          power={isNpc ? defender.power : calculatePower(defender)}
          expedition={battleReport.expedition}
          isEnemy={isNpc}
          profile={combatProfile(defender, attacker)}
        />
      </div>

      <DescriptionCard
        title={`Statistics - ${formatDateTime(battleDate)}`}
      >
        <div className='px-4 w-full grid grid-cols-3 gap-2 text-sm py-2'>
          <div className='flex flex-col'>
            <span className='font-semibold border-b border-cream2 pb-1 mb-1'>Combatant</span>
            <span>{attacker.name}</span>
            <span>{defender.name}</span>
          </div>
          <div className='flex flex-col items-center'>
            <span className='font-semibold border-b border-cream2 pb-1 mb-1'>Damage dealt</span>
            <span>{battleReport.result.attackerTotalDamage}</span>
            <span>{battleReport.result.defenderTotalDamage}</span>
          </div>
          <div className='flex flex-col items-center'>
            <span className='font-semibold border-b border-cream2 pb-1 mb-1'>Health left</span>
            <span>{Math.max(0, Math.round(battleReport.result.attackerFinalHealth))} / {battleReport.result.attackerHealth}</span>
            <span>{Math.max(0, Math.round(battleReport.result.defenderFinalHealth))} / {battleReport.result.defenderHealth}</span>
          </div>
        </div>

        <div className='px-4 w-full grid grid-cols-3 gap-2 text-xs pb-2 opacity-90'>
          <div className='flex flex-col'>
            <span className='font-semibold'>Hits / attempts</span>
            <span>
              {battleReport.result.attackerHitsLanded ?? 0} / {battleReport.result.attackerHitsAttempted ?? 0}
            </span>
            <span>
              {battleReport.result.defenderHitsLanded ?? 0} / {battleReport.result.defenderHitsAttempted ?? 0}
            </span>
          </div>
          <div className='flex flex-col items-center'>
            <span className='font-semibold'>Critical hits</span>
            <span>{battleReport.result.attackerCritsLanded ?? 0}</span>
            <span>{battleReport.result.defenderCritsLanded ?? 0}</span>
          </div>
          <div className='flex flex-col items-center'>
            <span className='font-semibold'>Damage absorbed</span>
            <span>{battleReport.result.attackerArmorAbsorbed ?? 0}</span>
            <span>{battleReport.result.defenderArmorAbsorbed ?? 0}</span>
          </div>
        </div>

        <div className='px-4 pb-2 text-xs opacity-90'>
          Total rounds: <strong>{battleReport.result.totalRounds ?? battleReport.rounds.length}</strong>
        </div>
      </DescriptionCard>

      <div className='w-full info-card'>
        <h2 className='text-md font-semibold border-b-[3px] border-cream2 bg-cream2 px-2 text-brown2'>
          Battle Report
        </h2>
        {battleReport.rounds.map((round, roundIndex) => (
          <div key={`${round.attackerHP} - ${round.defenderHP} - ${roundIndex}`}>
            <h3 className='text-sm font-semibold border-b-[3px] border-cream2 bg-[#f3d48c] px-2 text-center text-brown2'>
              Round {roundIndex + 1}
            </h3>
            {round.events.map((event, eventIndex) => (
              <p
                key={`${roundIndex}-${eventIndex}`}
                className={`${eventIndex === 1 || eventIndex === 3 ? 'bg-cream' : 'bg-[#dbc389]'} text-sm p-2 text-brown2`}
              >
                {event}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Page;