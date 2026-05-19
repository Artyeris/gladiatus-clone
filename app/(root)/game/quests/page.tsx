import { redirect } from 'next/navigation';

import QuestsContent from '@/components/content/QuestsContent';
import { listMyQuests } from '@/lib/actions/quest/quest.action';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const data = await listMyQuests();

  return (
    <QuestsContent
      quests={data.quests}
      max={data.max}
      hasMoreToAccept={data.availableTemplateIds.length > 0}
      nextQuestReadyAt={data.nextQuestReadyAt}
    />
  );
};

export default Page;
