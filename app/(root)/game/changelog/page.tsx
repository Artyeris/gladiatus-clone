import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUser } from '@/lib/actions/user/getUser.action';
import { CHANGELOG } from '@/lib/utils/changelog';

const PAGE_SIZE = 15;

const Page = async ({
  searchParams,
}: { searchParams?: { page?: string } }) => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const pageCount = Math.max(1, Math.ceil(CHANGELOG.length / PAGE_SIZE));
  const requested = Number(searchParams?.page ?? '1');
  const page = Number.isFinite(requested) && requested >= 1
    ? Math.min(Math.floor(requested), pageCount)
    : 1;
  const slice = CHANGELOG.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className='px-6 flex flex-col gap-3 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm'>
        Change Log
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div
          className='grid font-semibold text-xs border-b-[2px] border-cream2 bg-brown2/10'
          style={{ gridTemplateColumns: '110px 90px 1fr' }}
        >
          <div className='px-3 py-2'>Date</div>
          <div className='px-3 py-2'>Version</div>
          <div className='px-3 py-2'>Changes</div>
        </div>
        {slice.map((entry, idx) => (
          <div
            key={entry.version}
            className={`grid text-sm ${idx < slice.length - 1 && 'border-b-[2px] border-cream2'}`}
            style={{ gridTemplateColumns: '110px 90px 1fr' }}
          >
            <div className='px-3 py-3 tabular-nums opacity-90'>{entry.date}</div>
            <div className='px-3 py-3 font-semibold text-red3 tabular-nums'>v{entry.version}</div>
            <ul className='px-3 py-3 list-disc list-inside flex flex-col gap-[2px]'>
              {entry.changes.map((c, i) => (
                <li key={i} className='leading-snug'>{c}</li>
              ))}
            </ul>
          </div>
        ))}

        {pageCount > 1 && (
          <div className='flex items-center justify-between gap-2 px-3 py-2 border-t-[2px] border-cream2 text-xs'>
            <span className='opacity-80'>
              Page <strong>{page}</strong> of <strong>{pageCount}</strong>
              {' '}&middot; {CHANGELOG.length} entries
            </span>
            <div className='flex gap-1'>
              <PageLink page={1} disabled={page === 1}>« First</PageLink>
              <PageLink page={page - 1} disabled={page === 1}>‹ Prev</PageLink>
              <PageLink page={page + 1} disabled={page === pageCount}>Next ›</PageLink>
              <PageLink page={pageCount} disabled={page === pageCount}>Last »</PageLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

function PageLink({
  page, disabled, children,
}: {
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const cls = 'general-button px-2 py-[2px] rounded-sm text-xs font-semibold';
  if (disabled) {
    return <span className={`${cls} opacity-40 cursor-not-allowed`}>{children}</span>;
  }
  return (
    <Link href={`/game/changelog?page=${page}`} className={`${cls} hover:brightness-110`}>
      {children}
    </Link>
  );
}
