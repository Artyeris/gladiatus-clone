'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import TrainStat from '@/components/shared/TrainStat';
import { trainCharacter } from '@/lib/actions/character/train.action';
import { CharacterInterface } from '@/lib/interfaces/character.interface';

const calculateStatCost = (stat: number) => Math.pow(stat, 2) + stat + 1;

type TrainableStat = 'strength' | 'endurance' | 'agility' | 'dexterity' | 'intelligence' | 'charisma';

const trainingStats: { id: TrainableStat; label: string }[] = [
  { id: 'strength', label: 'Strength' },
  { id: 'endurance', label: 'Endurance' },
  { id: 'agility', label: 'Agility' },
  { id: 'dexterity', label: 'Dexterity' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'charisma', label: 'Charisma' },
];

const TrainingContent = ({ character }: { character: CharacterInterface }) => {
  const router = useRouter();
  const [pendingStat, setPendingStat] = useState<TrainableStat | null>(null);

  const handleClick = async (stat: TrainableStat) => {
    if (pendingStat) return;

    setPendingStat(stat);

    try {
      const response = await trainCharacter({ stat });

      if (response?.error) {
        toast.error(response.error.message);
        return;
      }

      toast.success('Training complete');
      router.refresh();
    } catch {
      toast.error('Training failed');
    } finally {
      setPendingStat(null);
    }
  };

  return (
    <section className="training-panel">
      <div className="training-tab">Training</div>

      <div className="training-description">
        <Image
          className="training-portrait"
          width={168}
          height={194}
          src="/images/barracks.jpg"
          alt="Training master"
          priority
        />

        <div className="training-copy">
          <h1>Training</h1>
          <p>
            Within the city&apos;s barracks, you can observe robust soldiers training, who are willing to impart their skills in exchange for a generous sum of crowns.
          </p>
          <div className="training-balance">
            Your balance: <strong>{character.crowns}</strong>
            <Image src="/images/crowns.png" width={12} height={12} alt="crowns" />
          </div>
        </div>
      </div>

      <div className="training-table">
        {trainingStats.map((stat, index) => (
          <TrainStat
            key={stat.id}
            statName={stat.label}
            statValue={character[stat.id]}
            handleClick={() => handleClick(stat.id)}
            crownsValue={calculateStatCost(character[stat.id])}
            characterCrowns={character.crowns}
            isPending={pendingStat === stat.id}
            disabled={Boolean(pendingStat)}
            last={index === trainingStats.length - 1}
          />
        ))}
      </div>
    </section>
  )
}

export default TrainingContent;
