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
  handleClick: () => void;
}

const TrainStat = ({
  statName,
  statValue,
  characterCrowns,
  handleClick,
  crownsValue,
  breakdown,
  last = false,
}: TrainStatProps) => {
  const canTrain = characterCrowns > crownsValue;

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
        <div
          className={`${canTrain ? 'cursor-pointer hover:brightness-110' : ''} ml-2`}
          onClick={canTrain ? handleClick : () => {}}
        >
          <Image
            src='/images/train-stat.jpg'
            width={25}
            height={25}
            alt='train'
            className={`shadow-sm ${!canTrain && 'grayscale'}`}
          />
        </div>
      </div>
    </div>
  )
};

export default TrainStat;
