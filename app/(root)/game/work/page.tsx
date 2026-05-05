import { redirect } from 'next/navigation';

import WorkContent from '@/components/content/WorkContent';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  return <WorkContent character={user.character} />;
};

export default Page;
