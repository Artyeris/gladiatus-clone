import { Toaster } from 'react-hot-toast';
import Link from 'next/link';

import GameNavbar from '@/components/shared/GameNavbar';
import NavigationBanner from '@/components/shared/NavigationBanner';
import GameHeader from '@/components/game-header/GameHeader';
import GameHeaderShortcuts from '@/components/game-header/GameHeaderShortcuts';
import { getUser } from '@/lib/actions/user/getUser.action';
import { redirect } from 'next/navigation';

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser().catch(() => redirect('/'));

  if (!user) return null;

  return (
    <div className='w-full flex justify-center min-h-screen bg-fixed bg-cover bg-center' style={{ backgroundImage: 'url("/images/game-image.webp")' }}>
      <Toaster
        position='top-center'
        toastOptions={{
          // Match the in-game red-card chrome (gilded border, cream
          // type) so toasts stop looking like a generic toast lib and
          // feel like part of the Gladiatus UI.
          duration: 2500,
          style: {
            background: '#974342',
            color: '#f4eac8',
            border: '2px solid #eed7a1',
            outline: '2px solid #974342',
            borderRadius: '3px',
            fontFamily: "var(--font-cinzel), 'Cinzel', serif",
            letterSpacing: '0.04em',
            padding: '10px 14px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
          },
          success: {
            iconTheme: { primary: '#e6b749', secondary: '#3e2714' },
          },
          error: {
            iconTheme: { primary: '#ffd4d4', secondary: '#5c2625' },
            style: {
              background: '#5c2625',
              color: '#f4eac8',
              border: '2px solid #eed7a1',
              outline: '2px solid #5c2625',
              borderRadius: '3px',
              fontFamily: "var(--font-cinzel), 'Cinzel', serif",
              letterSpacing: '0.04em',
              padding: '10px 14px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
            },
          },
        }}
      />
      <GameNavbar />
      <div className='w-full min-h-screen flex flex-row justify-center gap-6 pt-0 items-stretch'>
        <NavigationBanner
          characterLevel={user.character?.level ?? 1}
          shortcuts={user.character ? ((await GameHeaderShortcuts()) as any) : null}
        />
        <div className='flex flex-col items-center h-min-full w-[820px]'>
          <GameHeader user={user} />
          <div className='h-min-full main-cream-card w-[820px] flex-grow py-4'>
            <div>{children}</div>
          </div>
          <div className='footer w-[840px] h-[50px] orange-gradient' />
        </div>
      </div>
      <Link
        href='/game/changelog'
        className='fixed bottom-2 right-3 text-xs font-semibold text-cream2/80 hover:text-gold drop-shadow-md z-[999]'
        title='Open change log'
      >
        v0.19.9c
      </Link>
    </div>
  );
}
