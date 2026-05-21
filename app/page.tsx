import DescriptionCard from '@/components/cards/DescriptionCard';
import Link from 'next/link';

// Landing page is a pure server component now. The navbar has been
// removed; Sign In / Sign Up live inside the cream card as two big
// CTAs at the bottom, and the routes are <Link>s so Next prefetches
// the auth pages -- no wait when the user actually clicks.

export default function Home() {
  return (
    <main>
      <div
        className='w-full flex justify-center min-h-screen bg-cover'
        style={{ backgroundImage: 'url("/images/landing-page-image.webp")' }}
      >
        <div className='flex flex-col items-center w-[50%] min-h-screen'>
          <div className='main-cream-card w-[97%] h-full flex flex-col items-center pt-14 px-6 gap-4'>
            <h1
              className='text-center w-full pb-2 border-b-[3px] border-red'
              style={{
                fontFamily: "var(--font-cinzel), 'Cinzel', 'Trajan Pro', 'Times New Roman', serif",
                fontSize: '54px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: '#e6b749',
                textShadow:
                  '0 1px 0 #3e2714, 0 2px 0 #5c3a21, 0 4px 10px rgba(0,0,0,0.85), 0 0 22px rgba(167, 100, 56, 0.55)',
              }}
            >
              Gladiatus
            </h1>

            <DescriptionCard title='Welcome to the arena'>
              <div className='flex flex-col gap-3'>
                <p>
                  Step into the sand, gladiator. Raise gold, train your stats,
                  scavenge expeditions for loot, and challenge other fighters
                  in the arena to climb the honour ladder.
                </p>
                <p>
                  Earn idle income at the workplaces, bid on rare gear at the
                  auction, sell your spares on the market, and hunt daily
                  quests for fast gold and experience. Hold the champion seat
                  of your tier and collect a passive gold salary the whole
                  time you sit at the top.
                </p>
              </div>
            </DescriptionCard>

            <DescriptionCard title='Under the hood'>
              <div className='flex flex-col gap-2 text-sm'>
                <p>This clone runs on a modern web stack:</p>
                <ul className='list-disc list-inside flex flex-col gap-[2px] pl-2'>
                  <li>
                    <Link href='https://nextjs.org' className='text-red3 underline'>Next.js 14</Link>
                    {' '}App Router with Server Components and Server Actions
                  </li>
                  <li>
                    <Link href='https://react.dev' className='text-red3 underline'>React 18</Link>
                    {' '}+{' '}
                    <Link href='https://www.typescriptlang.org' className='text-red3 underline'>TypeScript</Link>
                  </li>
                  <li>
                    <Link href='https://www.mongodb.com/' className='text-red3 underline'>MongoDB</Link>
                    {' '}via{' '}
                    <Link href='https://mongoosejs.com/' className='text-red3 underline'>Mongoose</Link>
                    {' '}for persistence
                  </li>
                  <li>
                    <Link href='https://tailwindcss.com' className='text-red3 underline'>Tailwind CSS</Link>
                    {' '}with the custom Gladiatus card / button palette
                  </li>
                  <li>
                    <Link href='https://www.radix-ui.com/' className='text-red3 underline'>Radix UI</Link>
                    {' '}primitives wrapped with{' '}
                    <Link href='https://ui.shadcn.com/' className='text-red3 underline'>shadcn/ui</Link>
                  </li>
                  <li>
                    <Link href='https://react-dnd.github.io/react-dnd/about' className='text-red3 underline'>react-dnd</Link>
                    {' '}drives the inventory / equipment drag-and-drop
                  </li>
                  <li>
                    <Link href='https://lucide.dev/' className='text-red3 underline'>Lucide</Link>
                    {' '}icons; the{' '}
                    <Link href='https://fonts.google.com/specimen/Cinzel' className='text-red3 underline'>Cinzel</Link>
                    {' '}display font for the engraved logo
                  </li>
                </ul>
              </div>
            </DescriptionCard>

            <div className='flex flex-row gap-3 mt-2'>
              <Link
                href='/sign-in'
                prefetch
                className='general-button rounded-sm font-semibold hover:brightness-110 text-brown2 w-40 h-10 flex items-center justify-center'
              >
                Log in
              </Link>
              <Link
                href='/sign-up'
                prefetch
                className='general-button rounded-sm font-semibold hover:brightness-110 text-brown2 w-40 h-10 flex items-center justify-center'
              >
                Sign Up
              </Link>
            </div>
          </div>
          <div className='footer w-full h-[50px] orange-gradient' />
        </div>
      </div>
    </main>
  );
}
