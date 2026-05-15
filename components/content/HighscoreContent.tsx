'use client'

import Link from 'next/link';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import type { HighscorePage } from '@/lib/types/highscore';

interface Props {
  highscore: HighscorePage;
}

const HighscoreContent = ({ highscore }: Props) => {
  const { characters, page, pageSize, total, totalPages } = highscore;
  const startRank = (page - 1) * pageSize;

  return (
    <>
      <h1 className='text-xl font-bold border-b-[3px] border-brown2 text-center text-brown2'>
        Player Highscore
      </h1>
      <Table className='info-card'>
        <TableHeader className='border-[2px] border-brown bg-cream2'>
          <TableRow>
            <TableHead className='text-brown2 font-semibold'>Rank</TableHead>
            <TableHead className='text-brown2 font-semibold'>Name</TableHead>
            <TableHead className='text-brown2 font-semibold'>Level</TableHead>
            <TableHead className='text-brown2 font-semibold'>Honor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(characters as CharacterInterface[]).map((character, index) => (
            <TableRow
              key={character._id}
              className='border-none'
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
            </TableRow>
          ))}
      </TableBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} total={total} />
    </>
  )
}

export default HighscoreContent;

function Pagination({ page, totalPages, total }: { page: number; totalPages: number; total: number }) {
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
      <PageLink page={page - 1} disabled={page <= 1} label='Prev' />
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className='flex items-center gap-1'>
            {gap && <span className='px-1 opacity-60'>...</span>}
            <PageLink page={p} active={p === page} label={String(p)} />
          </span>
        );
      })}
      <PageLink page={page + 1} disabled={page >= totalPages} label='Next' />
    </div>
  );
}

function PageLink({
  page, active = false, disabled = false, label,
}: { page: number; active?: boolean; disabled?: boolean; label: string }) {
  if (disabled) {
    return (
      <span className='px-2 py-1 rounded-sm text-xs opacity-40 cursor-not-allowed'>{label}</span>
    );
  }
  return (
    <Link
      href={`/game/highscore?page=${page}`}
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
