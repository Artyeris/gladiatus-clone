'use client'

import Image from 'next/image';
import toast from 'react-hot-toast';

import DescriptionCard from '@/components/cards/DescriptionCard';
import TrainStat from '@/components/shared/TrainStat';
import { stats } from '@/constants';
import { trainCharacter } from '@/lib/actions/character/train.action';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { calculateStatBreakdown, StatId } from '@/lib/utils/statUtils';

const calculateStatCost = (stat: number) => Math.pow(stat, 2) + stat + 1;

const TrainingContent = ({ character }: { character: CharacterInterface }) => {
  const handleClick = async (stat: string) => {
    const response = await trainCharacter(stat);

    if (response && response.error) return toast.error(response.error.message);
  }

  return (
    <>
      <div className='flex gap-4'>
        <Image
          width={168}
          height={194}
          src={`/images/barracks.jpg`}
          alt='barrakcs'
        />
        <DescriptionCard
          title='Training'
        >
          <p>
            Within the city&apos;s barracks, you can observe robust soldiers training, who are willing to impart their skills in exchange for a generous sum of crowns.
          </p>
          <div className='flex items-center gap-1'>
            Your balance: {character.crowns}
            <Image
              src={'/images/crowns.png'}
              width={12}
              height={12}
              alt='crowns'
            />
          </div>
        </DescriptionCard>
      </div>
      <div className='brown-card flex flex-col text-sm rounded-sm'>
        {stats.map((stat, index) => {
          const statValue = character[stat.id] as number;
          const breakdown = calculateStatBreakdown(character, stat.id as StatId);

          return (
            <TrainStat
              key={stat.id}
              statName={stat.name}
              statValue={statValue}
              breakdown={breakdown}
              handleClick={() => handleClick(stat.id)}
              crownsValue={calculateStatCost(statValue)}
              characterCrowns={character.crowns}
              last={index === stats.length - 1}
            />
          );
        })}
      </div>
    </>
  )
}

export default TrainingContent;
