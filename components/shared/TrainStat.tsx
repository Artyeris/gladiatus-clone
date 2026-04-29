'use client'

import Image from 'next/image';

interface TrainStatProps {
  statName: string;
  statValue: number;
  last?: boolean;
  characterCrowns: number;
  crownsValue: number;
  handleClick: () => void;
  disabled?: boolean;
  isPending?: boolean;
}

const TrainStat = ({
  statName,
  statValue,
  characterCrowns,
  handleClick,
  crownsValue,
  disabled = false,
  isPending = false,
  last = false,
}: TrainStatProps) => {
  const canTrain = characterCrowns >= crownsValue && !disabled;

  return (
    <div className={`training-stat-row ${!last ? 'training-stat-row-bordered' : ''}`}>
      <div className="training-stat-name">
        <span>{statName}</span>
        <div className="training-stat-bar">
          <span style={{ width: `${Math.min(statValue * 5, 100)}%` }} />
        </div>
      </div>

      <span className="training-stat-value">{statValue}</span>

      <div className="training-stat-cost">
        {crownsValue}
        <Image src="/images/crowns.png" width={12} height={12} alt="crowns" />
      </div>

      <button
        type="button"
        className="training-stat-button"
        disabled={!canTrain}
        onClick={handleClick}
        aria-label={`Train ${statName}`}
      >
        <Image
          src="/images/train-stat.jpg"
          width={25}
          height={25}
          alt=""
          className={!canTrain ? 'training-stat-button-disabled' : ''}
        />
        {isPending && <span className="training-stat-spinner" />}
      </button>
    </div>
  )
};

export default TrainStat;
