'use client'

import Image from 'next/image';

import StatBar from '@/components/shared/StatBar';
import { StatBreakdown } from '@/lib/utils/statUtils';

interface TrainStatProps {
  statName: string;
  statValue: number;
  last?: boolean;
  characterCrowns: number;
  crownsValue: number;
  breakdown: StatBreakdown;
  // Receives a "count" so the parent can promote a Shift-click into a
  // bulk +5 train. Falls back to count=1 on plain click.
  handleClick: (count?: number) => void;
  disabled?: boolean;
  isPending?: boolean;
}

const TrainStat = ({
  statName,
  statValue,
  characterCrowns,
  handleClick,
  crownsValue,
  breakdown,
  disabled = false,
  isPending = false,
  last = false,
}: TrainStatProps) => {
  const canTrain = characterCrowns >= crownsValue && !disabled;

  return (
    <div
      className={`flex justify-between px-2 py-1 items-center text-brown2 ${
        !last && 'border-b-[3px] border-cream2'
      }`}
    >
      <div className='flex items-center gap-2 flex-1 max-w-[260px]'>
        <span className='w-24'>{statName}</span>
        <div className='flex-1'>
          <StatBar statName={statName} breakdown={breakdown} />
        </div>
        <span className='font-semibold text-red3 w-6 text-right'>{statValue}</span>
      </div>
      <div className='flex justify-between text-sm font-semibold items-center'>
        <div className='flex items-center gap-1'>
          {crownsValue}
          <Image
            src={'/images/crowns.png'}
            width={12}
            height={12}
            alt='crowns'
          />
        </div>
        <button
          type='button'
          className={`${canTrain ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed'} relative ml-2`}
          onClick={(e) => handleClick(e.shiftKey ? 5 : 1)}
          disabled={!canTrain}
          aria-label={`Train ${statName}`}
          title={`Train ${statName} (hold Shift to train +5)`}
        >
          <Image
            src='/images/train-stat.jpg'
            width={25}
            height={25}
            alt=''
            className={`shadow-sm ${!canTrain && 'grayscale opacity-60'}`}
          />
          {isPending && (
            <span className='absolute inset-1 rounded-full border-2 border-cream2 border-t-red3 animate-spin' />
          )}
        </button>
      </div>
    </div>
  )
};

export default TrainStat;
