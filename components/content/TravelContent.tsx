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

// Short pitch line shown under each destination row. Mirrors the
// Hermit's flavour text from the original game.
const PITCH: Record<Country, string> = {
  italy: 'Return home to the wilderness around Rome.',
  africa: "Be one of the first gladiators and bring glory to Rome.",
  germania: 'Prove yourself against the fierce tribes of Germania.',
  britannia: 'Conquer the barbarians of Britannia for the Empire.',
};

const TravelContent = ({
  characterLevel, currentCountry, unlockedCountries, characterGold,
}: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // Destinations exclude the country the player is currently standing
  // in (re-travelling to "here" would be a no-op).
  const destinations = COUNTRY_ORDER.filter((c) => c !== currentCountry);

  // Pre-select the first reachable destination so the Travel button
  // isn't disabled out of the gate.
  const firstReachable = destinations.find(
    (id) => characterLevel >= COUNTRIES[id].entryLevel,
  );
  const [picked, setPicked] = useState<Country>(firstReachable ?? destinations[0]);

  const onTravel = async () => {
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
      <h1 className='text-xl font-bold border-b-[3px] border-brown2 text-center text-brown2'>
        Traveler
      </h1>

      <Section title='Description'>
        <div className='flex gap-3 px-3 py-3 text-sm'>
          <Image
            src='/images/auction.webp'
            alt='Traveler'
            width={140}
            height={140}
            className='rounded-sm shrink-0 object-contain'
            style={{ width: '140px', height: '140px' }}
          />
          <div className='flex flex-col gap-1'>
            <p>
              Where else could a respected gladiator like yourself prove
              themselves? Germania&apos;s tribes have crushed us in many
              great battles -- there you will surely find glory. Africa
              remains unexplored, where you could carry Rome&apos;s
              honour and the Empire&apos;s might to its shores. Make
              your own choice, and I will mark out the easiest route for
              you.
            </p>
            <div className='font-semibold mt-1'>
              Currently in {COUNTRIES[currentCountry].name} &middot; Gold: {characterGold.toLocaleString()}
            </div>
          </div>
        </div>
      </Section>

      <Section title='Travel to another country'>
        <div className='flex flex-col gap-1 px-3 py-3 text-sm'>
          {destinations.map((id) => {
            const info = COUNTRIES[id];
            const meetsLevel = characterLevel >= info.entryLevel;
            // Every destination charges its fare every trip (Italy is
            // the only zero-cost row because COUNTRIES.italy.travelCost
            // is 0). unlockedCountries is still tracked for stats but
            // no longer grants a discount.
            const cost = info.travelCost;
            const canAfford = characterGold >= cost;
            const enabled = meetsLevel && canAfford;
            return (
              <label
                key={id}
                className={`flex flex-col gap-0.5 rounded-sm px-2 py-1.5 ${
                  enabled ? 'cursor-pointer hover:bg-cream2/40' : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div className='flex items-center flex-wrap gap-x-2'>
                  <input
                    type='radio'
                    name='country'
                    value={id}
                    checked={picked === id}
                    onChange={() => enabled && setPicked(id)}
                    disabled={!enabled}
                  />
                  <span className='font-semibold'>{info.name}</span>
                  <span className='opacity-90 inline-flex items-center gap-1'>
                    (Minimum level: {info.entryLevel}, Costs:&nbsp;
                    {cost === 0 ? (
                      <span>Free</span>
                    ) : (
                      <span className='inline-flex items-center gap-1'>
                        {cost.toLocaleString()}
                        <Image
                          src='/images/crowns.png'
                          width={12}
                          height={12}
                          alt='gold'
                          style={{ width: '12px', height: '12px' }}
                        />
                      </span>
                    )}
                    )
                  </span>
                  {!meetsLevel && (
                    <span className='text-xs text-red3 italic'>
                      requires level {info.entryLevel}
                    </span>
                  )}
                  {meetsLevel && !canAfford && (
                    <span className='text-xs text-red3 italic'>
                      not enough gold
                    </span>
                  )}
                </div>
                <div className='text-xs italic opacity-80 pl-6'>
                  {PITCH[id]}
                </div>
              </label>
            );
          })}

          <button
            type='button'
            onClick={onTravel}
            disabled={busy || !picked}
            className='general-button px-6 py-1.5 rounded-sm text-sm font-semibold hover:brightness-110 disabled:opacity-50 self-center mt-2'
          >
            travel
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
