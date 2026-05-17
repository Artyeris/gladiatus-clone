import { redirect } from 'next/navigation';

import SettingsContent from '@/components/content/SettingsContent';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const currentLanguage = (user.language === 'lt' ? 'lt' : 'en') as 'en' | 'lt';
  return <SettingsContent currentLanguage={currentLanguage} />;
};

export default Page;
