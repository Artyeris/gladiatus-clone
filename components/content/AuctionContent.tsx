'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import ItemImage from '@/components/shared/ItemImage';
import ItemTooltip from '@/components/overview/ItemTooltip';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import {
  buyoutAuctionAction,
  placeAuctionBid,
} from '@/lib/actions/auction/auction.action';
import { fullItemName, QUALITY_COLOR } from '@/lib/utils/itemUtils';
import type { AuctionPhase } from '@/lib/utils/auction';

export interface AuctionView {
  _id: string;
  item: ItemInterface | null;
  startingPrice: number;
  currentBid: number;
  buyoutPrice: number;
  hasBids: boolean;
  highestBidder: { _id: string; name: string } | null;
  endsAt: string | Date;
  phase: AuctionPhase;
  isLeading: boolean;
}

interface Props {
  character: CharacterInterface;
  auctions: AuctionView[];
}

const PHASE_COLOR: Record<AuctionPhase, string> = {
  'Very Long': '#3a7bd6',
  Long: '#3ca33c',
  Medium: '#d4af37',
  Short: '#e08a30',
  'Very Short': '#d63a3a',
  Ended: '#888',
};

const AuctionContent = ({ character, auctions }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onBid = async (auctionId: string, amount: number) => {
    setBusy(true);
    const res = await placeAuctionBid({ auctionId, amount });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Bid placed');
    router.refresh();
  };

  const onBuyout = async (auctionId: string) => {
    setBusy(true);
    const res = await buyoutAuctionAction({ auctionId });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Bought');
    router.refresh();
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <Section title='Auction'>
        <div className='flex gap-3 px-3 py-2 text-sm'>
          <Image
            src='/images/auction.webp'
            alt='auctioneer'
            width={120}
            height={120}
            className='rounded-sm shrink-0'
            style={{ width: 'auto', height: 'auto' }}
          />
          <div className='flex flex-col gap-1'>
            <p>
              An old building holds its own charm. The auctioneer rotates rare
              wares from across the world; the offered items change every cycle.
            </p>
            <p>
              You can bid for items here. If someone outbids you, your gold
              is refunded automatically. <em>Buy out</em> claims the item now
              for the full asking price.
            </p>
            <div className='font-semibold mt-1'>
              Your balance: {character.crowns}
            </div>
          </div>
        </div>
      </Section>

      <Section title='Active auctions'>
        {auctions.length === 0 ? (
          <div className='px-3 py-3 italic opacity-80 text-sm'>
            The auctioneer is preparing the next rotation...
          </div>
        ) : (
          auctions.map((a, idx) => (
            <AuctionRow
              key={a._id}
              auction={a}
              last={idx === auctions.length - 1}
              busy={busy}
              characterCrowns={character.crowns ?? 0}
              onBid={onBid}
              onBuyout={onBuyout}
            />
          ))
        )}
      </Section>
    </div>
  );
};

export default AuctionContent;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>{title}</div>
      <div className='flex flex-col'>{children}</div>
    </div>
  );
}

function AuctionRow({
  auction,
  last,
  busy,
  characterCrowns,
  onBid,
  onBuyout,
}: {
  auction: AuctionView;
  last: boolean;
  busy: boolean;
  characterCrowns: number;
  onBid: (id: string, amount: number) => void;
  onBuyout: (id: string) => void;
}) {
  const item = auction.item;
  const nameColor = item ? QUALITY_COLOR[item.quality ?? 'common'] : '#ddd';
  const minBid = auction.hasBids ? auction.currentBid + 1 : auction.currentBid;
  const [bid, setBid] = useState<string>(String(minBid));

  const baseValue = item?.sellPrice ?? auction.startingPrice;
  const percentOfValue = baseValue > 0 ? Math.round((auction.startingPrice / baseValue) * 100) : null;

  return (
    <div className={`flex items-center gap-3 px-3 py-2 ${!last && 'border-b-[2px] border-cream2'}`}>
      {item ? (
        <ItemTooltip item={item}>
          <div
            className='relative shrink-0'
            style={{
              width: '48px',
              height: '48px',
              border: '1px solid #5c3a21',
              borderRadius: '2px',
              cursor: 'help',
            }}
          >
            <ItemImage
              imageId={item.image}
              alt={item.name}
              fill
              sizes='48px'
              style={{ objectFit: 'contain', padding: '2px' }}
            />
          </div>
        </ItemTooltip>
      ) : (
        <div className='w-12 h-12 bg-brown2/30 rounded-sm shrink-0' />
      )}

      <div className='flex flex-col flex-1 min-w-0'>
        <span className='font-semibold truncate' style={{ color: nameColor }}>
          {item ? fullItemName(item) : 'Unknown item'}
          {item && <span className='opacity-70 font-normal'> &middot; lvl {item.level}</span>}
        </span>
        <span className='text-xs opacity-80'>
          Min bid:{' '}
          <span className='font-semibold'>{auction.startingPrice}</span>
          {percentOfValue != null && <span> ({percentOfValue}%)</span>}
          {' '}&middot; Current:{' '}
          <span className='font-semibold'>{auction.currentBid}</span>
          {auction.highestBidder && <> &middot; leading: {auction.highestBidder.name}</>}
        </span>
      </div>

      <span
        className='text-xs font-semibold shrink-0 px-2 py-[2px] rounded-sm'
        style={{ background: PHASE_COLOR[auction.phase], color: '#fff' }}
      >
        {auction.phase}
      </span>

      <div className='flex items-center gap-1 shrink-0'>
        <input
          type='number'
          min={minBid}
          value={bid}
          onChange={(e) => setBid(e.target.value)}
          className='border border-brown2 px-2 py-1 rounded-sm w-20 bg-cream-card'
        />
        <button
          onClick={() => onBid(auction._id, Number(bid))}
          disabled={busy || Number(bid) < minBid || characterCrowns < Number(bid)}
          className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50'
        >
          Bid
        </button>
        <button
          onClick={() => onBuyout(auction._id)}
          disabled={busy || characterCrowns < auction.buyoutPrice}
          title={`Buy out for ${auction.buyoutPrice}`}
          className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50 flex items-center gap-1'
        >
          Buy out
          <span className='font-normal text-xs flex items-center gap-1'>
            ({auction.buyoutPrice}
            <Image src='/images/crowns.png' width={10} height={10} alt='' />)
          </span>
        </button>
      </div>
    </div>
  );
}
