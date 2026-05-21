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

// Coalesce rapid successive train clicks into a single fancy toast
// that says "Stat trained x N" rather than firing N generic toasts.
// Counter is keyed by stat id so training different stats keeps its
// own stack. Resets after a brief idle window.
const TRAIN_STREAK_RESET_MS = 1800;
const trainStreaks = new Map<string, { count: number; lastAt: number }>();

const TrainingContent = ({ character }: { character: CharacterInterface }) => {
  const router = useRouter();
  const [currentCharacter, setCurrentCharacter] = useState(character);
  const [pendingStat, setPendingStat] = useState<string | null>(null);

  useEffect(() => {
    setCurrentCharacter(character);
  }, [character]);

  const showTrainToast = (statId: string) => {
    const now = Date.now();
    const prev = trainStreaks.get(statId);
    const streak = prev && now - prev.lastAt < TRAIN_STREAK_RESET_MS ? prev.count + 1 : 1;
    trainStreaks.set(statId, { count: streak, lastAt: now });
    const label = stats.find((s) => s.id === statId)?.name ?? 'Stat';
    toast.custom(
      (t) => (
        <div
          className={`red-card text-cream2 px-4 py-2 rounded-sm flex items-center gap-3 shadow-xl ${
            t.visible ? 'animate-in' : 'animate-out'
          }`}
          style={{
            fontFamily: "var(--font-cinzel), 'Cinzel', serif",
            letterSpacing: '0.08em',
            border: '2px solid #eed7a1',
            outline: '2px solid #974342',
          }}
        >
          <span className='text-xl text-gold'>⚔</span>
          <span className='font-semibold tracking-wide'>{label} trained</span>
          {streak > 1 && (
            <span
              className='ml-1 px-2 py-[1px] rounded-sm font-bold tabular-nums'
              style={{ background: '#e6b749', color: '#3e2714' }}
            >
              x{streak}
            </span>
          )}
        </div>
      ),
      { id: `train-${statId}`, duration: 1500 },
    );
  };

  const handleClick = async (stat: string, count: number = 1) => {
    if (pendingStat) return;

    setPendingStat(stat);

    try {
      const response = await trainCharacter(stat, count);

      if (response?.error) {
        toast.error(response.error.message);
        return;
      }

      if (response?.character) {
        setCurrentCharacter(response.character);
      }

      // Stack the toast streak by the actual number of trains the
      // server granted (1 for plain click, up to N for shift-click).
      for (let i = 0; i < (response?.purchased ?? 1); i++) showTrainToast(stat);
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
          width={240}
          height={240}
          src={`/images/barracks.webp`}
          alt='barracks'
          className='rounded-sm shrink-0 object-contain'
          style={{ width: '240px', height: '240px' }}
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
              handleClick={(count) => handleClick(stat.id, count ?? 1)}
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
