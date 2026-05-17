import { redirect } from 'next/navigation';

import RewardsContent from '@/components/content/RewardsContent';
import { getRewardsStatus } from '@/lib/actions/rewards/rewards.action';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const res = await getRewardsStatus();
  if (res.error || !res.status) {
    return <div className='px-6 py-4 text-brown2'>Failed to load rewards: {res.error?.message}</div>;
  }

  return <RewardsContent initialStatus={res.status} />;
};

export default Page;
