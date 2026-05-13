import { redirect } from 'next/navigation';

import MessagesContent from '@/components/content/MessagesContent';
import { listMessages } from '@/lib/actions/message/message.action';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const result = await listMessages();

  return <MessagesContent messages={result.messages} unread={result.unread} />;
};

export default Page;
