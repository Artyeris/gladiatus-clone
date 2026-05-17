'use client'

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { expeditionRoutes, generalRoutes, villageRoutes } from '@/constants/routes';
import { expeditions } from '@/constants/expeditions';

type Tab = 'town' | 'expedition';

interface Props {
  characterLevel?: number;
  // Server-rendered horizontal shortcut row (Messages / Reports /
  // Packages) injected by the layout. Kept as a generic ReactNode so
  // this banner stays a pure client component.
  shortcuts?: React.ReactNode;
}

const NavigationBanner = ({ characterLevel = 1, shortcuts }: Props) => {
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';

  const initialTab: Tab = pathname.includes('/game/expeditions/') ? 'expedition' : 'town';
  const [tab, setTab] = useState<Tab>(initialTab);

  const isRouteActive = (link: string) =>
    (pathname.includes(link) && link.length > 1) || pathname === link;

  return (
    <div
      className={`relative w-[230px] flex flex-col items-center pt-6 pb-10 px-3 self-start ${
        isOnboarding && 'hidden'
      }`}
      style={{
        backgroundImage: 'url("/images/sidebar.webp")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        backgroundPosition: 'top center',
        minHeight: '900px',
      }}
    >
      <div className='flex flex-col gap-2 w-[180px] mt-16'>
        {shortcuts && <div className='mb-1'>{shortcuts}</div>}
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
          expeditionRoutes.map((route) => {
            const slug = route.link.replace(/^\//, '');
            const info = expeditions[slug];
            const required = info?.entryLevel ?? 1;
            const locked = characterLevel < required;
            return (
              <NavLink
                key={route.name}
                href={`/game/expeditions${route.link}`}
                label={route.name}
                active={isRouteActive(route.link)}
                locked={locked}
                requirement={locked ? `from level ${required}` : undefined}
              />
            );
          })}
      </div>
    </div>
  );
};

export default NavigationBanner;

function NavLink({
  href, label, active, locked, requirement,
}: {
  href: string;
  label: string;
  active: boolean;
  locked?: boolean;
  requirement?: string;
}) {
  // Locked rows render as a non-clickable stub with a small requirement
  // subtitle (mirrors the original Gladiatus expedition sidebar which
  // shows greyed entries and "from level N" below them).
  if (locked) {
    return (
      <div
        className='relative h-9 w-full flex flex-col items-center justify-center rounded-sm red-card opacity-50 select-none cursor-not-allowed'
        title={requirement ? `Unlocks ${requirement}` : 'Locked'}
      >
        <span className='text-cream2 font-semibold text-sm tracking-wide line-through'>{label}</span>
        {requirement && (
          <span className='text-cream2 text-[9px] font-normal opacity-90 -mt-1'>
            {requirement}
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`relative h-9 w-full flex items-center justify-center rounded-sm text-cream2 font-semibold text-sm tracking-wide drop-shadow hover:text-gold transition ${
        active ? '' : 'red-card hover:border-gold'
      }`}
    >
      {active && (
        <span
          aria-hidden
          className='absolute inset-0 rounded-sm'
          style={{
            backgroundImage: 'url("/images/marked.webp")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
          }}
        />
      )}
      <span className='relative px-3'>{label}</span>
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
