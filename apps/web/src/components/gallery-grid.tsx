"use client";

import Image from "next/image";
import { useState } from "react";
import { gallery } from "@/lib/gallery";

export function GalleryGrid() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      {/* Masonry via CSS columns */}
      <div className="columns-2 gap-2 sm:columns-3 lg:columns-4 [&>*]:mb-2">
        {gallery.map((g, i) => (
          <button
            key={g.src}
            onClick={() => setActive(i)}
            className="group block w-full overflow-hidden rounded bg-white shadow-sm"
          >
            <Image
              src={g.src}
              alt={`Online Tech Uganda showcase ${i + 1}`}
              width={g.w}
              height={g.h}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="h-auto w-full transition duration-300 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            ×
          </button>
          <button
            className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-3xl text-white hover:bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              setActive((a) => (a! - 1 + gallery.length) % gallery.length);
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <div className="relative max-h-[88vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={gallery[active].src}
              alt={`Showcase ${active + 1}`}
              width={gallery[active].w}
              height={gallery[active].h}
              className="max-h-[88vh] w-auto rounded object-contain"
            />
          </div>
          <button
            className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-3xl text-white hover:bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              setActive((a) => (a! + 1) % gallery.length);
            }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
