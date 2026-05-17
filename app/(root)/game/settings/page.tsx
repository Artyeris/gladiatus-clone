import { redirect } from 'next/navigation';

import SettingsContent from '@/components/content/SettingsContent';
import { getUser } from '@/lib/actions/user/getUser.action';
import { RENAME_COST_GOLD } from '@/lib/actions/user/updateSettings.constants';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const currentLanguage = (user.language === 'lt' ? 'lt' : 'en') as 'en' | 'lt';
  return (
    <SettingsContent
      currentLanguage={currentLanguage}
      currentName={user.character.name}
      renameCost={RENAME_COST_GOLD}
      currentGold={user.character.crowns ?? 0}
    />
  );
};

export default Page;
