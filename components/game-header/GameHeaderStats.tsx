import { calculatePower } from '@/lib/utils/characterUtils';
import Image from 'next/image';
import { Swords } from 'lucide-react';
import ProgressBar from '@/components/arena/ProgressBar';
import DiamondIcon from '@/components/shared/DiamondIcon';
import CompactNumber from '@/components/shared/CompactNumber';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import {
  calculateNextLevelExperience,
  calculateProgressPercent,
} from '@/lib/utils';

const GameHeaderStats = ({ character }: { character: CharacterInterface }) => {
  const levelProgress = calculateProgressPercent(character.experience, calculateNextLevelExperience(character.level));

  // Two-column grid so the left column stacks Gold over Honor and the
  // right stacks Diamonds over Power. The XP bar rides the bottom row
  // -- the level chip on the left and the percent label on the right
  // share the same fixed width so the progress bar visually centres
  // on the row's midline.
  return (
    <div className='flex flex-col brown-card w-full h-[75px] drop-shadow-2xl rounded-sm overflow-hidden'>
      <div className='grid grid-cols-2 px-2 py-[2px] text-[11px] font-semibold text-red3 gap-x-3 gap-y-[2px]'>
        <Stat src='/images/crowns.png' alt='gold'  value={character.crowns} />
        <Stat diamond                              value={(character as any).diamonds ?? 0} />
        <Stat src='/images/honor.png'  alt='honor' value={character.honor} />
        <Stat power                                value={calculatePower(character)} />
      </div>
      <div className='border-b-cream2 border-b-[3px] w-full' />
      <div className='flex flex-row gap-2 items-center w-full px-2 py-[2px] font-semibold text-[11px] text-red3'>
        <div className='w-12 shrink-0'>
          <Stat src='/images/level.png' alt='level' value={character.level} />
        </div>
        <div className='flex-1'>
          <ProgressBar progress={levelProgress} />
        </div>
        <span
          className='text-[10px] tabular-nums w-12 text-right shrink-0'
          title={`${character.experience.toLocaleString()} / ${calculateNextLevelExperience(character.level).toLocaleString()} XP`}
        >
          {Math.round(levelProgress)}%
        </span>
      </div>
    </div>
  )
}

export default GameHeaderStats;

// One key/value chip aligned with consistent icon width + tabular
// numerals so values column-align even when widths vary across rows.
// Numeric values get the compact (k / mil / bil) formatter; hover
// shows the full integer via the wrapped CompactNumber's title.
function Stat({
  src, alt, value, diamond, power,
}: {
  src?: string;
  alt?: string;
  value: number;
  diamond?: boolean;
  power?: boolean;
}) {
  const label = power ? 'power' : alt;
  return (
    <div className='flex items-center gap-1 min-w-0' title={label}>
      {diamond ? (
        <DiamondIcon size={11} title='Diamonds' className='shrink-0' />
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
      <CompactNumber value={value} className='tabular-nums truncate' />
    </div>
  );
}
