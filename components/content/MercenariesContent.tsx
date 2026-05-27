'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import {
  buyMercenary,
  buyMercenaryListing,
  cancelMercenaryListing,
  dismissMercenary,
  listMercenaryOnMarket,
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
  offers: Offer[];
  owned: OwnedMerc[];
  listings: PlayerListing[];
}

type Tab = 'vendor' | 'market' | 'roster';

const MercenariesContent = ({ characterGold, offers, owned, listings }: Props) => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('vendor');
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

  const onBuyListing = async (l: PlayerListing) => {
    if (characterGold < l.price) {
      toast.error(`Need ${l.price} gold`);
      return;
    }
    setBusy(l._id);
    const res: any = await buyMercenaryListing({ listingId: l._id });
    setBusy(null);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Bought ${l.mercenary.name} from ${l.sellerName}`);
    startTransition(() => router.refresh());
  };

  const onCancelListing = async (l: PlayerListing) => {
    setBusy(l._id);
    const res: any = await cancelMercenaryListing({ listingId: l._id });
    setBusy(null);
    if (res?.error) return toast.error(res.error.message);
    toast(`Cancelled listing for ${l.mercenary.name}`);
    startTransition(() => router.refresh());
  };

  const onSell = async (merc: OwnedMerc, price: number) => {
    setBusy(merc._id);
    const res: any = await listMercenaryOnMarket({ mercenaryId: merc._id, price });
    setBusy(null);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Listed ${merc.name} for ${price} gold`);
    startTransition(() => router.refresh());
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <h1 className='text-xl font-bold border-b-[3px] border-brown2 text-center text-brown2'>
        Mercenaries
      </h1>

      <div className='flex gap-2 px-1 font-semibold text-brown2'>
        <TabChip label={`Vendor (${offers.length})`}        active={tab === 'vendor'} onClick={() => setTab('vendor')} />
        <TabChip label={`Player Market (${listings.length})`} active={tab === 'market'} onClick={() => setTab('market')} />
        <TabChip label={`Your Roster (${owned.length})`}    active={tab === 'roster'} onClick={() => setTab('roster')} />
      </div>

      <div className='text-xs italic opacity-80'>
        Mercenaries can be hired from the Italy vendor, bought from other players on the Player Market,
        or also browsed from the <a className='underline text-red3' href='/game/market'>Market page</a>.
      </div>

      {tab === 'vendor' && (
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
      )}

      {tab === 'market' && (
        <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
          <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>
            Player Market &middot; Your gold: <CompactNumber value={characterGold} />
          </div>
          {listings.length === 0 ? (
            <div className='px-3 py-4 italic opacity-80 text-center text-xs'>
              No mercenaries listed by other players. Be the first to sell from your roster.
            </div>
          ) : (
            <div className='px-3 py-2 grid grid-cols-1 md:grid-cols-2 gap-2'>
              {listings.map((l) => (
                <ListingCard
                  key={l._id}
                  listing={l}
                  busy={busy === l._id}
                  canAfford={characterGold >= l.price}
                  onBuy={() => onBuyListing(l)}
                  onCancel={() => onCancelListing(l)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'roster' && (
        <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
          <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>
            Your roster ({owned.length})
          </div>
          {owned.length === 0 ? (
            <div className='px-3 py-4 italic opacity-80 text-center text-xs'>
              No mercenaries hired yet. Pick one from the Vendor tab above.
            </div>
          ) : (
            <div className='px-3 py-2 grid grid-cols-1 md:grid-cols-2 gap-2'>
              {owned.map((m) => (
                <OwnedCard
                  key={m._id}
                  merc={m}
                  busy={busy === m._id}
                  onDismiss={() => onDismiss(m)}
                  onSell={(price) => onSell(m, price)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MercenariesContent;

function TabChip({
  label, active, onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='px-4 py-1 rounded-sm font-semibold text-xs cursor-pointer border-[2px]'
      style={
        active
          ? { background: '#974342', borderColor: '#eed7a1', outline: '2px solid #974342', color: '#f4eac8' }
          : { background: '#b59964', borderColor: '#eed7a1', outline: '2px solid #b59964', color: '#3e2714' }
      }
    >
      {label}
    </button>
  );
}

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

function ListingCard({
  listing, busy, canAfford, onBuy, onCancel,
}: {
  listing: PlayerListing;
  busy: boolean;
  canAfford: boolean;
  onBuy: () => void;
  onCancel: () => void;
}) {
  const m = listing.mercenary;
  return (
    <div className='border-[2px] border-cream2 rounded-sm px-2 py-2 flex flex-col gap-1 text-xs'>
      <div className='flex justify-between items-center'>
        <span className='font-semibold'>
          {m.name}{' '}
          <span style={{ color: QUALITY_COLOR[m.quality] }}>
            ({QUALITY_LABEL[m.quality]})
          </span>
        </span>
        <span className='opacity-80'>{ROLE_LABEL[m.type]} &middot; Lvl {m.level}</span>
      </div>
      <StatsRow stats={m.stats} />
      <div className='text-[10px] opacity-80'>Seller: {listing.sellerName}</div>
      <div className='flex justify-between items-center mt-1'>
        <span><strong>Power:</strong> <CompactNumber value={m.power} /></span>
        {listing.isMine ? (
          <button
            type='button'
            onClick={onCancel}
            disabled={busy}
            className='general-button px-3 py-0.5 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
          >
            {busy ? '...' : `Cancel (${listing.price}g)`}
          </button>
        ) : (
          <button
            type='button'
            onClick={onBuy}
            disabled={busy || !canAfford}
            className='general-button px-3 py-0.5 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
          >
            {busy ? '...' : `Buy (${listing.price}g)`}
          </button>
        )}
      </div>
    </div>
  );
}

function OwnedCard({
  merc, busy, onDismiss, onSell,
}: {
  merc: OwnedMerc;
  busy: boolean;
  onDismiss: () => void;
  onSell: (price: number) => void;
}) {
  const [sellMode, setSellMode] = useState(false);
  const [price, setPrice] = useState<string>('100');
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
        {sellMode ? (
          <div className='flex items-center gap-1'>
            <input
              type='number'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className='fancy-input w-20 px-1 py-0.5 text-xs'
              min={1}
            />
            <button
              type='button'
              onClick={() => {
                const p = parseInt(price, 10);
                if (!Number.isFinite(p) || p < 1) return;
                onSell(p);
              }}
              disabled={busy}
              className='general-button px-2 py-0.5 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
            >
              List
            </button>
            <button
              type='button'
              onClick={() => setSellMode(false)}
              className='text-xs underline'
            >
              x
            </button>
          </div>
        ) : (
          <div className='flex gap-1'>
            <button
              type='button'
              onClick={() => setSellMode(true)}
              disabled={busy}
              className='general-button px-2 py-0.5 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
            >
              Sell
            </button>
            <button
              type='button'
              onClick={onDismiss}
              disabled={busy}
              className='general-button px-2 py-0.5 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
            >
              Dismiss
            </button>
          </div>
        )}
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
