'use client'

import Link from 'next/link';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import type { HighscorePage, HighscorePeriod } from '@/lib/types/highscore';

interface Props {
  highscore: HighscorePage;
  currentCharacterId?: string;
}

const TABS: { id: HighscorePeriod; label: string }[] = [
  { id: 'all',  label: 'All-time' },
  { id: 'week', label: '7 days' },
];

const HighscoreContent = ({ highscore, currentCharacterId }: Props) => {
  const { characters, page, pageSize, total, totalPages, period } = highscore;
  const startRank = (page - 1) * pageSize;
  const showWeeklyColumn = period === 'week';
  const myId = currentCharacterId ? String(currentCharacterId) : '';

  return (
    <>
      <h1 className='text-xl font-bold border-b-[3px] border-brown2 text-center text-brown2'>
        Player Highscore
      </h1>

      <div className='flex gap-2 px-2 text-sm font-semibold text-brown2'>
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/game/highscore?period=${t.id}`}
            className={`px-4 py-1 border-b-[3px] ${
              period === t.id
                ? 'border-red3 text-red3'
                : 'border-transparent hover:text-red3'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Table className='info-card'>
        <TableHeader className='border-[2px] border-brown bg-cream2'>
          <TableRow>
            <TableHead className='text-brown2 font-semibold'>Rank</TableHead>
            <TableHead className='text-brown2 font-semibold'>Name</TableHead>
            <TableHead className='text-brown2 font-semibold'>Level</TableHead>
            <TableHead className='text-brown2 font-semibold'>Honor</TableHead>
            {showWeeklyColumn && (
              <TableHead className='text-brown2 font-semibold'>Wins (7d)</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {(characters as CharacterInterface[]).map((character, index) => {
            const isMe = myId !== '' && String(character._id) === myId;
            return (
            <TableRow
              key={character._id}
              className={`border-none ${isMe ? 'bg-cream2/60' : ''}`}
            >
              <TableCell className='py-2 text-brown2 font-medium'>{startRank + index + 1}</TableCell>
              <TableCell className='py-2 font-medium'>
                <Link
                  href={`/game/character/${character._id}`}
                  className='text-red3 underline hover:brightness-110'
                >
                  {character.name}
                </Link>
                {(character as any).isBot && (
                  <span className='ml-1 text-[10px] opacity-70 italic text-brown2'>NPC</span>
                )}
              </TableCell>
              <TableCell className='py-2 text-brown2 font-medium'>{character.level}</TableCell>
              <TableCell className='py-2 text-brown2 font-medium'>{character.honor}</TableCell>
              {showWeeklyColumn && (
                <TableCell className='py-2 text-brown2 font-medium'>
                  {(character as any).weeklyWins ?? 0}
                </TableCell>
              )}
            </TableRow>
            );
          })}
          {characters.length === 0 && (
            <TableRow className='border-none'>
              <TableCell colSpan={showWeeklyColumn ? 5 : 4} className='py-3 text-brown2 italic text-center opacity-80'>
                Nobody has won an arena fight in the last 7 days.
              </TableCell>
            </TableRow>
          )}
      </TableBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} total={total} period={period} />
    </>
  )
}

export default HighscoreContent;

function Pagination({ page, totalPages, total, period }: {
  page: number; totalPages: number; total: number; period: HighscorePeriod;
}) {
  if (totalPages <= 1) {
    return (
      <div className='text-xs opacity-70 text-center text-brown2'>
        {total} player{total === 1 ? '' : 's'}.
      </div>
    );
  }

  // Show first, last, current and immediate neighbours; gap with an
  // ellipsis when the run is broken.
  const set = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const pages = Array.from(set)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  return (
    <div className='flex items-center justify-center gap-1 text-sm text-brown2'>
      <PageLink period={period} page={page - 1} disabled={page <= 1} label='Prev' />
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className='flex items-center gap-1'>
            {gap && <span className='px-1 opacity-60'>...</span>}
            <PageLink period={period} page={p} active={p === page} label={String(p)} />
          </span>
        );
      })}
      <PageLink period={period} page={page + 1} disabled={page >= totalPages} label='Next' />
    </div>
  );
}

function PageLink({
  page, period, active = false, disabled = false, label,
}: { page: number; period: HighscorePeriod; active?: boolean; disabled?: boolean; label: string }) {
  if (disabled) {
    return (
      <span className='px-2 py-1 rounded-sm text-xs opacity-40 cursor-not-allowed'>{label}</span>
    );
  }
  return (
    <Link
      href={`/game/highscore?period=${period}&page=${page}`}
      className={`px-2 py-1 rounded-sm text-xs font-semibold border-[2px] ${
        active
          ? 'border-red3 text-red3 bg-cream2/50'
          : 'border-cream2 hover:bg-cream2/50'
      }`}
    >
      {label}
    </Link>
  );
}
