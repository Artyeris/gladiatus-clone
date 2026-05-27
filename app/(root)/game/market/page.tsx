import { redirect } from 'next/navigation';

import MarketContent from '@/components/content/MarketContent';
import MarketMercenariesPanel from '@/components/content/MarketMercenariesPanel';
import { listMarketAction } from '@/lib/actions/market/market.action';
import { getMercenaryListings } from '@/lib/actions/mercenary/mercenary.action';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser(true).catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const [market, mercListings] = await Promise.all([
    listMarketAction(),
    getMercenaryListings(),
  ]);
  const listings = 'listings' in market ? market.listings : [];
  const character: any = user.character;

  return (
    <>
      <MarketMercenariesPanel
        characterGold={character.crowns ?? 0}
        listings={(mercListings as any)?.ok ? (mercListings as any).listings : []}
      />
      <MarketContent character={user.character} listings={listings} />
    </>
  );
};

export default Page;
