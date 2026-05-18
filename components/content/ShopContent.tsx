'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import ItemImage from '@/components/shared/ItemImage';
import ItemTooltip from '@/components/overview/ItemTooltip';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { buyFromShop, forceRefreshShop } from '@/lib/actions/shop/shop.action';
import { fullItemName, QUALITY_COLOR } from '@/lib/utils/itemUtils';
import type { ShopView } from '@/lib/types/shop';

interface Props {
  shop: ShopView;
  character: CharacterInterface;
  title: string;
  tagline: string;
  refreshCost: number;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'ready';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const ShopContent = ({ shop, character, title, tagline, refreshCost }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(shop.msUntilRefresh);

  useEffect(() => setCountdown(shop.msUntilRefresh), [shop.msUntilRefresh]);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => (c > 1000 ? c - 1000 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const onBuy = async (slotIndex: number) => {
    setBusy(true);
    const res = await buyFromShop({ shopType: shop.shopType, slotIndex });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Bought ${res.itemName} for ${res.price} gold - delivered to Packages`);
    router.refresh();
  };

  const onRefresh = async () => {
    if ((character.crowns ?? 0) < refreshCost) return toast.error(`Need ${refreshCost} gold`);
    if (!confirm(`Restock for ${refreshCost} gold now?`)) return;
    setBusy(true);
    const res = await forceRefreshShop(shop.shopType);
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('New goods stocked');
    router.refresh();
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm flex justify-between'>
        <span>{title}</span>
        <span className='text-xs opacity-90'>Balance: {character.crowns ?? 0}</span>
      </div>

      <div className='flex gap-3 text-sm'>
        <Image
          src='/images/market.webp'
          alt='merchant'
          width={140}
          height={140}
          className='rounded-sm shrink-0 object-cover'
          style={{ width: '140px', height: '140px' }}
        />
        <div className='flex flex-col gap-1'>
          <p>{tagline}</p>
          <p className='opacity-80'>
            New goods in <strong>{formatCountdown(countdown)}</strong>.
          </p>
          <button
            type='button'
            onClick={onRefresh}
            disabled={busy}
            className='general-button px-3 py-1 rounded-sm text-xs font-semibold w-fit hover:brightness-110 disabled:opacity-50 mt-1'
          >
            Restock now ({refreshCost} gold)
          </button>
        </div>
      </div>

      <div
        className='brown-card rounded-sm p-3'
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}
      >
        {shop.slots.map((slot) => (
          <ShopSlot
            key={slot.index}
            slot={slot}
            busy={busy}
            canAfford={(character.crowns ?? 0) >= slot.price}
            onBuy={() => onBuy(slot.index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ShopContent;

function ShopSlot({
  slot, busy, canAfford, onBuy,
}: {
  slot: ShopView['slots'][number];
  busy: boolean;
  canAfford: boolean;
  onBuy: () => void;
}) {
  // Fixed-height grid cell so a 2-line item name doesn't push the
  // Buy button out of alignment with the other slots in the row.
  // Header (icon + name + lvl) gets a flex-1 column that absorbs the
  // height variance; the price button sits in a fixed footer.
  if (!slot.item) {
    return (
      <div
        className='flex flex-col items-center justify-center p-2 rounded-sm bg-brown2/10 text-xs opacity-50'
        style={{ height: '170px' }}
      >
        Sold out
      </div>
    );
  }
  const nameColor = QUALITY_COLOR[slot.item.quality ?? 'common'];
  const disabled = busy || !canAfford;
  return (
    <div
      className='flex flex-col items-center p-2 rounded-sm bg-brown2/10'
      style={{ height: '170px' }}
    >
      <ItemTooltip item={slot.item}>
        <div
          style={{
            position: 'relative',
            width: '56px',
            height: '56px',
            background: '#a89f91',
            border: '2px solid #5c3a21',
            borderRadius: '4px',
            cursor: 'help',
          }}
        >
          <ItemImage
            imageId={slot.item.image}
            alt={slot.item.name}
            fill
            sizes='56px'
            style={{ objectFit: 'contain', padding: '4px' }}
          />
        </div>
      </ItemTooltip>
      <div className='flex flex-col items-center flex-1 justify-center gap-1 py-1 overflow-hidden'>
        <div
          className='text-xs font-semibold text-center leading-tight line-clamp-2'
          style={{ color: nameColor }}
          title={fullItemName(slot.item)}
        >
          {fullItemName(slot.item)}
        </div>
        <div className='text-[10px] opacity-80'>lvl {slot.item.level}</div>
      </div>
      <button
        type='button'
        onClick={onBuy}
        disabled={disabled}
        className={`general-button px-2 py-1 rounded-sm text-xs font-semibold w-full mt-auto shrink-0 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
        }`}
      >
        Buy {slot.price}
      </button>
    </div>
  );
}
