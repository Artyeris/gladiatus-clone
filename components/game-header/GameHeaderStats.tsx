import { calculatePower } from '@/lib/utils/characterUtils';
import Image from 'next/image';
import { Swords } from 'lucide-react';
import ProgressBar from '@/components/arena/ProgressBar';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { calculateNextLevelExperience, calculateProgressPercent } from '@/lib/utils';

const GameHeaderStats = ({ character }: { character: CharacterInterface }) => {
  const levelProgress = calculateProgressPercent(character.experience, calculateNextLevelExperience(character.level));

  // Two-column grid so the left column stacks Gold over Honor and the
  // right stacks Diamonds over Power. Level rides the bottom row
  // beside the XP bar.
  return (
    <div className='flex flex-col brown-card w-full h-[75px] drop-shadow-2xl rounded-sm overflow-hidden'>
      <div className='grid grid-cols-2 px-2 py-[2px] text-[11px] font-semibold text-red3 gap-x-3 gap-y-[2px]'>
        <Stat src='/images/crowns.png' alt='gold'  value={character.crowns} />
        <Stat diamond                              value={(character as any).diamonds ?? 0} />
        <Stat src='/images/honor.png'  alt='honor' value={character.honor} />
        <Stat power                                value={calculatePower(character)} />
      </div>
      <div className='border-b-cream2 border-b-[3px] w-full' />
      <div className='flex flex-row gap-2 items-center justify-center w-full px-2 py-[2px] font-semibold text-[11px] text-red3'>
        <Stat src='/images/level.png' alt='level' value={character.level} />
        <div className='flex-1'>
          <ProgressBar progress={levelProgress} />
        </div>
        <span className='text-[10px] tabular-nums w-8 text-right'>
          {Math.round(levelProgress)}%
        </span>
      </div>
    </div>
  )
}

export default GameHeaderStats;

// One key/value chip aligned with consistent icon width + tabular
// numerals so values column-align even when widths vary across rows.
function Stat({
  src, alt, value, diamond, power,
}: {
  src?: string;
  alt?: string;
  value: number | string;
  diamond?: boolean;
  power?: boolean;
}) {
  const label = power ? 'power' : alt;
  return (
    <div className='flex items-center gap-1 min-w-0' title={label}>
      {diamond ? (
        <span
          className='inline-block w-[10px] h-[10px] rounded-[1px] bg-[#7ad0ff] border border-[#3a8fb7] drop-shadow shrink-0'
          aria-label='diamonds'
          title='Diamonds'
        />
      ) : power ? (
        <Swords className='w-3 h-3 shrink-0' aria-label='power' />
      ) : (
        <Image
          src={src!}
          width={11}
          height={11}
          alt={alt!}
          style={{ width: 'auto', height: 'auto' }}
        />
      )}
      <span className='tabular-nums truncate'>{value}</span>
    </div>
  );
}
