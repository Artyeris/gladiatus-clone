import { getUser } from '@/lib/actions/user/getUser.action';
import { redirect } from 'next/navigation';
import TrainingContent from '@/components/content/TrainingContent';
import { UserInterface } from '@/lib/interfaces/user.interface';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/')) as UserInterface;

  if (!user) return null;

  if (!user.character) redirect('/onboarding');

  const character = user.character;

  return (
    <div className='game-page'>
      <TrainingContent character={character} />
    </div>
  )
}

export default Page
