'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import type { ReportRow, ReportCategory } from '@/lib/types/battleReport';
import {
  deleteAllBattleReports,
  deleteBattleReport,
} from '@/lib/actions/battle/listBattleReports.action';

interface Props {
  reports: ReportRow[];
}

const TABS: { id: ReportCategory; label: string }[] = [
  { id: 'expedition', label: 'Expeditions' },
  { id: 'arena',      label: 'Arena' },
];

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString();
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ReportsContent = ({ reports }: Props) => {
  const router = useRouter();
  const [tab, setTab] = useState<ReportCategory>('expedition');
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () => reports.filter((r) => r.category === tab),
    [reports, tab],
  );

  const onDelete = async (id: string) => {
    setBusy(true);
    const res = await deleteBattleReport({ id });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    router.refresh();
  };

  const onDeleteAll = async () => {
    if (filtered.length === 0) return;
    if (!confirm(`Delete all ${filtered.length} ${tab} report${filtered.length === 1 ? '' : 's'}?`)) return;
    setBusy(true);
    const res = await deleteAllBattleReports({ category: tab });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Deleted ${res.deleted ?? 0} reports`);
    router.refresh();
  };

  const grouped = useMemo(() => {
    const out = new Map<string, ReportRow[]>();
    for (const row of filtered) {
      const k = dayKey(row.createdAt);
      const list = out.get(k) ?? [];
      list.push(row);
      out.set(k, list);
    }
    return Array.from(out.entries());
  }, [filtered]);

  return (
    <div className='px-6 flex flex-col gap-3 text-brown2'>
      <div className='flex gap-2'>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1 border-b-[3px] font-semibold text-sm ${
              tab === t.id
                ? 'border-red3 text-red3'
                : 'border-transparent hover:text-red3'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>
          Battle reports
        </div>
        {grouped.length === 0 && (
          <div className='px-3 py-3 italic opacity-80'>No reports yet.</div>
        )}
        {grouped.map(([day, rows]) => {
          const totalCrowns = rows.reduce((s, r) => s + (r.crownsDrop ?? 0), 0);
          return (
            <div key={day} className='flex flex-col'>
              <div className='flex justify-between items-center bg-brown2/10 px-3 py-1 font-semibold'>
                <span>{day}</span>
                <span className='flex items-center gap-1 text-red3'>
                  Loot: {totalCrowns}
                  <Image src='/images/crowns.png' width={12} height={12} alt='' style={{ width: 'auto', height: 'auto' }} />
                </span>
              </div>
              {rows.map((row) => (
                <div
                  key={row._id}
                  className='flex items-center gap-3 px-3 py-1 border-b-[2px] border-cream2 last:border-b-0'
                >
                  <span className='opacity-70 w-12 text-xs'>{timeOf(row.createdAt)}</span>
                  <span
                    className={`flex-1 font-semibold ${
                      row.isDraw ? 'text-brown2' : row.isWinner ? 'text-red3' : 'text-stone-500'
                    }`}
                  >
                    {row.opponentName}
                    {row.isDraw && <span className='ml-2 text-[10px] opacity-70'>(draw)</span>}
                    {!row.isDraw && !row.isWinner && <span className='ml-2 text-[10px] opacity-70'>(defeat)</span>}
                  </span>
                  <span className='flex items-center gap-1'>
                    {row.crownsDrop}
                    <Image src='/images/crowns.png' width={12} height={12} alt='' style={{ width: 'auto', height: 'auto' }} />
                  </span>
                  <Link
                    href={`/game/battle/${row._id}`}
                    className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110'
                  >
                    Details
                  </Link>
                  <button
                    type='button'
                    onClick={() => onDelete(row._id)}
                    disabled={busy}
                    className='general-button px-2 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
                    aria-label='Delete report'
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {filtered.length > 0 && (
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={onDeleteAll}
            disabled={busy}
            className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
          >
            Delete all {tab} ({filtered.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsContent;
