import { redirect } from 'next/navigation';

import MarketContent from '@/components/content/MarketContent';
import { listMarketAction } from '@/lib/actions/market/market.action';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser(true).catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const market = await listMarketAction();
  const listings = 'listings' in market ? market.listings : [];

  return <MarketContent character={user.character} listings={listings} />;
};

export default Page;
