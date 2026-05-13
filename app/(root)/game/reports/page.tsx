import { redirect } from 'next/navigation';

import ReportsContent from '@/components/content/ReportsContent';
import { listBattleReports } from '@/lib/actions/battle/listBattleReports.action';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const result = await listBattleReports();

  return <ReportsContent reports={result.reports} />;
};

export default Page;
