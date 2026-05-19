'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const LandingNavbar = () => {
  const router = useRouter();

  return (
    <nav className='bg-red fixed w-full h-12 flex flex-row items-center px-14 justify-between drop-shadow-2xl border-b-[3px] border-cream2 red-nav z-[998]'>
      <Link
        className='cursor-pointer hidden sm:flex'
        href='/'
        style={{
          fontFamily: "var(--font-cinzel), 'Cinzel', 'Trajan Pro', 'Times New Roman', serif",
          fontSize: '24px',
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#e6b749',
          textShadow:
            '0 1px 0 #3e2714, 0 2px 0 #5c3a21, 0 4px 10px rgba(0,0,0,0.85), 0 0 18px rgba(167, 100, 56, 0.55)',
        }}
      >
        Gladiatus
      </Link>
      <div className='gap-4 flex items-center'>
        <Button
          className='red-card text-cream2 text-center font-semibold text-md cursor-pointer hover:text-gold hover:border-gold transition rounded-sm hover:bg-red h-8 w-32'
          onClick={() => router.push('/sign-in')}
        >
          Sign In
        </Button>
        <Button
          className='red-card text-cream2 text-center font-semibold text-md cursor-pointer hover:text-gold hover:border-gold transition rounded-sm hover:bg-red h-8 w-32'
          onClick={() => router.push('/sign-up')}
        >
          Sign Up
        </Button>
      </div>
    </nav>
  )
}

export default LandingNavbar;
