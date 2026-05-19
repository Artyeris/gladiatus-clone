// Small diamond-shaped premium-currency glyph, drawn inline so it can
// share the exact same colour and silhouette across the header chip,
// the shop Restock button, dev grant buttons and toasts.
//
// Props let callers tune the size in pixels; the gem keeps a 4:5
// (width:height) silhouette, which reads more like a diamond than a
// rotated square.

interface Props {
  size?: number;
  className?: string;
  title?: string;
}

const DiamondIcon = ({ size = 12, className, title }: Props) => {
  const w = size;
  const h = Math.round(size * 1.25);
  return (
    <svg
      width={w}
      height={h}
      viewBox='0 0 16 20'
      xmlns='http://www.w3.org/2000/svg'
      role='img'
      aria-label={title ?? 'diamond'}
      className={className}
    >
      {title && <title>{title}</title>}
      {/* Top facets */}
      <polygon points='0,6 4,1 12,1 16,6' fill='#9bd6f5' />
      <polygon points='4,1 8,0 12,1 8,6' fill='#dcefff' />
      <polygon points='0,6 8,6 4,1' fill='#7bbfe2' />
      <polygon points='16,6 8,6 12,1' fill='#7bbfe2' />
      {/* Body */}
      <polygon points='0,6 16,6 8,20' fill='#5aa9d3' />
      <polygon points='0,6 8,6 8,20' fill='#79c0e0' />
      {/* Highlight stripe */}
      <polygon points='5,2 7,2 4,5.5' fill='#ffffff' opacity='0.85' />
      {/* Outline */}
      <polygon
        points='0,6 4,1 12,1 16,6 8,20'
        fill='none'
        stroke='#2a6c8f'
        strokeWidth='0.6'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default DiamondIcon;
