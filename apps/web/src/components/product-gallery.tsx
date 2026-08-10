"use client";

import { useState } from "react";
import { SafeImage } from "@/components/safe-image";

export function ProductGallery({
  images,
  alt,
  children,
}: {
  images: string[];
  alt: string;
  children?: React.ReactNode; // badges overlay
}) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : ["/products/placeholder.webp"];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-2 sm:flex-col">
          {list.map((src, i) => (
            <button
              key={src}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`View ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition ${
                i === active ? "border-brand-500" : "border-ink-600/10 hover:border-brand-300"
              }`}
            >
              <SafeImage src={src} alt={`${alt} view ${i + 1}`} fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative aspect-[4/3] max-h-[420px] flex-1 overflow-hidden rounded-card bg-white shadow-sm">
        <SafeImage
          src={list[active]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          priority
          className="object-contain p-1"
        />
        {children}
      </div>
    </div>
  );
}
