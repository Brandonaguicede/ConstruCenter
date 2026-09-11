import { useState, type ImgHTMLAttributes } from 'react';

/** Keep catalog layouts stable when an uploaded image is missing or unavailable. */
export function CatalogImage({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSource, setFailedSource] = useState<string>();
  const unavailable = !src || src === failedSource;

  return (
    <img
      {...props}
      src={unavailable ? '/image-unavailable.svg' : src}
      alt={unavailable ? 'Imagen no disponible' : alt}
      onError={() => { if (!unavailable) setFailedSource(src); }}
    />
  );
}
