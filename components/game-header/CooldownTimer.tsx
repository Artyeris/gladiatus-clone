'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CooldownTimerProps {
  name: string;
  message: string;
  cooldown: number;
  characterLastBattle?: Date;
  redirect?: string;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const CooldownTimer = ({ name, message, cooldown, characterLastBattle, redirect }: CooldownTimerProps) => {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!characterLastBattle) {
      setTimeRemaining(0);
      return;
    }

    const updateTimeRemaining = () => {
      const expeditionLastBattleTime = new Date(characterLastBattle).getTime();
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - expeditionLastBattleTime;
      const timeRemainingUntilCooldown = Math.ceil(cooldown - timeDifference / 1000);

      setTimeRemaining(timeRemainingUntilCooldown);
      return timeRemainingUntilCooldown;
    };

    if (updateTimeRemaining() <= 0) return;

    const intervalId = setInterval(() => {
      if (updateTimeRemaining() <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [characterLastBattle, cooldown]);

  let progressPercentage = Math.round(((cooldown - timeRemaining) / cooldown) * 100)

  // Sometimes the percentage calculation gives 98 or 99 if the cooldown its too short, this will avoid the progress bar being incompleted when the timer is done.
  if (timeRemaining <= 0) progressPercentage = 100;

  return (
    <div className='flex flex-row gap-1 font-semibold text-red3 items-center justify-between w-full px-2'>
      <Image
        src={`/images/${name}.png`}
        width={19}
        height={19}
        alt={name}
        style={{ width: 'auto', height: 'auto' }}
      />
      <div 
        className={`progressbar bg-brown2 ${progressPercentage >= 100 && redirect && 'cursor-pointer hover:brightness-110'}`}
        onClick={progressPercentage >= 100 && redirect ? () => router.push(`/game/${redirect}`) : () => {}}
      >
        <div style={{
            height: "100%",
            width: `${progressPercentage}%`,
            backgroundColor: "#003805",
            boxShadow: "0px -5px 5px rgba(0, 0, 0, 0.5)"
          }}
        />
        <span className='progress-percent text-gold font-semibold whitespace-nowrap'>
          {progressPercentage >= 100 ? message : formatTime(timeRemaining)}
        </span>
      </div>
    </div>
  )
}

export default CooldownTimer;
