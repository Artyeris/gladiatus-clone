'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import toast from 'react-hot-toast';

import ItemImage from '@/components/shared/ItemImage';
import ItemTooltip from '@/components/overview/ItemTooltip';
import ItemTypeFilter, {
  countByType,
  matchesType,
  type ItemTypeFilterValue,
} from '@/components/shared/ItemTypeFilter';
import QualityFilter, {
  countByQuality,
  matchesQuality,
  type QualityFilterValue,
} from '@/components/shared/QualityFilter';
import SortStrip, { type SortMode } from '@/components/shared/SortStrip';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import {
  buyMarketListing,
  cancelMarketListing,
  placeMarketListing,
} from '@/lib/actions/market/market.action';
import {
  BAG_COUNT,
  INVENTORY_COLS,
  INVENTORY_ROWS,
  InventoryEntry,
  bagFillCounts,
  buildGrid,
} from '@/lib/utils/inventory/grid';
import { fullItemName, QUALITY_COLOR } from '@/lib/utils/itemUtils';

const DRAG_TYPE = 'MARKET_ITEM';

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

function entriesFromCharacter(character: CharacterInterface): InventoryEntry[] {
  const inv = character.inventory as any;
  if (!Array.isArray(inv)) return [];
  if (inv.length > 0 && !Array.isArray(inv[0])) {
    return inv
      .filter((e: any) => e && e.item)
      .map((e: any) => ({ item: e.item, x: e.x ?? 0, y: e.y ?? 0, bag: e.bag ?? 0 }));
  }
  const out: InventoryEntry[] = [];
  for (let x = 0; x < inv.length; x++) {
    const row = inv[x];
    if (!Array.isArray(row)) continue;
    for (let y = 0; y < row.length; y++) {
      const cell = row[y];
      if (cell && typeof cell === 'object' && 'name' in cell) {
        out.push({ item: cell, x, y, bag: 0 });
      }
    }
  }
  return out;
}

const MarketContent = ({ character, listings }: Props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Board character={character} listings={listings} />
    </DndProvider>
  );
};

export default MarketContent;

function Board({ character, listings }: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState<InventoryEntry[]>(entriesFromCharacter(character));
  const [pickedItem, setPickedItem] = useState<ItemInterface | null>(null);
  const [price, setPrice] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ItemTypeFilterValue>('all');
  const [qualityFilter, setQualityFilter] = useState<QualityFilterValue>('all');
  const [sortBy, setSortBy] = useState<SortMode>('default');

  const filteredListings = listings
    .filter((l) => matchesType(l.item, typeFilter) && matchesQuality(l.item, qualityFilter))
    .slice()
    .sort((a, b) => {
      if (sortBy === 'levelAsc')  return (a.item?.level ?? 0) - (b.item?.level ?? 0);
      if (sortBy === 'levelDesc') return (b.item?.level ?? 0) - (a.item?.level ?? 0);
      return 0;
    });

  useEffect(() => {
    setEntries(entriesFromCharacter(character));
  }, [character]);

  const onItemDropped = (item: ItemInterface) => {
    setPickedItem(item);
  };

  const onPlace = async () => {
    if (!pickedItem) return toast.error('Drop an item into the sell slot first');
    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice <= 0) {
      return toast.error('Enter a valid price');
    }
    setBusy(true);
    const res = await placeMarketListing({ itemId: pickedItem._id, price: numPrice });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Listed for sale');
    setPickedItem(null);
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
      <Section title='Description'>
        <div className='flex gap-3 px-3 py-2 text-sm'>
          <Image
            src='/images/market.webp'
            alt='market'
            width={120}
            height={120}
            className='rounded-sm shrink-0'
            style={{ width: 'auto', height: 'auto' }}
          />
          <div className='flex flex-col gap-1'>
            <p>
              The bustle of the market grows louder as you approach. Hundreds
              of traders gather here every day, haggling and selling goods from
              all over the world.
            </p>
            <p>Drag an item from your bag into the sell slot, set a price, and confirm.</p>
            <div className='font-semibold mt-1'>
              Your balance: {character.crowns}
            </div>
          </div>
        </div>
      </Section>

      <Section title='Sell'>
        {/* SellPanel is vertically aligned to the bottom of the row so
            the price input and Confirm button sit lower (closer to the
            inventory's last row), and the inventory is nudged right with
            a wider left gap. */}
        <div className='flex gap-6 px-4 py-3 text-sm items-end justify-between'>
          <SellPanel
            picked={pickedItem}
            price={price}
            setPrice={setPrice}
            onPlace={onPlace}
            onClear={() => setPickedItem(null)}
            busy={busy}
          />
          <div className='ml-6'>
            <InventoryView entries={entries} pickedItemId={pickedItem?._id} onPick={onItemDropped} />
          </div>
        </div>
      </Section>

      <Section title='Listings'>
        <ItemTypeFilter
          value={typeFilter}
          onChange={setTypeFilter}
          counts={countByType(listings.map((l) => l.item))}
        />
        <QualityFilter
          value={qualityFilter}
          onChange={setQualityFilter}
          counts={countByQuality(listings.map((l) => l.item))}
        />
        <SortStrip value={sortBy} onChange={setSortBy} />
        {filteredListings.length === 0 ? (
          <div className='px-3 py-3 italic opacity-80 text-sm'>
            {listings.length === 0
              ? 'Nothing for sale right now.'
              : 'No listings match the selected filter.'}
          </div>
        ) : (
          filteredListings.map((listing, idx) => (
            <ListingRow
              key={listing._id}
              listing={listing}
              last={idx === filteredListings.length - 1}
              busy={busy}
              onCancel={onCancel}
              onBuy={onBuy}
            />
          ))
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>{title}</div>
      <div className='flex flex-col'>{children}</div>
    </div>
  );
}

function SellPanel({
  picked,
  price,
  setPrice,
  onPlace,
  onClear,
  busy,
}: {
  picked: ItemInterface | null;
  price: string;
  setPrice: (s: string) => void;
  onPlace: () => void;
  onClear: () => void;
  busy: boolean;
}) {
  const [{ isOver, canAccept }, drop] = useDrop(
    () => ({
      accept: DRAG_TYPE,
      drop: () => ({ accepted: true }),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canAccept: monitor.canDrop(),
      }),
    }),
    []
  );

  const slotBg = isOver && canAccept ? '#5c8a3a' : '#3e2714';

  return (
    <div
      className='flex flex-col gap-2 shrink-0 items-center'
      style={{ width: '210px' }}
    >
      <div
        ref={(node) => {
          drop(node);
        }}
        style={{
          width: '160px',
          height: '160px',
          background: slotBg,
          border: '2px solid #5c3a21',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {picked ? (
          <ItemTooltip item={picked}>
            <div
              style={{ position: 'absolute', inset: 0, cursor: 'help' }}
              onClick={onClear}
              title='Click to clear'
            >
              <ItemImage
                imageId={picked.image}
                alt={picked.name}
                fill
                sizes='160px'
                style={{ objectFit: 'contain', padding: '8px' }}
              />
            </div>
          </ItemTooltip>
        ) : (
          <span style={{ fontSize: '12px', color: '#cdb88a', fontWeight: 600 }}>
            Drop item here
          </span>
        )}
      </div>

      <label className='text-xs font-semibold mt-1 self-start ml-[25px]'>Market price</label>
      <div className='flex items-center gap-1 w-[160px]'>
        <input
          type='number'
          min={1}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className='border border-brown2 px-2 py-1 rounded-sm w-full bg-cream-card'
          placeholder='0'
        />
        <Image src='/images/crowns.png' width={14} height={14} alt='crowns' />
      </div>

      <button
        onClick={onPlace}
        disabled={busy || !picked}
        className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50 w-[160px]'
      >
        Confirm
      </button>
    </div>
  );
}

const TAB_LABELS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function InventoryView({
  entries,
  pickedItemId,
  onPick,
}: {
  entries: InventoryEntry[];
  pickedItemId: string | undefined;
  onPick: (item: ItemInterface) => void;
}) {
  const [activeBag, setActiveBag] = useState(0);

  // Hide the item that's currently parked in the sell slot.
  const visibleEntries = pickedItemId
    ? entries.filter((e) => {
        const it = e.item as any;
        const id = it?._id ?? it;
        return String(id) !== String(pickedItemId);
      })
    : entries;
  const grid = buildGrid(visibleEntries, activeBag);
  const counts = bagFillCounts(visibleEntries);

  return (
    <div
      style={{
        background: '#5c3a21',
        padding: '8px',
        borderRadius: '5px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${BAG_COUNT}, 1fr)`,
          gap: '4px',
          marginBottom: '6px',
        }}
      >
        {Array.from({ length: BAG_COUNT }).map((_, i) => (
          <BagTabButton
            key={i}
            label={TAB_LABELS[i] ?? String(i + 1)}
            active={i === activeBag}
            count={counts[i]}
            onSelect={() => setActiveBag(i)}
          />
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${INVENTORY_COLS}, 36px)`,
          gap: '4px',
        }}
      >
        {Array.from({ length: INVENTORY_ROWS }).flatMap((_, x) =>
          Array.from({ length: INVENTORY_COLS }).map((__, y) => {
            const cell = grid[x]?.[y];
            return (
              <div
                key={`${x}-${y}`}
                style={{
                  position: 'relative',
                  width: '36px',
                  height: '36px',
                  background: '#3e2714',
                  border: '1px solid #8b5a2b',
                  borderRadius: '2px',
                }}
              >
                {cell?.isAnchor && cell.item && (
                  <DraggableInventoryItem item={cell.item} onPick={onPick} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function BagTabButton({
  label,
  active,
  count,
  onSelect,
}: {
  label: string;
  active: boolean;
  count: number;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      type='button'
      style={{
        position: 'relative',
        height: '24px',
        background: active ? '#dcd0b8' : '#3e2714',
        color: active ? '#3e2714' : '#f4eac8',
        border: '1px solid #8b5a2b',
        borderRadius: '2px',
        fontFamily: "'Cinzel', serif",
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
      title={`Bag ${label}${count > 0 ? ` (${count} item${count === 1 ? '' : 's'})` : ''}`}
    >
      {label}
      {count > 0 && !active && (
        <span style={{
          position: 'absolute',
          right: 2, top: 1,
          fontSize: '8px',
          opacity: 0.85,
        }}>•</span>
      )}
    </button>
  );
}

function DraggableInventoryItem({
  item,
  onPick,
}: {
  item: ItemInterface;
  onPick: (item: ItemInterface) => void;
}) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DRAG_TYPE,
      item: { item },
      end: (_dragged, monitor) => {
        const result = monitor.getDropResult() as { accepted?: boolean } | null;
        if (result?.accepted) onPick(item);
      },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [item]
  );

  return (
    <ItemTooltip item={item}>
      <div
        ref={(node) => {
          drag(node);
        }}
        style={{
          position: 'absolute',
          inset: 0,
          cursor: 'grab',
          opacity: isDragging ? 0.4 : 1,
        }}
      >
        <ItemImage
          imageId={item.image}
          alt={item.name}
          fill
          sizes='36px'
          style={{ objectFit: 'contain', padding: '2px' }}
        />
      </div>
    </ItemTooltip>
  );
}

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
            <ItemImage
              imageId={item.image}
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
