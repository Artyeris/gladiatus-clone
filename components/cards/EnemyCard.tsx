'use client';

import { EnemyStatsInterface } from '@/lib/interfaces/enemy.interface'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import Image from 'next/image'
import { Button } from '../ui/button'
import toast from 'react-hot-toast';
import { battleEnemy } from '@/lib/actions/battle/battleEnemy.action';
import { useRouter } from 'next/navigation';

interface EnemyCardProps {
  enemy: EnemyStatsInterface;
  expedition: string;
  canFight: boolean;
}

const EnemyCard = ({ enemy, expedition, canFight }: EnemyCardProps) => {
  const router = useRouter();
  
  const handleClick = async () => {
    const response = await battleEnemy({ enemyName: enemy.image, expeditionName: expedition });

    if (response && response.error) return toast.error(response.error.message);

    router.push(`/game/battle/${response}`);
  }

  return (
      <div className='w-full flex flex-col items-center gap-2 drop-shadow-lg z-[998]'>
        <h2 className='red-card text-center font-semibold text-cream2 w-full px-2 py-1'>
          {enemy.name}
        </h2>
        <div className='w-full'>
          <HoverCard closeDelay={0}>
            <HoverCardTrigger asChild>
              <Image
                src={`/enemies/${expedition}/${enemy.image}.jpg`}
                width={160}
                height={185}
                alt={enemy.image}
                className='rounded-sm w-full h-auto'
                style={{ aspectRatio: '135/156', objectFit: 'cover' }}
              />
            </HoverCardTrigger>
            <HoverCardContent
              side='right'
              align='start'
              sideOffset={6}
              className='z-[9999] w-auto p-0 border-none shadow-md'
            >
              <div className='red-card flex flex-col min-w-[210px] px-3 py-2 text-cream2 text-xs gap-[3px]'>

                <span className='font-semibold text-sm border-b border-cream2 pb-1 mb-1'>
                  {enemy.name}
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Level:
                  <span>
                    {enemy.level ? `${enemy.level[0]} - ${enemy.level[enemy.level.length - 1]}` : '?'}
                  </span>
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Experience:
                  <span>
                    {enemy.experience ? `${enemy.experience[0]} - ${enemy.experience[enemy.experience.length - 1]}` : '?'}
                  </span>
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Gold:
                  <span>
                    {enemy.crowns ? `${enemy.crowns[0]} - ${enemy.crowns[enemy.crowns.length - 1]}` : '?'}
                  </span>
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Strength:
                  <span>
                    {enemy.strength ? `${enemy.strength[0]} - ${enemy.strength[enemy.strength.length - 1]}` : '?'}
                  </span>
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Endurance:
                  <span>
                    {enemy.endurance ? `${enemy.endurance[0]} - ${enemy.endurance[enemy.endurance.length - 1]}` : '?'}
                  </span>
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Dexterity:
                  <span>
                    {enemy.dexterity ? `${enemy.dexterity[0]} - ${enemy.dexterity[enemy.dexterity.length - 1]}` : '?'}
                  </span>
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Agility:
                  <span>
                    {enemy.agility ? `${enemy.agility[0]} - ${enemy.agility[enemy.agility.length - 1]}` : '?'}
                  </span>
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Intelligence:
                  <span>
                    {enemy.intelligence ? `${enemy.intelligence[0]} - ${enemy.intelligence[enemy.intelligence.length - 1]}` : '?'}
                  </span>
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Charisma:
                  <span>
                    {enemy.charisma ? `${enemy.charisma[0]} - ${enemy.charisma[enemy.charisma.length - 1]}` : '?'}
                  </span>
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Armor:
                  <span>
                    {enemy.armor ? `${enemy.armor[0]} - ${enemy.armor[enemy.armor.length - 1]}` : '?'}
                  </span>
                </span>

                <span className='flex justify-between gap-4 leading-tight'>
                  Damage:
                  <span>
                    {enemy.damage ? `${enemy.damage[0]} - ${enemy.damage[enemy.damage.length - 1]}` : '?'}
                  </span>
                </span>

              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <Button
          className={`general-button w-full h-7 font-semibold text-brown2 hover:bg-brown ${canFight ? 'hover:brightness-110' : 'grayscale cursor-default'}`}
          onClick={canFight ? handleClick : () => {}}
        >
          Fight
        </Button>
      </div>
  )
}

export default EnemyCard;