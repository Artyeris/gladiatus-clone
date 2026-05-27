'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import {
  buyMercenaryListing,
  cancelMercenaryListing,
} from '@/lib/actions/mercenary/mercenary.action';
import CompactNumber from '@/components/shared/CompactNumber';

const QUALITY_LABEL: Record<string, string> = {
  green: 'Green', blue: 'Blue', purple: 'Purple', orange: 'Orange', red: 'Red',
};
const QUALITY_COLOR: Record<string, string> = {
  green: '#3b9b3b', blue: '#3b6bb5', purple: '#9333ea', orange: '#d97706', red: '#dc2626',
};
const ROLE_LABEL: Record<string, string> = { tank: 'Tank', healer: 'Healer', damage: 'Damage' };

interface PlayerListing {
  _id: string;
  price: number;
  sellerName: string;
  isMine: boolean;
  mercenary: {
    _id: string;
    name: string;
    type: 'tank' | 'healer' | 'damage';
    level: number;
    quality: string;
    stats: any;
    power: number;
  };
}

interface Props {
  characterGold: number;
  listings: PlayerListing[];
}

const MarketMercenariesPanel = ({ characterGold, listings }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [, startTransition] = useTransition();

  const onBuy = async (l: PlayerListing) => {
    if (characterGold < l.price) return toast.error(`Need ${l.price} gold`);
    setBusy(l._id);
    const res: any = await buyMercenaryListing({ listingId: l._id });
    setBusy(null);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Bought ${l.mercenary.name} from ${l.sellerName}`);
    startTransition(() => router.refresh());
  };

  const onCancel = async (l: PlayerListing) => {
    setBusy(l._id);
    const res: any = await cancelMercenaryListing({ listingId: l._id });
    setBusy(null);
    if (res?.error) return toast.error(res.error.message);
    toast(`Cancelled listing for ${l.mercenary.name}`);
    startTransition(() => router.refresh());
  };

  return (
    <div className='mx-3 mb-3 brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='red-card text-cream2 font-semibold text-sm px-3 py-1 flex justify-between items-center'
      >
        <span>Mercenary listings ({listings.length})</span>
        <span className='text-xs opacity-90'>{open ? '−' : '+'}</span>
      </button>
      {open && (
        listings.length === 0 ? (
          <div className='px-3 py-3 italic opacity-80 text-center text-xs'>
            No mercenaries listed by other players. Visit{' '}
            <a className='underline text-red3' href='/game/mercenaries'>Mercenaries</a>{' '}
            to sell one from your roster.
          </div>
        ) : (
          <div className='px-3 py-2 grid grid-cols-1 md:grid-cols-2 gap-2'>
            {listings.map((l) => {
              const m = l.mercenary;
              return (
                <div key={l._id} className='border-[2px] border-cream2 rounded-sm px-2 py-2 flex flex-col gap-1 text-xs'>
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold'>
                      {m.name}{' '}
                      <span style={{ color: QUALITY_COLOR[m.quality] }}>
                        ({QUALITY_LABEL[m.quality]})
                      </span>
                    </span>
                    <span className='opacity-80'>{ROLE_LABEL[m.type]} &middot; Lvl {m.level}</span>
                  </div>
                  <div className='text-[10px] opacity-80'>Seller: {l.sellerName}</div>
                  <div className='flex justify-between items-center mt-1'>
                    <span><strong>Power:</strong> <CompactNumber value={m.power} /></span>
                    {l.isMine ? (
                      <button
                        type='button'
                        onClick={() => onCancel(l)}
                        disabled={busy === l._id}
                        className='general-button px-3 py-0.5 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
                      >
                        {busy === l._id ? '...' : `Cancel (${l.price}g)`}
                      </button>
                    ) : (
                      <button
                        type='button'
                        onClick={() => onBuy(l)}
                        disabled={busy === l._id || characterGold < l.price}
                        className='general-button px-3 py-0.5 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
                      >
                        {busy === l._id ? '...' : `Buy (${l.price}g)`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default MarketMercenariesPanel;
