'use client';

import Image from 'next/image';
import { CSSProperties, useState } from 'react';

interface Props {
  imageId: string;
  alt: string;
  size?: number;
  fill?: boolean;
  sizes?: string;
  style?: CSSProperties;
  className?: string;
}

// Renders /items/<imageId>.webp; if it 404s, falls back to a stylised
// placeholder so missing artwork doesn't show a broken-image icon or a
// raw filename. The label is a short, readable hint (the alt text).
const ItemImage = ({ imageId, alt, size, fill, sizes, style, className }: Props) => {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={className}
        style={{
          ...style,
          width: fill ? '100%' : size,
          height: fill ? '100%' : size,
          background: 'linear-gradient(135deg, #5c3a21, #8b5a2b)',
          color: '#f4eac8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2px',
          fontSize: '9px',
          fontWeight: 600,
          lineHeight: 1.05,
          overflow: 'hidden',
        }}
        title={alt}
      >
        {alt}
      </div>
    );
  }

  const src = `/items/${imageId}.webp`;
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        style={style}
        className={className}
        onError={() => setErrored(true)}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size ?? 36}
      height={size ?? 36}
      style={style}
      className={className}
      onError={() => setErrored(true)}
    />
  );
};

export default ItemImage;
