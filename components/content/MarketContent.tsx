'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import ItemTooltip from '@/components/overview/ItemTooltip';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import {
  buyMarketListing,
  cancelMarketListing,
  placeMarketListing,
} from '@/lib/actions/market/market.action';
import { fullItemName, QUALITY_COLOR } from '@/lib/utils/itemUtils';

export interface MarketListingView {
  _id: string;
  item: ItemInterface | null;
  price: number;
  seller: { _id: string; name: string } | null;
  isMine: boolean;
}

interface Props {
  character: CharacterInterface;
  listings: MarketListingView[];
}

function ownInventoryItems(character: CharacterInterface): ItemInterface[] {
  const inv = (character.inventory ?? []) as any;
  if (!Array.isArray(inv)) return [];
  if (inv.length === 0) return [];
  if (Array.isArray(inv[0])) {
    const out: ItemInterface[] = [];
    for (const row of inv as any[][]) {
      for (const cell of row) {
        if (cell && typeof cell === 'object' && 'name' in cell) out.push(cell);
      }
    }
    return out;
  }
  return inv
    .map((e: any) => e?.item)
    .filter((it: any) => it && typeof it === 'object' && 'name' in it);
}

const MarketContent = ({ character, listings }: Props) => {
  const router = useRouter();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const myItems = ownInventoryItems(character);

  const onPlace = async () => {
    if (!selectedItemId) return toast.error('Pick an item to list');
    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice < 0) {
      return toast.error('Enter a valid price');
    }
    setBusy(true);
    const res = await placeMarketListing({ itemId: selectedItemId, price: numPrice });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Listed for sale');
    setSelectedItemId('');
    setPrice('');
    router.refresh();
  };

  const onCancel = async (listingId: string) => {
    setBusy(true);
    const res = await cancelMarketListing({ listingId });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Listing cancelled');
    router.refresh();
  };

  const onBuy = async (listingId: string) => {
    setBusy(true);
    const res = await buyMarketListing({ listingId });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Purchased');
    router.refresh();
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm'>
        Market
      </div>

      <div className='brown-card rounded-sm p-3 text-sm flex flex-col gap-2'>
        <div className='font-semibold'>Your balance: {character.crowns}</div>
        <div className='font-semibold border-t border-cream2 pt-2'>Sell an item</div>
        <div className='flex flex-wrap items-center gap-2'>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className='border border-brown2 px-2 py-1 rounded-sm bg-cream-card'
          >
            <option value=''>-- pick an item from inventory --</option>
            {myItems.map((item) => (
              <option key={item._id} value={item._id}>
                {fullItemName(item)} (lvl {item.level})
              </option>
            ))}
          </select>
          <input
            type='number'
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder='Price'
            className='border border-brown2 px-2 py-1 rounded-sm w-28'
          />
          <button
            onClick={onPlace}
            disabled={busy}
            className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50'
          >
            List
          </button>
        </div>
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm'>
        <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>
          Listings
        </div>
        {listings.length === 0 && (
          <div className='px-3 py-3 italic opacity-80'>
            Nothing for sale right now.
          </div>
        )}
        {listings.map((listing, idx) => (
          <ListingRow
            key={listing._id}
            listing={listing}
            last={idx === listings.length - 1}
            busy={busy}
            onCancel={onCancel}
            onBuy={onBuy}
          />
        ))}
      </div>
    </div>
  );
};

export default MarketContent;

function ListingRow({
  listing,
  last,
  busy,
  onCancel,
  onBuy,
}: {
  listing: MarketListingView;
  last: boolean;
  busy: boolean;
  onCancel: (id: string) => void;
  onBuy: (id: string) => void;
}) {
  const item = listing.item;
  const nameColor = item ? QUALITY_COLOR[item.quality ?? 'common'] : '#ddd';

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 ${!last && 'border-b-[2px] border-cream2'}`}
    >
      {item ? (
        <ItemTooltip item={item}>
          <div
            className='relative shrink-0'
            style={{
              width: '40px',
              height: '40px',
              border: '1px solid #5c3a21',
              borderRadius: '2px',
              cursor: 'help',
            }}
          >
            <Image
              src={`/items/${item.image}.webp`}
              alt={item.name}
              fill
              sizes='40px'
              style={{ objectFit: 'contain', padding: '2px' }}
            />
          </div>
        </ItemTooltip>
      ) : (
        <div className='w-10 h-10 bg-brown2/30 rounded-sm shrink-0' />
      )}

      <div className='flex flex-col flex-1 min-w-0'>
        <span className='font-semibold truncate' style={{ color: nameColor }}>
          {item ? fullItemName(item) : 'Unknown item'}
        </span>
        <span className='text-xs opacity-80'>
          Seller: {listing.seller?.name ?? 'unknown'}
          {item && <> &middot; lvl {item.level}</>}
        </span>
      </div>

      <div className='font-semibold flex items-center gap-1 shrink-0'>
        {listing.price}
        <Image src='/images/crowns.png' width={12} height={12} alt='crowns' />
      </div>

      {listing.isMine ? (
        <button
          onClick={() => onCancel(listing._id)}
          disabled={busy}
          className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50 shrink-0'
        >
          Cancel
        </button>
      ) : (
        <button
          onClick={() => onBuy(listing._id)}
          disabled={busy}
          className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50 shrink-0'
        >
          Buy
        </button>
      )}
    </div>
  );
}
