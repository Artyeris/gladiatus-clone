'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import {
  buyMercenary,
  dismissMercenary,
} from '@/lib/actions/mercenary/mercenary.action';
import CompactNumber from '@/components/shared/CompactNumber';

const QUALITY_LABEL: Record<string, string> = {
  green: 'Green', blue: 'Blue', purple: 'Purple', orange: 'Orange', red: 'Red',
};
const QUALITY_COLOR: Record<string, string> = {
  green:  '#3b9b3b',
  blue:   '#3b6bb5',
  purple: '#9333ea',
  orange: '#d97706',
  red:    '#dc2626',
};
const ROLE_LABEL: Record<string, string> = { tank: 'Tank', healer: 'Healer', damage: 'Damage' };

interface Offer {
  slotId: string;
  templateId: string;
  name: string;
  type: 'tank' | 'healer' | 'damage';
  quality: string;
  level: number;
  stats: any;
  price: number;
  power: number;
}
interface OwnedMerc {
  _id: string;
  templateId: string;
  name: string;
  type: 'tank' | 'healer' | 'damage';
  level: number;
  quality: string;
  stats: any;
  power: number;
}

interface Props {
  characterGold: number;
  offers: Offer[];
  owned: OwnedMerc[];
}

const MercenariesContent = ({ characterGold, offers, owned }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const onBuy = async (offer: Offer) => {
    if (characterGold < offer.price) {
      toast.error(`Need ${offer.price} gold to hire ${offer.name}`);
      return;
    }
    setBusy(offer.slotId);
    const res: any = await buyMercenary({
      templateId: offer.templateId,
      quality: offer.quality,
      level: offer.level,
    });
    setBusy(null);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Hired ${QUALITY_LABEL[offer.quality]} ${offer.name} for ${offer.price} gold`);
    startTransition(() => router.refresh());
  };

  const onDismiss = async (merc: OwnedMerc) => {
    setBusy(merc._id);
    const res: any = await dismissMercenary({ mercenaryId: merc._id });
    setBusy(null);
    if (res?.error) return toast.error(res.error.message);
    toast(`Dismissed ${merc.name}, +${res.refund} gold scrap`);
    startTransition(() => router.refresh());
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <h1 className='text-xl font-bold border-b-[3px] border-brown2 text-center text-brown2'>
        Mercenaries
      </h1>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>
          Italy Vendor &middot; Your gold: <CompactNumber value={characterGold} />
        </div>
        <div className='px-3 py-2 grid grid-cols-1 md:grid-cols-2 gap-2'>
          {offers.map((o) => (
            <OfferCard
              key={o.slotId}
              offer={o}
              busy={busy === o.slotId}
              canAfford={characterGold >= o.price}
              onBuy={() => onBuy(o)}
            />
          ))}
        </div>
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>
          Your roster ({owned.length})
        </div>
        {owned.length === 0 ? (
          <div className='px-3 py-4 italic opacity-80 text-center text-xs'>
            No mercenaries hired yet. Pick one from the vendor above.
          </div>
        ) : (
          <div className='px-3 py-2 grid grid-cols-1 md:grid-cols-2 gap-2'>
            {owned.map((m) => (
              <OwnedCard
                key={m._id}
                merc={m}
                busy={busy === m._id}
                onDismiss={() => onDismiss(m)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MercenariesContent;

function OfferCard({
  offer, busy, canAfford, onBuy,
}: {
  offer: Offer;
  busy: boolean;
  canAfford: boolean;
  onBuy: () => void;
}) {
  return (
    <div className='border-[2px] border-cream2 rounded-sm px-2 py-2 flex flex-col gap-1 text-xs'>
      <div className='flex justify-between items-center'>
        <span className='font-semibold'>
          {offer.name}{' '}
          <span style={{ color: QUALITY_COLOR[offer.quality] }}>
            ({QUALITY_LABEL[offer.quality]})
          </span>
        </span>
        <span className='opacity-80'>{ROLE_LABEL[offer.type]} &middot; Lvl {offer.level}</span>
      </div>
      <StatsRow stats={offer.stats} />
      <div className='flex justify-between items-center mt-1'>
        <span><strong>Power:</strong> <CompactNumber value={offer.power} /></span>
        <button
          type='button'
          onClick={onBuy}
          disabled={busy || !canAfford}
          className='general-button px-3 py-0.5 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
        >
          {busy ? '...' : `Hire (${offer.price}g)`}
        </button>
      </div>
    </div>
  );
}

function OwnedCard({
  merc, busy, onDismiss,
}: {
  merc: OwnedMerc;
  busy: boolean;
  onDismiss: () => void;
}) {
  return (
    <div className='border-[2px] border-cream2 rounded-sm px-2 py-2 flex flex-col gap-1 text-xs'>
      <div className='flex justify-between items-center'>
        <span className='font-semibold'>
          {merc.name}{' '}
          <span style={{ color: QUALITY_COLOR[merc.quality] }}>
            ({QUALITY_LABEL[merc.quality]})
          </span>
        </span>
        <span className='opacity-80'>{ROLE_LABEL[merc.type]} &middot; Lvl {merc.level}</span>
      </div>
      <StatsRow stats={merc.stats} />
      <div className='flex justify-between items-center mt-1'>
        <span><strong>Power:</strong> <CompactNumber value={merc.power} /></span>
        <button
          type='button'
          onClick={onDismiss}
          disabled={busy}
          className='general-button px-3 py-0.5 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
        >
          {busy ? '...' : 'Dismiss'}
        </button>
      </div>
    </div>
  );
}

function StatsRow({ stats }: { stats: any }) {
  return (
    <div className='grid grid-cols-3 gap-x-2 gap-y-0.5 text-[10px] opacity-90'>
      <span>HP: {stats.health}</span>
      <span>Armor: {stats.armor}</span>
      <span>Dmg: {stats.damageMin}-{stats.damageMax}</span>
      <span>STR: {stats.strength}</span>
      <span>DEX: {stats.dexterity}</span>
      <span>AGI: {stats.agility}</span>
      <span>END: {stats.endurance}</span>
      <span>CHA: {stats.charisma}</span>
      <span>INT: {stats.intelligence}</span>
      {stats.healing > 0 && <span className='col-span-3'>Healing: {stats.healing}</span>}
    </div>
  );
}
