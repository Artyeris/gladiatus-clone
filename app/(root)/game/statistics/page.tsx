import { redirect } from 'next/navigation';

import StatisticsContent from '@/components/content/StatisticsContent';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser(true).catch(() => redirect('/'));

  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  return <StatisticsContent character={user.character} />;
};

export default Page;
