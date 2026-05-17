import { calculatePower } from '@/lib/utils/characterUtils';
import Image from 'next/image';
import ProgressBar from '@/components/arena/ProgressBar';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { calculateNextLevelExperience, calculateProgressPercent } from '@/lib/utils';

const GameHeaderStats = ({ character }: { character: CharacterInterface }) => {
  const levelProgress = calculateProgressPercent(character.experience, calculateNextLevelExperience(character.level));

  return (
    <div className='flex flex-col brown-card w-full h-[75px] drop-shadow-2xl rounded-sm overflow-hidden'>
      <div className='grid grid-cols-3 px-3 py-[3px] text-sm font-semibold text-red3 gap-2'>
        <Stat src='/images/crowns.png'      alt='gold'  value={character.crowns} />
        <Stat diamond                                     value={(character as any).diamonds ?? 0} />
        <Stat src='/images/power-rank.png'  alt='power' value={calculatePower(character)} />
      </div>
      <div className='border-b-cream2 border-b-[3px] w-full' />
      <div className='grid grid-cols-3 px-3 py-[3px] text-sm font-semibold text-red3 gap-2'>
        <Stat src='/images/honor.png' alt='honor' value={character.honor} />
        <Stat src='/images/level.png' alt='level' value={character.level} />
        <span />
      </div>
      <div className='border-b-cream2 border-b-[3px] w-full' />
      <div className='flex flex-row gap-2 items-center justify-center w-full px-3 py-[3px] font-semibold text-sm text-red3'>
        <ProgressBar progress={levelProgress} />
        <span className='text-xs tabular-nums w-9 text-right'>
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
  src, alt, value, diamond,
}: {
  src?: string;
  alt?: string;
  value: number | string;
  diamond?: boolean;
}) {
  return (
    <div className='flex items-center gap-1.5 min-w-0' title={alt}>
      {diamond ? (
        <span
          className='inline-block w-[12px] h-[12px] rounded-[1px] bg-[#7ad0ff] border border-[#3a8fb7] drop-shadow shrink-0'
          aria-label='diamonds'
          title='Diamonds'
        />
      ) : (
        <Image
          src={src!}
          width={13}
          height={13}
          alt={alt!}
          style={{ width: 'auto', height: 'auto' }}
        />
      )}
      <span className='tabular-nums truncate'>{value}</span>
    </div>
  );
}
