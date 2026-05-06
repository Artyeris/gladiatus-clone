'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { expeditionRoutes, generalRoutes, villageRoutes } from '@/constants/routes';

type Tab = 'town' | 'expedition';

const NavigationBanner = () => {
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';

  // Default the active tab to whichever section the current route belongs
  // to so deep-links land on the right list.
  const initialTab: Tab = pathname.includes('/game/expeditions/') ? 'expedition' : 'town';
  const [tab, setTab] = useState<Tab>(initialTab);

  const isRouteActive = (link: string) =>
    (pathname.includes(link) && link.length > 1) || pathname === link;

  return (
    <div className={`min-h-full w-[200px] main-red-card pt-14 flex flex-col gap-2 px-1 ${isOnboarding && 'hidden'}`}>
      <h2 className='border-b-cream2 border-b-[3px] text-center font-semibold text-cream2 text-lg'>
        General
      </h2>
      {generalRoutes.map((route) => {
        const isActive = isRouteActive(route.link);
        return (
          <Link
            className={`red-card text-cream2 text-center font-semibold text-md cursor-pointer hover:text-gold hover:border-gold transition rounded-sm ${isActive && 'nav-banner-active'}`}
            key={route.name}
            href={`/game${route.link}`}
          >
            {route.name}
          </Link>
        );
      })}

      <div className='grid grid-cols-2 gap-1 mt-2'>
        <button
          type='button'
          onClick={() => setTab('town')}
          className={`red-card text-cream2 font-semibold text-sm py-2 rounded-sm flex items-center justify-center gap-1 transition ${
            tab === 'town' ? 'nav-banner-active' : 'opacity-80 hover:opacity-100'
          }`}
          aria-pressed={tab === 'town'}
          title='Town'
        >
          <span aria-hidden>🏛️</span>
          <span>Town</span>
        </button>
        <button
          type='button'
          onClick={() => setTab('expedition')}
          className={`red-card text-cream2 font-semibold text-sm py-2 rounded-sm flex items-center justify-center gap-1 transition ${
            tab === 'expedition' ? 'nav-banner-active' : 'opacity-80 hover:opacity-100'
          }`}
          aria-pressed={tab === 'expedition'}
          title='Expedition'
        >
          <span aria-hidden>🗺️</span>
          <span>Expedition</span>
        </button>
      </div>

      {tab === 'town' &&
        villageRoutes.map((route) => {
          const isActive = isRouteActive(route.link);
          return (
            <Link
              className={`red-card text-cream2 text-center font-semibold text-md cursor-pointer hover:text-gold hover:border-gold transition rounded-sm ${isActive && 'nav-banner-active'}`}
              key={route.name}
              href={`/game${route.link}`}
            >
              {route.name}
            </Link>
          );
        })}

      {tab === 'expedition' &&
        expeditionRoutes.map((route) => {
          const isActive = isRouteActive(route.link);
          return (
            <Link
              className={`red-card text-cream2 text-center font-semibold text-md cursor-pointer hover:text-gold hover:border-gold transition rounded-sm ${isActive && 'nav-banner-active'}`}
              key={route.name}
              href={`/game/expeditions${route.link}`}
            >
              {route.name}
            </Link>
          );
        })}
    </div>
  );
};

export default NavigationBanner;
