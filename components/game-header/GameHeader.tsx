import { UserInterface } from '@/lib/interfaces/user.interface';
import GameHeaderStats from '@/components/game-header/GameHeaderStats';
import GameHeaderExpeditionTimer from '@/components/game-header/GameHeaderExpeditionTimer';
import GameHeaderArenaTimer from '@/components/game-header/GameHeaderArenaTimer';

const GameHeader = ({ user }: { user: UserInterface }) => {
  const character = user.character;

  if (!user.character) return null;

  return (
    <div className='w-full h-[95px] orange-card drop-shadow-2xl px-2 flex flex-row gap-2 items-center'>
      <GameHeaderStats character={character} />
      <GameHeaderExpeditionTimer character={character} />
      <GameHeaderArenaTimer character={character} />
    </div>
  )
}

export default GameHeader;
