import { redirect } from 'next/navigation';

import OverviewContent from '@/components/content/OverviewContent';
import { getUser } from '@/lib/actions/user/getUser.action';
import { listMyMercenaries } from '@/lib/actions/mercenary/mercenary.action';

const Page = async () => {
  const user = await getUser(true).catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const mercRes: any = await listMyMercenaries();
  const mercenaries = mercRes?.ok ? mercRes.mercenaries : [];

  return (
    <OverviewContent
      character={user.character}
      mercenaries={mercenaries}
    />
  );
};

export default Page;
