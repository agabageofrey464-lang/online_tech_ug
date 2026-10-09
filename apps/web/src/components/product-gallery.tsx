"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { SafeImage } from "@/components/safe-image";

/**
 * A product's photographs as a grid of four large tiles — everything we have
 * of the product on the page at once, rather than one picture with thumbnails
 * to click through.
 *
 * Most products have one, two or three photographs. The remaining tiles are
 * close-ups of the main photograph — the same picture, enlarged on a different
 * part each time — so the grid is always full and a shopper can study the
 * detail. They are labelled as close-ups; nothing is shown that is not the
 * product's own picture.
 *
 * Each tile sits on a different ground — sand, white, a pale brown, a pale
 * orange — so the four read as four views rather than one picture repeated.
 * Only the ground changes. The photograph itself is never recoloured: a tile
 * that tinted a silver laptop blue would be showing a product we do not sell.
 *
 * Clicking a tile opens that view large. From there the arrows, the keyboard
 * or the strip of small views move from one to the next.
 */

const TILES = 4;

/** The ground behind each tile, in order. */
const GROUNDS = ["bg-[var(--tile)]", "bg-white", "bg-ink-50", "bg-brand-50"];

/** Where each close-up looks: the enlargement, and the corner it grows from. */
const CLOSE_UPS = [
  { scale: 1.9, origin: "50% 45%" },
  { scale: 2.3, origin: "28% 30%" },
  { scale: 2.3, origin: "72% 68%" },
];

type Tile = { src: string; closeUp?: (typeof CLOSE_UPS)[number] };

const zoom = (t: Tile) => (t.closeUp ? { transform: `scale(${t.closeUp.scale})`, transformOrigin: t.closeUp.origin } : undefined);

export function ProductGallery({
  images,
  alt,
  children,
}: {
  images: string[];
  alt: string;
  children?: React.ReactNode; // badges overlay, on the first tile
}) {
  const photos = (images.length > 0 ? images : ["/products/placeholder.webp"]).slice(0, TILES);
  const tiles: Tile[] = [
    ...photos.map((src) => ({ src })),
    ...CLOSE_UPS.slice(0, TILES - photos.length).map((closeUp) => ({ src: photos[0], closeUp })),
  ];
  const count = tiles.length;

  const [open, setOpen] = useState<number | null>(null);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  const label = (t: Tile, i: number) => (t.closeUp ? `${alt} — close-up` : i === 0 ? alt : `${alt} — view ${i + 1}`);
  const shown = open === null ? null : tiles[open];

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {tiles.map((t, i) => (
          <div
            key={`${t.src}-${i}`}
            role="button"
            tabIndex={0}
            onClick={() => setOpen(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(i);
              }
            }}
            aria-label={`Open ${label(t, i)}`}
            className={`group/tile relative aspect-[6/5] cursor-zoom-in overflow-hidden ${GROUNDS[i % GROUNDS.length]}`}
          >
            <SafeImage
              src={t.src}
              alt={label(t, i)}
              fill
              sizes="(max-width: 1024px) 50vw, 29vw"
              priority={i === 0}
              className={`object-contain mix-blend-multiply ${t.closeUp ? "p-0 contrast-[1.06] saturate-[1.08]" : "p-4 sm:p-7"}`}
              style={zoom(t)}
            />
            {t.closeUp && (
              <span className="absolute bottom-2 left-2 bg-white/85 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-800">
                Close-up
              </span>
            )}
            <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow-sm transition group-hover/tile:opacity-100">
              <ZoomIn size={16} strokeWidth={1.5} />
            </span>
            {i === 0 && children}
          </div>
        ))}
      </div>

      {shown && open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[100] flex flex-col bg-[var(--background)]"
          onClick={() => setOpen(null)}
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="font-display text-[18px] text-ink-900">
              {open + 1} of {count}
            </p>
            <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="rounded-full p-2 text-ink-900 hover:bg-ink-50">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          <div
            className={`relative mx-3 flex-1 overflow-hidden sm:mx-16 ${GROUNDS[open % GROUNDS.length]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <SafeImage
              key={`${shown.src}-${open}`}
              src={shown.src}
              alt={label(shown, open)}
              fill
              sizes="100vw"
              className="object-contain p-3 mix-blend-multiply sm:p-8"
              style={zoom(shown)}
            />
          </div>

          <button
            type="button"
            aria-label="Previous view"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white p-2.5 text-ink-900 shadow-md sm:left-4"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Next view"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white p-2.5 text-ink-900 shadow-md sm:right-4"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>

          {/* The views as a strip: tap one to switch to it. */}
          <div className="flex justify-center gap-2 px-4 py-4" onClick={(e) => e.stopPropagation()}>
            {tiles.map((t, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setOpen(i)}
                aria-label={`Show ${label(t, i)}`}
                aria-current={i === open}
                className={`relative h-14 w-14 overflow-hidden border-2 sm:h-16 sm:w-16 ${GROUNDS[i % GROUNDS.length]} ${
                  i === open ? "border-ink-900" : "border-transparent"
                }`}
              >
                <SafeImage src={t.src} alt="" fill sizes="64px" className="object-contain p-1 mix-blend-multiply" style={zoom(t)} />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
