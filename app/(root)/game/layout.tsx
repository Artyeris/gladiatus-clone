import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import GameNavbar from '@/components/shared/GameNavbar';
import NavigationBanner from '@/components/shared/NavigationBanner';
import GameHeader from '@/components/game-header/GameHeader';
import { getUser } from '@/lib/actions/user/getUser.action';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser().catch(() => redirect('/'));

  if (!user) return null;

  return (
    <div className={`${inter.className} main-container`}>
      <div className='game-shell' style={{ backgroundImage: 'url("/images/game-image.webp")' }}>
        <Toaster
          toastOptions={{
            className: '',
            style: {
              background: '#eed7a1',
              color: '#540400',
              border: '2px solid #974342',
            }
          }}
        />
        <GameNavbar />
        <div className='game-stage'>
          <NavigationBanner />
          <div className='game-content-column'>
            <GameHeader user={user} />
            <div className='main-cream-card game-content-frame'>
              {children}
            </div>
            <div className='footer game-footer orange-gradient' />
          </div>
        </div>
      </div>
    </div>
  )
}
