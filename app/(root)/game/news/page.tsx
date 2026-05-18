import { redirect } from 'next/navigation';

import { getUser } from '@/lib/actions/user/getUser.action';

// Placeholder News page -- the icon is wired into the side banner's
// shortcut row, but there are no live events to surface yet. The
// page will list arena finals, server-wide bonuses and seasonal
// drops once an events backend lands.
const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  return (
    <div className='px-6 flex flex-col gap-3 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm'>
        News
      </div>
      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div className='px-3 py-6 italic opacity-80 text-center'>
          No events at the moment.
          <div className='mt-1 text-xs opacity-70 not-italic'>
            Server-wide announcements, arena finals and seasonal bonuses
            will appear here once they go live.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
