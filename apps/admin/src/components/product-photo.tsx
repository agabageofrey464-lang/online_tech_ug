"use client";

import { useEffect, useState } from "react";

/**
 * A product picture that admits when it has nothing to show. A product whose
 * file is missing would otherwise draw the browser's broken-image icon, which
 * reads as the admin being broken rather than the photo being absent.
 */
export function ProductPhoto({
  src,
  alt,
  className = "",
  emptyLabel = "No photo",
}: {
  src: string;
  alt: string;
  className?: string;
  emptyLabel?: string;
}) {
  const [failed, setFailed] = useState(false);
  // A new upload replaces the address, and deserves a fresh attempt.
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-ink-50 text-center text-[11px] font-medium text-ink-600/40 ${className}`}>
        {emptyLabel}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`bg-white object-contain ${className}`} />
  );
}
