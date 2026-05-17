'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import ItemImage from '@/components/shared/ItemImage';
import ItemTooltip from '@/components/overview/ItemTooltip';
import {
  PackageView,
  claimPackage,
  discardPackage,
} from '@/lib/actions/package/package.action';
import { fullItemName, QUALITY_COLOR } from '@/lib/utils/itemUtils';

interface Props {
  initialPackages: PackageView[];
}

const SOURCE_LABEL: Record<PackageView['source'], string> = {
  shop: 'Shop',
  auction: 'Auction',
  market: 'Market',
  expedition: 'Expedition',
  arena: 'Arena',
  quest: 'Quest',
  dungeon: 'Dungeon',
  other: 'Other',
};

const SOURCE_COLOR: Record<PackageView['source'], string> = {
  shop: '#7c7060',
  auction: '#d4af37',
  market: '#3ca33c',
  expedition: '#3a7bd6',
  arena: '#d63a3a',
  quest: '#9b59b6',
  dungeon: '#e08a30',
  other: '#888',
};

function formatRemaining(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return `${days}d ${hours}h`;
}

const PackagesContent = ({ initialPackages }: Props) => {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [busy, setBusy] = useState(false);

  const onClaim = async (id: string) => {
    setBusy(true);
    const res = await claimPackage({ packageId: id });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    setPackages((prev) => prev.filter((p) => p._id !== id));
    toast.success('Moved to your inventory');
    router.refresh();
  };

  const onDiscard = async (id: string) => {
    if (!confirm('Discard this package? The item will be lost.')) return;
    setBusy(true);
    const res = await discardPackage({ packageId: id });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    setPackages((prev) => prev.filter((p) => p._id !== id));
    toast.success('Discarded');
    router.refresh();
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <Section title='Packages'>
        <div className='px-3 py-2 text-sm'>
          <p>
            Items you have won, bought or looted land here first. Press
            <em> Claim</em> to move a package into your inventory. Packages
            expire after 7 days if untouched.
          </p>
          <p className='text-xs opacity-80 mt-1'>
            Active packages: <span className='font-semibold'>{packages.length}</span>
          </p>
        </div>
      </Section>

      <Section title='Contents'>
        {packages.length === 0 ? (
          <div className='px-3 py-3 italic opacity-80 text-sm'>No packages waiting.</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '6px',
              padding: '8px',
            }}
          >
            {packages.map((p) => (
              <PackageTile
                key={p._id}
                pkg={p}
                busy={busy}
                onClaim={() => onClaim(p._id)}
                onDiscard={() => onDiscard(p._id)}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default PackagesContent;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>{title}</div>
      <div className='flex flex-col'>{children}</div>
    </div>
  );
}

function PackageTile({
  pkg, busy, onClaim, onDiscard,
}: {
  pkg: PackageView;
  busy: boolean;
  onClaim: () => void;
  onDiscard: () => void;
}) {
  const item = pkg.item;
  const nameColor = item ? QUALITY_COLOR[item.quality ?? 'common'] : '#ddd';

  return (
    <div
      className='flex flex-col items-center gap-1 p-2 rounded-sm'
      style={{ background: '#cdb88a', border: '1px solid #5c3a21', position: 'relative' }}
    >
      <span
        className='text-[9px] font-semibold uppercase tracking-wider absolute top-1 left-1 px-1 rounded-sm text-cream2'
        style={{ background: SOURCE_COLOR[pkg.source] }}
      >
        {SOURCE_LABEL[pkg.source]}
      </span>
      {item ? (
        <ItemTooltip item={item}>
          <div
            className='relative'
            style={{
              width: '64px',
              height: '64px',
              background: '#a89f91',
              border: '1px solid #5c3a21',
              borderRadius: '2px',
              cursor: 'help',
            }}
          >
            <ItemImage
              imageId={item.image}
              alt={item.name}
              fill
              sizes='64px'
              style={{ objectFit: 'contain', padding: '4px' }}
            />
          </div>
        </ItemTooltip>
      ) : (
        <div className='w-16 h-16 bg-brown2/30 rounded-sm' />
      )}
      <span
        className='text-xs font-semibold text-center truncate w-full'
        style={{ color: nameColor }}
      >
        {item ? fullItemName(item) : 'Unknown item'}
      </span>
      {pkg.detail && <span className='text-[10px] opacity-80 truncate w-full text-center'>{pkg.detail}</span>}
      <span className='text-[10px] opacity-70'>Expires in {formatRemaining(pkg.expiresAt)}</span>
      <div className='flex gap-1 w-full'>
        <button
          onClick={onClaim}
          disabled={busy}
          className='general-button flex-1 px-2 py-[2px] rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
        >
          Claim
        </button>
        <button
          onClick={onDiscard}
          disabled={busy}
          className='px-2 py-[2px] rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
          style={{ background: '#974342', color: '#f7eccc', border: '1px solid #5c3a21' }}
        >
          Drop
        </button>
      </div>
    </div>
  );
}
