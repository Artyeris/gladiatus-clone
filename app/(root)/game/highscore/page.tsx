import HighscoreContent from '@/components/content/HighscoreContent'
import { getArenaHighscore } from '@/lib/actions/character/getArenaHighscore'
import { getUser } from '@/lib/actions/user/getUser.action'
import type { HighscorePeriod } from '@/lib/types/highscore'
import { redirect } from 'next/navigation'

interface Props {
  searchParams: { page?: string; period?: string };
}

const Page = async ({ searchParams }: Props) => {
  const user = await getUser().catch(() => redirect('/'));
  const requested = parseInt(searchParams?.page ?? '1', 10);
  const page = Number.isFinite(requested) && requested > 0 ? requested : 1;
  const period: HighscorePeriod = searchParams?.period === 'week' ? 'week' : 'all';
  const highscore = await getArenaHighscore(page, period);

  if (!user || !highscore) return null;

  if (!user.character) redirect('/onboarding');

  return (
    <div className='px-8 flex flex-col gap-4'>
      <HighscoreContent highscore={highscore} />
    </div>
  )
}

export default Page;
