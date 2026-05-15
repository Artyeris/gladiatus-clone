import { Toaster } from 'react-hot-toast';

import GameNavbar from '@/components/shared/GameNavbar';
import NavigationBanner from '@/components/shared/NavigationBanner';
import GameHeader from '@/components/game-header/GameHeader';
import { getUser } from '@/lib/actions/user/getUser.action';
import { redirect } from 'next/navigation';

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser().catch(() => redirect('/'));

  if (!user) return null;

  return (
    <div className='w-full flex justify-center min-h-screen bg-fixed bg-cover bg-center' style={{ backgroundImage: 'url("/images/game-image.webp")' }}>
      <Toaster
        toastOptions={{
          className: '',
          style: {
            background: '#eed7a1',
          },
        }}
      />
      <GameNavbar />
      <div className='w-full h-min-full flex flex-row justify-center gap-6'>
        <NavigationBanner />
        <div className='flex flex-col items-center h-min-full'>
          <GameHeader user={user} />
          <div className='h-min-full main-cream-card w-[620px] flex-grow py-4'>
            <div>{children}</div>
          </div>
          <div className='footer w-[640px] h-[50px] orange-gradient' />
        </div>
      </div>
      <span className='fixed bottom-2 right-3 text-xs font-semibold text-cream2/80 drop-shadow-md select-none pointer-events-none'>
        v0.12
      </span>
    </div>
  );
}
