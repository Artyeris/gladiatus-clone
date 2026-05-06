'use client'

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { expeditionRoutes, generalRoutes, villageRoutes } from '@/constants/routes';

type Tab = 'town' | 'expedition';

const NavigationBanner = () => {
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';

  const initialTab: Tab = pathname.includes('/game/expeditions/') ? 'expedition' : 'town';
  const [tab, setTab] = useState<Tab>(initialTab);

  const isRouteActive = (link: string) =>
    (pathname.includes(link) && link.length > 1) || pathname === link;

  return (
    <div
      className={`relative min-h-full w-[230px] flex flex-col items-center pt-6 pb-10 px-3 ${
        isOnboarding && 'hidden'
      }`}
      style={{
        backgroundImage: 'url("/images/sidebar.webp")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
      }}
    >
      <div className='flex flex-col gap-2 w-[180px] mt-16'>
        <SectionHeader>General</SectionHeader>
        {generalRoutes.map((route) => (
          <NavLink
            key={route.name}
            href={`/game${route.link}`}
            label={route.name}
            active={isRouteActive(route.link)}
          />
        ))}

        <div className='grid grid-cols-2 gap-2 mt-3'>
          <TabButton
            icon='/images/town.webp'
            label='Town'
            active={tab === 'town'}
            onClick={() => setTab('town')}
          />
          <TabButton
            icon='/images/expedition.webp'
            label='Expedition'
            active={tab === 'expedition'}
            onClick={() => setTab('expedition')}
          />
        </div>

        {tab === 'town' &&
          villageRoutes.map((route) => (
            <NavLink
              key={route.name}
              href={`/game${route.link}`}
              label={route.name}
              active={isRouteActive(route.link)}
            />
          ))}

        {tab === 'expedition' &&
          expeditionRoutes.map((route) => (
            <NavLink
              key={route.name}
              href={`/game/expeditions${route.link}`}
              label={route.name}
              active={isRouteActive(route.link)}
            />
          ))}
      </div>
    </div>
  );
};

export default NavigationBanner;

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className='text-center font-semibold text-cream2 text-sm uppercase tracking-wider drop-shadow opacity-90 border-b border-cream2/30 pb-1'>
      {children}
    </h2>
  );
}

function NavLink({
  href, label, active,
}: { href: string; label: string; active: boolean }) {
  return active ? (
    <Link
      href={href}
      className='relative h-9 flex items-center justify-center text-cream2 font-semibold text-sm tracking-wide drop-shadow'
      style={{
        backgroundImage: 'url("/images/marked.webp")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
      }}
    >
      <span className='px-3'>{label}</span>
    </Link>
  ) : (
    <Link
      href={href}
      className='red-card text-cream2 text-center font-semibold text-sm cursor-pointer hover:text-gold hover:border-gold transition rounded-sm py-1'
    >
      {label}
    </Link>
  );
}

function TabButton({
  icon, label, active, onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={`relative flex flex-col items-center justify-center gap-1 py-2 rounded-sm transition ${
        active ? 'nav-banner-active' : 'red-card opacity-85 hover:opacity-100'
      }`}
    >
      <Image
        src={icon}
        alt={label}
        width={36}
        height={36}
        style={{ width: 'auto', height: 'auto', objectFit: 'contain' }}
      />
      <span className='text-cream2 text-[10px] font-semibold uppercase tracking-wider'>
        {label}
      </span>
    </button>
  );
}
