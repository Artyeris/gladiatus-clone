import { redirect } from 'next/navigation';

import PackagesContent from '@/components/content/PackagesContent';
import { listPackages } from '@/lib/actions/package/package.action';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const res = await listPackages();
  if (res.error || !res.packages) {
    return <div className='px-6 py-4 text-brown2'>Failed to load packages: {res.error?.message}</div>;
  }

  return <PackagesContent initialPackages={res.packages} />;
};

export default Page;
