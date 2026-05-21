'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import ItemImage from '@/components/shared/ItemImage';
import ItemTooltip from '@/components/overview/ItemTooltip';
import ItemTypeDropdown from '@/components/shared/ItemTypeDropdown';
import {
  countByType,
  matchesType,
  type ItemTypeFilterValue,
} from '@/components/shared/ItemTypeFilter';
import QualityDropdown from '@/components/shared/QualityDropdown';
import {
  countByQuality,
  matchesQuality,
  type QualityFilterValue,
} from '@/components/shared/QualityFilter';
import SortDropdown from '@/components/shared/SortDropdown';
import type { SortMode } from '@/components/shared/SortStrip';
import LevelRangeFilter from '@/components/shared/LevelRangeFilter';
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

// Colour the "% of base value" badge so a wildly inflated starting
// price is visible at a glance:
//   <=120%  grey
//   121-140 green
//   141-160 yellow
//   161-180 orange
//   180+    red
type PriceTier = 'all' | 'grey' | 'green' | 'yellow' | 'orange' | 'red';

const PRICE_TIER_LABEL: Record<PriceTier, string> = {
  all: 'All',
  grey: 'Grey (≤120%)',
  green: 'Green (121-140%)',
  yellow: 'Yellow (141-160%)',
  orange: 'Orange (161-180%)',
  red: 'Red (>180%)',
};

function tierOfPercent(pct: number): Exclude<PriceTier, 'all'> {
  if (pct <= 120) return 'grey';
  if (pct <= 140) return 'green';
  if (pct <= 160) return 'yellow';
  if (pct <= 180) return 'orange';
  return 'red';
}

function percentColor(pct: number): string {
  if (pct <= 120) return '#7c7060';
  if (pct <= 140) return '#3ca33c';
  if (pct <= 160) return '#d4af37';
  if (pct <= 180) return '#e08a30';
  return '#d63a3a';
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
  const [typeFilter, setTypeFilter] = useState<ItemTypeFilterValue>('all');
  const [qualityFilter, setQualityFilter] = useState<QualityFilterValue>('all');
  const [sortBy, setSortBy] = useState<SortMode>('default');
  const [minLvl, setMinLvl] = useState<string>('');
  const [maxLvl, setMaxLvl] = useState<string>('');
  const [priceTier, setPriceTier] = useState<PriceTier>('all');

  const minLvlNum = minLvl === '' ? null : Number(minLvl);
  const maxLvlNum = maxLvl === '' ? null : Number(maxLvl);

  const filteredAuctions = auctions
    .filter((a) => {
      if (!matchesType(a.item, typeFilter)) return false;
      if (!matchesQuality(a.item, qualityFilter)) return false;
      const lvl = a.item?.level ?? 0;
      if (minLvlNum != null && Number.isFinite(minLvlNum) && lvl < minLvlNum) return false;
      if (maxLvlNum != null && Number.isFinite(maxLvlNum) && lvl > maxLvlNum) return false;
      if (priceTier !== 'all') {
        const baseValue = a.item?.sellPrice ?? a.startingPrice;
        const pct = baseValue > 0 ? Math.round((a.startingPrice / baseValue) * 100) : 100;
        if (tierOfPercent(pct) !== priceTier) return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === 'levelAsc')  return (a.item?.level ?? 0) - (b.item?.level ?? 0);
      if (sortBy === 'levelDesc') return (b.item?.level ?? 0) - (a.item?.level ?? 0);
      if (sortBy === 'priceAsc')  return (a.buyoutPrice ?? a.currentBid ?? 0) - (b.buyoutPrice ?? b.currentBid ?? 0);
      if (sortBy === 'priceDesc') return (b.buyoutPrice ?? b.currentBid ?? 0) - (a.buyoutPrice ?? a.currentBid ?? 0);
      return 0;
    });

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
            width={240}
            height={240}
            className='rounded-sm shrink-0 object-contain'
            style={{ width: '240px', height: '240px' }}
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
        <div className='flex flex-wrap items-center gap-4 px-3 py-2 border-b-[2px] border-cream2 bg-cream2/40'>
          <ItemTypeDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            counts={countByType(auctions.map((a) => a.item))}
          />
          <QualityDropdown
            value={qualityFilter}
            onChange={setQualityFilter}
            counts={countByQuality(auctions.map((a) => a.item))}
          />
          <SortDropdown value={sortBy} onChange={setSortBy} />
          <LevelRangeFilter
            min={minLvl}
            max={maxLvl}
            onMinChange={setMinLvl}
            onMaxChange={setMaxLvl}
          />
          <label className='flex items-center gap-2 text-xs'>
            <span className='font-semibold opacity-80'>Price:</span>
            <select
              value={priceTier}
              onChange={(e) => setPriceTier(e.target.value as PriceTier)}
              className='fancy-select text-xs'
              style={{
                color: priceTier === 'all' ? '#5c3a21' : percentColor(
                  priceTier === 'grey' ? 100 :
                  priceTier === 'green' ? 130 :
                  priceTier === 'yellow' ? 150 :
                  priceTier === 'orange' ? 170 : 200,
                ),
                fontWeight: 700,
              }}
            >
              {(['all', 'grey', 'green', 'yellow', 'orange', 'red'] as PriceTier[]).map((t) => (
                <option
                  key={t}
                  value={t}
                  style={{
                    color: t === 'all' ? '#5c3a21' : percentColor(
                      t === 'grey' ? 100 :
                      t === 'green' ? 130 :
                      t === 'yellow' ? 150 :
                      t === 'orange' ? 170 : 200,
                    ),
                    background: '#fbf2d6',
                    fontWeight: 700,
                  }}
                >
                  {PRICE_TIER_LABEL[t]}
                </option>
              ))}
            </select>
          </label>
          <button
            type='button'
            onClick={() => router.refresh()}
            className='general-button px-3 py-[3px] rounded-sm text-xs font-semibold hover:brightness-110 ml-auto'
            title='Refresh listings'
          >
            ↻ Refresh
          </button>
        </div>
        {filteredAuctions.length === 0 ? (
          <div className='px-3 py-3 italic opacity-80 text-sm'>
            {auctions.length === 0
              ? 'The auctioneer is preparing the next rotation...'
              : 'No auctions match the selected filter.'}
          </div>
        ) : (
          filteredAuctions.map((a, idx) => (
            <AuctionRow
              key={a._id}
              auction={a}
              last={idx === filteredAuctions.length - 1}
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
          {percentOfValue != null && (
            <span style={{ color: percentColor(percentOfValue), fontWeight: 600 }}>
              {' '}({percentOfValue}%)
            </span>
          )}
          {' '}&middot; Current:{' '}
          <span className='font-semibold'>{auction.currentBid}</span>
          {auction.highestBidder && <> &middot; leading: {auction.highestBidder.name}</>}
        </span>
      </div>

      {/* Right-hand controls: Time, Bid input, Bid button, Buy-out
          button. Fixed column widths so every row lines up vertically
          regardless of price digit count. Phase is rendered as a
          centred text label (no chip background) so it reads like the
          original Gladiatus auction list. */}
      <span
        className='text-xs font-semibold shrink-0 w-[80px] text-center tabular-nums'
        style={{ color: PHASE_COLOR[auction.phase] }}
      >
        {auction.phase}
      </span>

      <input
        type='number'
        min={minBid}
        value={bid}
        onChange={(e) => setBid(e.target.value)}
        className='fancy-input w-20 text-sm tabular-nums shrink-0'
      />
      <button
        onClick={() => onBid(auction._id, Number(bid))}
        disabled={busy || Number(bid) < minBid || characterCrowns < Number(bid)}
        className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50 w-[60px] text-center shrink-0'
      >
        Bid
      </button>
      <button
        onClick={() => onBuyout(auction._id)}
        disabled={busy || characterCrowns < auction.buyoutPrice}
        title={`Buy out for ${auction.buyoutPrice}`}
        className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50 inline-flex items-center justify-center gap-1 w-[120px] shrink-0'
      >
        <span>Buy out</span>
        <span className='font-normal text-xs flex items-center gap-1'>
          ({auction.buyoutPrice}
          <Image src='/images/crowns.png' width={10} height={10} alt='' style={{ width: 'auto', height: 'auto' }} />)
        </span>
      </button>
    </div>
  );
}
