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

// Renders /items/<imageId>.webp by default. If the catalog entry already
// contains a file extension (e.g. "chainmail.png" or "/items/foo.svg"),
// that exact path is used instead. If the request 404s, falls back to a
// stylised placeholder so missing artwork doesn't show a broken-image
// icon or a raw filename. The label is a short, readable hint (alt text).
const ItemImage = ({ imageId, alt, size, fill, sizes, style, className }: Props) => {
  const [errored, setErrored] = useState(false);

  if (errored) {
    // Empty stylised box. Deliberately no `title` attribute so the
    // browser's native tooltip cannot overlap with the surrounding
    // in-game ItemTooltip (which already shows the item name).
    return (
      <div
        className={className}
        style={{
          ...style,
          width: fill ? '100%' : size,
          height: fill ? '100%' : size,
          background: 'linear-gradient(135deg, #5c3a21, #8b5a2b)',
          overflow: 'hidden',
        }}
        aria-label={alt}
      />
    );
  }

  const hasExtension = /\.(webp|png|jpe?g|gif|svg)$/i.test(imageId);
  const src = imageId.startsWith('/')
    ? imageId
    : hasExtension
      ? `/items/${imageId}`
      : `/items/${imageId}.webp`;
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
