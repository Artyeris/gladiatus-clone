import { redirect } from 'next/navigation';

import TravelContent from '@/components/content/TravelContent';
import { getUser } from '@/lib/actions/user/getUser.action';
import type { Country } from '@/constants/expeditions';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const character: any = user.character;
  return (
    <TravelContent
      characterLevel={character.level ?? 1}
      characterGold={character.crowns ?? 0}
      currentCountry={(character.currentCountry as Country) ?? 'italy'}
      unlockedCountries={(character.unlockedCountries as Country[]) ?? ['italy']}
    />
  );
};

export default Page;
