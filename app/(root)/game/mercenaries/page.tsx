import { redirect } from 'next/navigation';

import MercenariesContent from '@/components/content/MercenariesContent';
import {
  getMercenaryListings,
  listMyMercenaries,
  listVendorMercenaries,
} from '@/lib/actions/mercenary/mercenary.action';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const [vendor, owned, listings] = await Promise.all([
    listVendorMercenaries(),
    listMyMercenaries(),
    getMercenaryListings(),
  ]);
  const character: any = user.character;

  return (
    <MercenariesContent
      characterGold={character.crowns ?? 0}
      offers={(vendor as any)?.ok ? (vendor as any).offers : []}
      owned={(owned as any)?.ok ? (owned as any).mercenaries : []}
      listings={(listings as any)?.ok ? (listings as any).listings : []}
    />
  );
};

export default Page;
