import { redirect } from 'next/navigation';

import GladiatorsContent from '@/components/content/GladiatorsContent';
import { getUser } from '@/lib/actions/user/getUser.action';
import { listMyGladiators } from '@/lib/actions/character/gladiators.action';

const MAX_GLADIATORS = 10;

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;

  const res = await listMyGladiators();
  if (res.error) {
    return (
      <div className='px-6 py-4 text-brown2'>
        Failed to load gladiators: {res.error.message}
      </div>
    );
  }

  return (
    <GladiatorsContent
      gladiators={res.gladiators ?? []}
      activeId={res.activeId ?? null}
      maxGladiators={MAX_GLADIATORS}
    />
  );
};

export default Page;
