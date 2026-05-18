'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import DescriptionCard from '@/components/cards/DescriptionCard';
import TrainStat from '@/components/shared/TrainStat';
import { stats } from '@/constants';
import { trainCharacter } from '@/lib/actions/character/train.action';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { calculateStatBreakdown, StatId } from '@/lib/utils/statUtils';

const calculateStatCost = (stat: number) => Math.pow(stat, 2) + stat + 1;

const TrainingContent = ({ character }: { character: CharacterInterface }) => {
  const router = useRouter();
  const [currentCharacter, setCurrentCharacter] = useState(character);
  const [pendingStat, setPendingStat] = useState<string | null>(null);

  useEffect(() => {
    setCurrentCharacter(character);
  }, [character]);

  const handleClick = async (stat: string) => {
    if (pendingStat) return;

    setPendingStat(stat);

    try {
      const response = await trainCharacter(stat);

      if (response?.error) {
        toast.error(response.error.message);
        return;
      }

      if (response?.character) {
        setCurrentCharacter(response.character);
      } else {
        const statValue = currentCharacter[stat] as number;
        const cost = calculateStatCost(statValue);

        setCurrentCharacter((prev) => ({
          ...prev,
          [stat]: statValue + 1,
          crowns: prev.crowns - cost,
        }));
      }

      toast.success('Stat trained');
      router.refresh();
    } catch {
      toast.error('Training failed');
    } finally {
      setPendingStat(null);
    }
  };

  return (
    <>
      <div className='flex gap-4'>
        <Image
          width={200}
          height={200}
          src={`/images/barracks.webp`}
          alt='barracks'
          className='rounded-sm shrink-0 object-cover'
          style={{ width: '200px', height: '200px' }}
        />
        <DescriptionCard
          title='Training'
        >
          <p>
            Within the city&apos;s barracks, you can observe robust soldiers training, who are willing to impart their skills in exchange for a generous sum of gold.
          </p>
          <div className='flex items-center gap-1'>
            Your balance: {currentCharacter.crowns}
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
          const statValue = currentCharacter[stat.id] as number;
          const breakdown = calculateStatBreakdown(currentCharacter, stat.id as StatId);

          return (
            <TrainStat
              key={stat.id}
              statName={stat.name}
              statValue={statValue}
              breakdown={breakdown}
              handleClick={() => handleClick(stat.id)}
              crownsValue={calculateStatCost(statValue)}
              characterCrowns={currentCharacter.crowns}
              disabled={Boolean(pendingStat)}
              isPending={pendingStat === stat.id}
              last={index === stats.length - 1}
            />
          );
        })}
      </div>
    </>
  )
}

export default TrainingContent;
