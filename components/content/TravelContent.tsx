'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { COUNTRIES, COUNTRY_ORDER, Country } from '@/constants/expeditions';
import { travelTo } from '@/lib/actions/character/travel.action';

interface Props {
  characterLevel: number;
  currentCountry: Country;
  unlockedCountries: Country[];
  characterGold: number;
}

const TravelContent = ({
  characterLevel, currentCountry, unlockedCountries, characterGold,
}: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<Country>(currentCountry);

  const onTravel = async () => {
    if (picked === currentCountry) {
      toast(`Already in ${COUNTRIES[picked].name}`);
      return;
    }
    setBusy(true);
    const res = await travelTo({ country: picked });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Travelled to ${COUNTRIES[picked].name}`);
    router.push('/game/overview');
    router.refresh();
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <Section title='Forgotten Return'>
        <div className='flex gap-3 px-3 py-2 text-sm'>
          <Image
            src='/images/auction.webp'
            alt='guide'
            width={140}
            height={140}
            className='rounded-sm shrink-0 object-contain'
            style={{ width: '140px', height: '140px' }}
          />
          <div className='flex flex-col gap-1'>
            <p>
              The world is bigger than Italy. Pick a country and sail
              out; expeditions only show in the sidebar for whichever
              land your gladiator currently stands in. Returning to a
              country you have already unlocked is free; the first
              visit charges a one-time travel fee.
            </p>
            <div className='font-semibold mt-1'>
              Your balance: {characterGold} gold
            </div>
          </div>
        </div>
      </Section>

      <Section title='Travel to another country'>
        <div className='flex flex-col gap-2 px-3 py-3 text-sm'>
          {COUNTRY_ORDER.map((id) => {
            const info = COUNTRIES[id];
            const isCurrent = id === currentCountry;
            const isUnlocked = unlockedCountries.includes(id) || id === 'italy';
            const meetsLevel = characterLevel >= info.entryLevel;
            const cost = isUnlocked ? 0 : info.travelCost;
            const canAfford = characterGold >= cost;
            const enabled = !isCurrent && meetsLevel && canAfford;
            return (
              <label
                key={id}
                className={`flex items-center gap-3 rounded-sm px-3 py-2 border-[2px] ${
                  picked === id ? 'border-red3' : 'border-cream2'
                } ${enabled ? 'cursor-pointer hover:bg-cream2/40' : 'opacity-60 cursor-not-allowed'}`}
              >
                <input
                  type='radio'
                  name='country'
                  value={id}
                  checked={picked === id}
                  onChange={() => enabled && setPicked(id)}
                  disabled={!enabled}
                />
                <div className='flex flex-col flex-1 min-w-0'>
                  <span className='font-semibold'>
                    {info.name}
                    {isCurrent && <span className='ml-2 text-xs opacity-80'>(here)</span>}
                    {!meetsLevel && <span className='ml-2 text-xs text-red3'>requires level {info.entryLevel}</span>}
                  </span>
                  <span className='text-xs opacity-80'>{info.blurb}</span>
                </div>
                <span className='text-xs font-semibold shrink-0 text-right'>
                  {cost === 0
                    ? <span className='opacity-80'>Free</span>
                    : <span className='inline-flex items-center gap-1'>
                        {cost}
                        <Image src='/images/crowns.png' width={12} height={12} alt='gold' style={{ width: 'auto', height: 'auto' }} />
                      </span>}
                </span>
              </label>
            );
          })}

          <button
            type='button'
            onClick={onTravel}
            disabled={busy || picked === currentCountry}
            className='general-button px-4 py-2 rounded-sm text-sm font-semibold hover:brightness-110 disabled:opacity-50 w-fit self-end mt-1'
          >
            Travel
          </button>
        </div>
      </Section>
    </div>
  );
};

export default TravelContent;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>{title}</div>
      <div className='flex flex-col'>{children}</div>
    </div>
  );
}
