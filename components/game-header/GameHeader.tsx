import { UserInterface } from '@/lib/interfaces/user.interface';
import GameHeaderStats from '@/components/game-header/GameHeaderStats';
import GameHeaderExpeditionTimer from '@/components/game-header/GameHeaderExpeditionTimer';
import GameHeaderArenaTimer from '@/components/game-header/GameHeaderArenaTimer';
import GameHeaderShortcuts from '@/components/game-header/GameHeaderShortcuts';

const GameHeader = ({ user }: { user: UserInterface }) => {
  const character = user.character;

  if (!user.character) return null;

  return (
    <div className='w-full h-[145px] orange-card drop-shadow-2xl px-4 flex flex-row gap-4 items-center'>
      {/* @ts-expect-error -- async server component */}
      <GameHeaderShortcuts />
      <GameHeaderStats character={character} />
      <GameHeaderExpeditionTimer character={character} />
      <GameHeaderArenaTimer character={character} />
    </div>
  )
}

export default GameHeader;