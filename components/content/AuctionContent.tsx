'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import toast from 'react-hot-toast';

import ItemTooltip from '@/components/overview/ItemTooltip';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import {
  cancelAuctionAction,
  placeAuctionAction,
  placeAuctionBid,
} from '@/lib/actions/auction/auction.action';
import {
  INVENTORY_COLS,
  INVENTORY_ROWS,
  InventoryEntry,
  buildGrid,
} from '@/lib/utils/inventory/grid';
import { fullItemName, QUALITY_COLOR } from '@/lib/utils/itemUtils';
import type { AuctionPhase } from '@/lib/utils/auction';

const DRAG_TYPE = 'AUCTION_ITEM';

export interface AuctionView {
  _id: string;
  item: ItemInterface | null;
  startingPrice: number;
  currentBid: number;
  hasBids: boolean;
  seller: { _id: string; name: string } | null;
  highestBidder: { _id: string; name: string } | null;
  endsAt: string | Date;
  phase: AuctionPhase;
  isMine: boolean;
  isLeading: boolean;
}

interface Props {
  character: CharacterInterface;
  auctions: AuctionView[];
}

function entriesFromCharacter(character: CharacterInterface): InventoryEntry[] {
  const inv = character.inventory as any;
  if (!Array.isArray(inv)) return [];
  if (inv.length > 0 && !Array.isArray(inv[0])) {
    return inv
      .filter((e: any) => e && e.item)
      .map((e: any) => ({ item: e.item, x: e.x ?? 0, y: e.y ?? 0 }));
  }
  const out: InventoryEntry[] = [];
  for (let x = 0; x < inv.length; x++) {
    const row = inv[x];
    if (!Array.isArray(row)) continue;
    for (let y = 0; y < row.length; y++) {
      const cell = row[y];
      if (cell && typeof cell === 'object' && 'name' in cell) {
        out.push({ item: cell, x, y });
      }
    }
  }
  return out;
}

const AuctionContent = ({ character, auctions }: Props) => (
  <DndProvider backend={HTML5Backend}>
    <Board character={character} auctions={auctions} />
  </DndProvider>
);

export default AuctionContent;

const PHASE_COLOR: Record<AuctionPhase, string> = {
  'Very Long': '#3a7bd6',
  Long: '#3ca33c',
  Medium: '#d4af37',
  Short: '#e08a30',
  'Very Short': '#d63a3a',
  Ended: '#888',
};

function Board({ character, auctions }: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState<InventoryEntry[]>(entriesFromCharacter(character));
  const [picked, setPicked] = useState<ItemInterface | null>(null);
  const [price, setPrice] = useState<string>('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEntries(entriesFromCharacter(character));
  }, [character]);

  const onPlace = async () => {
    if (!picked) return toast.error('Drop an item into the auction slot');
    const num = Number(price);
    if (!Number.isFinite(num) || num <= 0) return toast.error('Enter a valid starting price');
    setBusy(true);
    const res = await placeAuctionAction({ itemId: picked._id, startingPrice: num });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Auction listed');
    setPicked(null);
    setPrice('');
    router.refresh();
  };

  const onBid = async (auctionId: string, amount: number) => {
    setBusy(true);
    const res = await placeAuctionBid({ auctionId, amount });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Bid placed');
    router.refresh();
  };

  const onCancel = async (auctionId: string) => {
    setBusy(true);
    const res = await cancelAuctionAction({ auctionId });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Auction cancelled');
    router.refresh();
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <Section title='Auction'>
        <div className='flex gap-3 px-3 py-2 text-sm'>
          <Image
            src='/images/barracks.jpg'
            alt='auctioneer'
            width={120}
            height={120}
            className='rounded-sm shrink-0'
          />
          <div className='flex flex-col gap-1'>
            <p>
              The auctioneer raises items high, calling for bids. Phases tick
              from Very Long down to Very Short -- bid wisely.
            </p>
            <p>Refunds are returned to outbid players automatically.</p>
            <div className='font-semibold mt-1'>Your balance: {character.crowns}</div>
          </div>
        </div>
      </Section>

      <Section title='Place auction'>
        <div className='flex gap-3 px-3 py-3 text-sm'>
          <SellPanel
            picked={picked}
            price={price}
            setPrice={setPrice}
            onPlace={onPlace}
            onClear={() => setPicked(null)}
            busy={busy}
          />
          <InventoryView entries={entries} pickedItemId={picked?._id} onPick={setPicked} />
        </div>
      </Section>

      <Section title='Active auctions'>
        {auctions.length === 0 ? (
          <div className='px-3 py-3 italic opacity-80 text-sm'>
            No auctions running right now.
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
              onCancel={onCancel}
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
  picked, price, setPrice, onPlace, onClear, busy,
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
      collect: (m) => ({ isOver: m.isOver(), canAccept: m.canDrop() }),
    }),
    []
  );

  const slotBg = isOver && canAccept ? '#5c8a3a' : '#3e2714';

  return (
    <div className='flex flex-col gap-2 shrink-0' style={{ width: '160px' }}>
      <div
        ref={(node) => { drop(node); }}
        style={{
          width: '120px', height: '120px',
          background: slotBg,
          border: '2px solid #5c3a21',
          borderRadius: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}
      >
        {picked ? (
          <ItemTooltip item={picked}>
            <div
              style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
              onClick={onClear}
              title='Click to clear'
            >
              <Image
                src={`/items/${picked.image}.webp`}
                alt={picked.name} fill sizes='120px'
                style={{ objectFit: 'contain', padding: '6px' }}
              />
            </div>
          </ItemTooltip>
        ) : (
          <span style={{ fontSize: '11px', color: '#cdb88a', fontWeight: 600 }}>
            Drop item here
          </span>
        )}
      </div>

      <label className='text-xs font-semibold mt-1'>Starting price</label>
      <div className='flex items-center gap-1'>
        <input
          type='number' min={1} value={price}
          onChange={(e) => setPrice(e.target.value)}
          className='border border-brown2 px-2 py-1 rounded-sm w-full bg-cream-card'
          placeholder='0'
        />
        <Image src='/images/crowns.png' width={14} height={14} alt='crowns' />
      </div>

      <button
        onClick={onPlace}
        disabled={busy || !picked}
        className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50'
      >
        Auction
      </button>
    </div>
  );
}

function InventoryView({
  entries, pickedItemId, onPick,
}: {
  entries: InventoryEntry[];
  pickedItemId: string | undefined;
  onPick: (item: ItemInterface) => void;
}) {
  const visible = pickedItemId
    ? entries.filter((e) => {
        const it = e.item as any;
        const id = it?._id ?? it;
        return String(id) !== String(pickedItemId);
      })
    : entries;
  const grid = buildGrid(visible);
  return (
    <div style={{ background: '#5c3a21', padding: '8px', borderRadius: '5px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${INVENTORY_COLS}, 36px)`,
        gap: '4px',
      }}>
        {Array.from({ length: INVENTORY_ROWS }).flatMap((_, x) =>
          Array.from({ length: INVENTORY_COLS }).map((__, y) => {
            const cell = grid[x]?.[y];
            return (
              <div
                key={`${x}-${y}`}
                style={{
                  position: 'relative', width: '36px', height: '36px',
                  background: '#3e2714', border: '1px solid #8b5a2b', borderRadius: '2px',
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

function DraggableInventoryItem({
  item, onPick,
}: { item: ItemInterface; onPick: (item: ItemInterface) => void }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DRAG_TYPE,
      item: { item },
      end: (_d, monitor) => {
        const result = monitor.getDropResult() as { accepted?: boolean } | null;
        if (result?.accepted) onPick(item);
      },
      collect: (m) => ({ isDragging: m.isDragging() }),
    }),
    [item]
  );
  return (
    <ItemTooltip item={item}>
      <div
        ref={(node) => { drag(node); }}
        style={{
          position: 'absolute', inset: 0, cursor: 'grab',
          opacity: isDragging ? 0.4 : 1,
        }}
      >
        <Image
          src={`/items/${item.image}.webp`} alt={item.name}
          fill sizes='36px'
          style={{ objectFit: 'contain', padding: '2px' }}
        />
      </div>
    </ItemTooltip>
  );
}

function AuctionRow({
  auction, last, busy, characterCrowns, onBid, onCancel,
}: {
  auction: AuctionView;
  last: boolean;
  busy: boolean;
  characterCrowns: number;
  onBid: (id: string, amount: number) => void;
  onCancel: (id: string) => void;
}) {
  const item = auction.item;
  const nameColor = item ? QUALITY_COLOR[item.quality ?? 'common'] : '#ddd';
  const minBid = auction.hasBids ? auction.currentBid + 1 : auction.currentBid;
  const [bid, setBid] = useState<string>(String(minBid));

  return (
    <div className={`flex items-center gap-3 px-3 py-2 ${!last && 'border-b-[2px] border-cream2'}`}>
      {item ? (
        <ItemTooltip item={item}>
          <div
            className='relative shrink-0'
            style={{
              width: '40px', height: '40px',
              border: '1px solid #5c3a21', borderRadius: '2px',
              cursor: 'help',
            }}
          >
            <Image
              src={`/items/${item.image}.webp`} alt={item.name}
              fill sizes='40px'
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
          Seller: {auction.seller?.name ?? 'unknown'}
          {item && <> &middot; lvl {item.level}</>}
          {auction.highestBidder && <> &middot; leading: {auction.highestBidder.name}</>}
        </span>
      </div>

      <span
        className='text-xs font-semibold shrink-0 px-2 py-[2px] rounded-sm'
        style={{ background: PHASE_COLOR[auction.phase], color: '#fff' }}
      >
        {auction.phase}
      </span>

      <div className='font-semibold flex items-center gap-1 shrink-0'>
        {auction.currentBid}
        <Image src='/images/crowns.png' width={12} height={12} alt='crowns' />
      </div>

      {auction.isMine ? (
        <button
          onClick={() => onCancel(auction._id)}
          disabled={busy || auction.hasBids}
          title={auction.hasBids ? 'Cannot cancel after first bid' : ''}
          className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50 shrink-0'
        >
          Cancel
        </button>
      ) : (
        <div className='flex items-center gap-1 shrink-0'>
          <input
            type='number' min={minBid} value={bid}
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
        </div>
      )}
    </div>
  );
}
