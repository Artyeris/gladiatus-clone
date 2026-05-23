import { formatCompactNumber } from '@/lib/utils';

interface Props {
  value: number;
  className?: string;
}

const CompactNumber = ({ value, className }: Props) => {
  const safe = Number.isFinite(value) ? value : 0;
  return (
    <span className={className} title={safe.toLocaleString()}>
      {formatCompactNumber(safe)}
    </span>
  );
};

export default CompactNumber;
