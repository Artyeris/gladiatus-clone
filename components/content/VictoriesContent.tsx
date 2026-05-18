import { CharacterInterface } from '@/lib/interfaces/character.interface';
import {
  CATEGORY_LABELS,
  VICTORIES,
  VictoryCategory,
  VictoryProgress,
  evaluateVictory,
  totalVictoryPoints,
} from '@/lib/utils/victories';

interface Props {
  character: CharacterInterface;
}

const CATEGORY_ORDER: VictoryCategory[] = [
  'general',
  'items',
  'guild',
  'trade',
  'arena',
  'circus',
  'dungeons',
  'underworld',
];

const VictoriesContent = ({ character }: Props) => {
  const totalPoints = totalVictoryPoints(character);
  const maxPoints = VICTORIES.reduce(
    (sum, v) => sum + v.tiers.reduce((s, t) => s + t.points, 0),
    0
  );
  const percent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <div className='flex gap-2'>
        <Tab href='/game/overview' label='Overview' />
        <Tab href='/game/statistics' label='Statistics' />
        <Tab href='/game/victories' label='Victories' active />
      </div>

      <div className='brown-card rounded-sm flex justify-between items-center px-3 py-2 text-sm'>
        <span className='font-semibold'>Total achievement</span>
        <span className='font-semibold text-red3'>
          {totalPoints} / {maxPoints} ({percent}%)
        </span>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const list = VICTORIES.filter((v) => v.category === category);
        if (!list.length) return null;
        return (
          <div key={category} className='flex flex-col'>
            <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>
              {CATEGORY_LABELS[category]}
            </div>
            <div className='brown-card rounded-sm flex flex-col text-sm'>
              {list.map((v, idx) => (
                <VictoryRow
                  key={v.id}
                  result={evaluateVictory(character, v)}
                  last={idx === list.length - 1}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VictoriesContent;

function Tab({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <a
      href={href}
      className={`px-8 py-1 rounded-sm font-semibold text-sm transition ${
        active ? 'text-cream2 cursor-default' : 'text-brown2 hover:text-red3'
      }`}
      style={{
        background: active ? '#974342' : '#b59964',
        border: '2px solid #eed7a1',
        outline: `2px solid ${active ? '#974342' : '#b59964'}`,
      }}
    >
      {label}
    </a>
  );
}

function VictoryRow({ result, last }: { result: VictoryProgress; last: boolean }) {
  const { victory, progress, nextTier, pointsEarned, highestTierReached } = result;

  const targetText = nextTier
    ? `${progress} / ${nextTier.target}`
    : highestTierReached
      ? `${progress} (max)`
      : `${progress}`;

  return (
    <div
      className={`flex justify-between items-start gap-3 px-3 py-2 ${!last && 'border-b-[2px] border-cream2'}`}
    >
      <div className='flex flex-col flex-1 min-w-0'>
        <span className='font-semibold'>{victory.name}</span>
        <span className='text-xs opacity-80'>{victory.description}</span>
      </div>
      <div className='flex flex-col items-end shrink-0 text-xs'>
        <span className='font-semibold text-red3'>{targetText}</span>
        <span className='opacity-80'>{pointsEarned} pt</span>
      </div>
    </div>
  );
}
