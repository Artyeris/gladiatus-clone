import { redirect } from 'next/navigation';

import VictoriesContent from '@/components/content/VictoriesContent';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser(true).catch(() => redirect('/'));

  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  return <VictoriesContent character={user.character} />;
};

export default Page;
