'use client'

import DescriptionCard from '@/components/cards/DescriptionCard';
import { battleArena } from '@/lib/actions/battle/battleArena.action';
import { claimMyChampionSalary } from '@/lib/actions/arena/arenaPot.action';
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
  const [claiming, setClaiming] = useState(false);

  const onClaimSalary = async () => {
    setClaiming(true);
    const res = await claimMyChampionSalary();
    setClaiming(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`+${res.awarded} gold salary`);
    router.refresh();
  };

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
              <strong>{pot.salaryPerHour}</strong> gold/h
            </div>
            {isMyChampion && (
              <button
                type='button'
                onClick={onClaimSalary}
                disabled={claiming}
                className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50 mt-2 w-fit inline-flex items-center gap-1'
                title='Claim accrued champion salary'
              >
                <span>Claim salary</span>
                <Image
                  src='/images/crowns.png'
                  width={12}
                  height={12}
                  alt='gold'
                  style={{ width: 'auto', height: 'auto' }}
                />
              </button>
            )}
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
          <div className='flex flex-col w-full text-base'>
            <div className='flex w-full gap-3 font-semibold border-b-[2px] border-brown2 pb-2 px-2'>
              <div className='w-[60px]'>Rank</div>
              <div className='w-[80px]'>Honor</div>
              <div className='w-[50px]'>Lvl</div>
              <div className='flex-1'>Name</div>
              <div className='w-[70px] text-center'>Action</div>
            </div>
            {arenaRivals.map((rival) => {
              const isMe = rival.isMe || rival._id === character._id;
              return (
                <div
                  key={rival._id}
                  className={`flex w-full gap-3 items-center px-2 py-2 border-b border-cream2/60 ${
                    isMe ? 'bg-cream2/40' : 'hover:bg-cream2/20'
                  } transition`}
                >
                  <div className='w-[60px] font-semibold text-lg text-red3'>#{rival.rank}</div>
                  <div className='w-[80px] font-semibold'>{rival.honor}</div>
                  <div className='w-[50px]'>{rival.level ?? '-'}</div>
                  <div
                    className={`flex-1 truncate ${!isMe && 'font-semibold underline cursor-pointer hover:text-red3'}`}
                    onClick={!isMe ? () => router.push(`/game/character/${rival._id}`) : () => {}}
                  >
                    {rival.name}
                    {rival.isBot && <span className='ml-1 text-[10px] opacity-70 italic'>NPC</span>}
                  </div>
                  <div className='w-[70px] flex justify-center'>
                    {!isMe && (
                      <Image
                        src={`/images/fight.png`}
                        width={62}
                        height={26}
                        alt='fight'
                        style={{ width: 'auto', height: 'auto', cursor: canCharacterFight ? 'pointer' : 'not-allowed' }}
                        onClick={canCharacterFight ? () => handleClick(rival._id) : () => {}}
                        className={canCharacterFight ? 'hover:brightness-110' : 'grayscale'}
                      />
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
