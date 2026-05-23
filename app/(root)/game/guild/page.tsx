import { redirect } from 'next/navigation';

import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  return (
    <div className='px-6 flex flex-col gap-3 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm'>
        Guild
      </div>
      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div className='px-3 py-10 text-center'>
          <div className='text-lg font-bold tracking-wide'>Coming Soon</div>
          <div className='mt-2 text-xs opacity-80'>
            Guild halls, ledgers and shared raids will land here once the
            multiplayer backend is ready.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
