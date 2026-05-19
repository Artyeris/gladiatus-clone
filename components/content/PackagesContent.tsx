'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import ItemImage from '@/components/shared/ItemImage';
import ItemTooltip from '@/components/overview/ItemTooltip';
import ItemTypeDropdown from '@/components/shared/ItemTypeDropdown';
import {
  countByType,
  matchesType,
  type ItemTypeFilterValue,
} from '@/components/shared/ItemTypeFilter';
import {
  claimPackage,
  discardPackage,
} from '@/lib/actions/package/package.action';
import { PackageView } from '@/lib/actions/package/package.types';
import { fullItemName, QUALITY_COLOR } from '@/lib/utils/itemUtils';

interface Props {
  initialPackages: PackageView[];
}

const SOURCE_LABEL: Record<NonNullable<PackageView['source']>, string> = {
  shop: 'Shop',
  auction: 'Auction',
  market: 'Market',
  expedition: 'Expedition',
  arena: 'Arena',
  quest: 'Quest',
  dungeon: 'Dungeon',
  other: 'Other',
};

const SOURCE_COLOR: Record<NonNullable<PackageView['source']>, string> = {
  shop: '#7c7060',
  auction: '#d4af37',
  market: '#3ca33c',
  expedition: '#3a7bd6',
  arena: '#d63a3a',
  quest: '#9b59b6',
  dungeon: '#e08a30',
  other: '#888',
};

const PAGE_SIZE = 12;

const PackagesContent = ({ initialPackages }: Props) => {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [busy, setBusy] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ItemTypeFilterValue>('all');
  const [page, setPage] = useState(0);

  const filtered = packages.filter((p) => matchesType(p.item, typeFilter));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // Reset page when the filter shrinks the list past the current page.
  useEffect(() => {
    if (page > pageCount - 1) setPage(0);
  }, [pageCount, page]);

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
            <em> Claim</em> to move a package into your inventory.
          </p>
          <p className='text-xs opacity-80 mt-1'>
            Active packages: <span className='font-semibold'>{packages.length}</span>
          </p>
        </div>
      </Section>

      <Section title='Contents'>
        <div className='flex flex-wrap items-center gap-4 px-3 py-2 border-b-[2px] border-cream2 bg-cream2/40'>
          <ItemTypeDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            counts={countByType(packages.map((p) => p.item))}
          />
        </div>
        {filtered.length === 0 ? (
          <div className='px-3 py-3 italic opacity-80 text-sm'>
            {packages.length === 0 ? 'No packages waiting.' : 'No packages match the filter.'}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '10px',
              padding: '10px',
            }}
          >
            {pageItems.map((p) => (
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
        {pageCount > 1 && (
          <div className='flex items-center justify-between gap-2 px-3 py-2 border-t-[2px] border-cream2 text-xs'>
            <span className='opacity-80'>
              Page <strong>{safePage + 1}</strong> of <strong>{pageCount}</strong>
              {' '}&middot; {filtered.length} packages
            </span>
            <div className='flex gap-1'>
              <PageButton onClick={() => setPage(0)}                       disabled={safePage === 0}>« First</PageButton>
              <PageButton onClick={() => setPage((p) => Math.max(0, p-1))} disabled={safePage === 0}>‹ Prev</PageButton>
              <PageButton onClick={() => setPage((p) => Math.min(pageCount-1, p+1))} disabled={safePage >= pageCount-1}>Next ›</PageButton>
              <PageButton onClick={() => setPage(pageCount - 1)}            disabled={safePage >= pageCount-1}>Last »</PageButton>
            </div>
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

function PageButton({
  onClick, disabled, children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='general-button px-2 py-[2px] rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-40'
    >
      {children}
    </button>
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
      className='flex flex-col items-center gap-2 p-3 rounded-sm'
      style={{ background: '#cdb88a', border: '1px solid #5c3a21' }}
    >
      <span
        className='text-[10px] font-semibold uppercase tracking-wider px-2 py-[1px] rounded-sm text-cream2 self-start'
        style={{ background: SOURCE_COLOR[pkg.source] }}
      >
        {SOURCE_LABEL[pkg.source]}
      </span>
      {item ? (
        <ItemTooltip item={item}>
          <div
            className='relative'
            style={{
              width: '72px',
              height: '72px',
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
              sizes='72px'
              style={{ objectFit: 'contain', padding: '4px' }}
            />
          </div>
        </ItemTooltip>
      ) : (
        <div className='w-[72px] h-[72px] bg-brown2/30 rounded-sm' />
      )}
      <span
        className='text-xs font-semibold text-center w-full leading-tight'
        style={{ color: nameColor }}
      >
        {item ? fullItemName(item) : 'Unknown item'}
      </span>
      {pkg.detail && (
        <span className='text-[10px] opacity-80 text-center w-full leading-tight'>
          {pkg.detail}
        </span>
      )}
      <div className='flex gap-1 w-full mt-1'>
        <button
          onClick={onClaim}
          disabled={busy}
          className='general-button flex-1 px-2 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
        >
          Claim
        </button>
        <button
          onClick={onDiscard}
          disabled={busy}
          className='px-2 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
          style={{ background: '#974342', color: '#f7eccc', border: '1px solid #5c3a21' }}
        >
          Drop
        </button>
      </div>
    </div>
  );
}
