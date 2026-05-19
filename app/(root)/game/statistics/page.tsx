import { redirect } from 'next/navigation';

import StatisticsContent from '@/components/content/StatisticsContent';
import { getUser } from '@/lib/actions/user/getUser.action';
import Item from '@/lib/models/item.model';
import Package from '@/lib/models/package.model';

const Page = async () => {
  const user = await getUser(true).catch(() => redirect('/'));

  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  // Sum sellPrice of every item currently sitting in this character's
  // Packages mailbox, so the Wealth panel can show it alongside the
  // bag + equipment values.
  let packagesValue = 0;
  try {
    const pkgs = await Package.find({ owner: user.character._id })
      .populate({ path: 'item', model: Item, select: 'sellPrice' })
      .lean();
    for (const p of pkgs as any[]) {
      packagesValue += Number(p?.item?.sellPrice ?? 0) || 0;
    }
  } catch {}

  return <StatisticsContent character={user.character} packagesValue={packagesValue} />;
};

export default Page;
