import { redirect } from 'next/navigation';

import AuctionContent from '@/components/content/AuctionContent';
import { listAuctionsAction } from '@/lib/actions/auction/auction.action';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser(true).catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const result = await listAuctionsAction();
  const auctions = ('auctions' in result ? result.auctions : []) ?? [];

  return <AuctionContent character={user.character} auctions={auctions} />;
};

export default Page;
