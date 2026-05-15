'use client'

import DescriptionCard from '@/components/cards/DescriptionCard';
import { battleArena } from '@/lib/actions/battle/battleArena.action';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { canFight } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface ArenaTierInfo {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number | null;
}

interface ArenaPotInfo {
  amount: number;
  championId: string | null;
  championName: string | null;
  growthPerHour: number;
  salaryPerHour: number;
  expPerHour: number;
}

interface ArenaContentProps {
  arenaRivals: {
    name: string;
    _id: string;
    honor: number;
    level?: number;
    isBot?: boolean;
    rank: number;
    isMe?: boolean;
  }[],
  tier: ArenaTierInfo;
  myRank: number;
  character: CharacterInterface;
  pot?: ArenaPotInfo;
}

const ArenaContent = ({ arenaRivals, character, tier, myRank, pot }: ArenaContentProps) => {
  const [canCharacterFight, setCanCharacterFight] = useState(canFight({ time: new Date(character.arenaLastBattle).getTime(), fight: 'arena' }));
  const router = useRouter();

  const isMyChampion = pot?.championId === String(character._id);

  const handleClick = async (rivalId: string) => {
    const response = await battleArena(rivalId);

    if (response && response.error) return toast.error(response.error.message);

    router.push(`/game/battle/${response}`);
  }

  // Verify if the character can fight every second.
  useEffect(() => {
    const interval = setInterval(async () => {
      const canCharacterFight = canFight({ time: new Date(character.arenaLastBattle).getTime(), fight: 'arena' });
      if (canCharacterFight) {
        setCanCharacterFight(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [character.arenaLastBattle]);

  const levelRange = tier.maxLevel
    ? `Levels ${tier.minLevel}-${tier.maxLevel}`
    : `Levels ${tier.minLevel}+`;

  return (
    <>
      <div className='border-b-[3px] border-brown2 text-center text-brown2 pb-1'>
        <h1 className='text-xl font-bold'>{tier.name}</h1>
        <div className='text-xs opacity-80'>
          {levelRange} &middot; Your rank: <span className='font-semibold'>#{myRank}</span>
        </div>
      </div>

      {pot && (
        <div
          className={`brown-card rounded-sm px-3 py-2 text-sm text-brown2 flex items-center justify-between gap-3 ${
            isMyChampion ? 'ring-2 ring-red3' : ''
          }`}
        >
          <div className='flex flex-col'>
            <div className='font-semibold'>
              {isMyChampion
                ? 'You hold the champion seat'
                : pot.championName
                  ? `Champion: ${pot.championName}`
                  : 'Tier vacant -- claim #1 to start the pot'}
            </div>
            <div className='text-xs opacity-80'>
              Pot grows by <strong>{pot.growthPerHour}</strong>/h &middot; champion earns{' '}
              <strong>{pot.salaryPerHour}</strong> gold + <strong>{pot.expPerHour}</strong> XP/h
              {isMyChampion && <span className='italic ml-1'>(paid on each visit)</span>}
            </div>
          </div>
          <div className='text-right shrink-0'>
            <div className='text-xs opacity-80'>Arena pot</div>
            <div className='text-xl font-bold text-red3 flex items-center gap-1 justify-end'>
              {pot.amount}
              <Image
                src='/images/crowns.png'
                width={14}
                height={14}
                alt='crowns'
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      )}

      <div className='flex gap-4'>
        <DescriptionCard title='Arena Ranking'>
          <div className='flex flex-col w-full justify-between text-sm'>
            <div className='flex w-full gap-2 font-semibold border-b border-brown2 pb-1'>
              <div className='min-w-[50px]'>Rank</div>
              <div className='min-w-[50px]'>Honor</div>
              <div className='min-w-[40px]'>Lvl</div>
              <div className='w-[160px]'>Name</div>
            </div>
            {arenaRivals.map((rival) => {
              const isMe = rival.isMe || rival._id === character._id;
              return (
                <div
                  className={`flex flex-col w-full justify-between ${isMe && 'bg-cream2/30 rounded-sm'}`}
                  key={rival._id}
                >
                  <div className='flex w-full gap-2 items-center'>
                    <div className='min-w-[50px] font-semibold'>{rival.rank}</div>
                    <div className='min-w-[50px] font-semibold'>{rival.honor}</div>
                    <div className='min-w-[40px]'>{rival.level ?? '-'}</div>
                    <div
                      className={`w-[160px] ${!isMe && 'font-semibold underline cursor-pointer hover:text-red3'}`}
                      onClick={!isMe ? () => router.push(`/game/character/${rival._id}`) : () => {}}
                    >
                      {rival.name}
                      {rival.isBot && <span className='ml-1 text-[10px] opacity-70 italic'>NPC</span>}
                    </div>
                    {!isMe && (
                      <div className='cursor-pointer'>
                        <Image
                          src={`/images/fight.png`}
                          width={55}
                          height={22}
                          alt='fight'
                          style={{ width: 'auto', height: 'auto' }}
                          onClick={canCharacterFight ? () => handleClick(rival._id) : () => {}}
                          className={canCharacterFight ? '' : 'cursor-not-allowed grayscale'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DescriptionCard>
      </div>
    </>
  )
}

export default ArenaContent;
