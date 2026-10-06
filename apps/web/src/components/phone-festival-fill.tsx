"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ugx } from "@/lib/site";

/**
 * A festival strip that takes up whatever is left of the last row of a grid.
 *
 * The phones panel lists every handset we stock, so its last row is rarely
 * full: one phone, and then five cards' worth of empty teal beside it. This
 * sits in that space instead and sells the range — which series, from how
 * much — with the line-up photographed.
 *
 * A grid cannot be told "span the rest of this row" in CSS alone, so the
 * column count is read from the grid itself and the span worked out from it,
 * again whenever the grid is resized. When the last row happens to be full the
 * strip takes a row of its own. Its layout follows its own width, not the
 * screen's: stacked when it has a card's width, side by side when it has more.
 */

const OFFERS = [
  { series: "iPhone 16 Series", line: "Sealed · 12 months Apple warranty", from: 4_600_000, href: "/shop?cat=Phones&q=iPhone%2016", img: "/promos/iphone-16-series.webp", bg: "bg-ink-700" },
  { series: "iPhone 17", line: "The newest iPhone, in stock now", from: 6_300_000, href: "/shop/iphone-17-256gb", img: "/promos/iphone-17-series.webp", bg: "bg-brand-600" },
  { series: "iPhone 15 Series", line: "USB-C · 48MP camera · titanium Pro", from: 3_650_000, href: "/shop?cat=Phones&q=iPhone%2015", img: "/promos/iphone-15-series.webp", bg: "bg-teal-800" },
  { series: "iPhone 14 Series", line: "Best value — tested and warranted", from: 2_850_000, href: "/shop?cat=Phones&q=iPhone%2014", img: "/promos/iphone-14-series.webp", bg: "bg-green-700" },
];

const ROTATE_MS = 4500;

export function PhoneFestivalFill({ count }: { count: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  // Until the grid has been measured the strip takes a full row, which is
  // always a valid place for it to be.
  const [span, setSpan] = useState<number | null>(null);
  const [i, setI] = useState(0);

  const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
  useIsoLayoutEffect(() => {
    const grid = ref.current?.parentElement;
    if (!grid) return;
    const measure = () => {
      const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
      if (!cols) return;
      const used = count % cols;
      setSpan(used === 0 ? cols : cols - used);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [count]);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % OFFERS.length), ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  const o = OFFERS[i];

  return (
    <Link
      ref={ref}
      href={o.href}
      style={{ gridColumn: span ? `span ${span}` : "1 / -1" }}
      className={`stripes group @container relative flex min-h-[9.5rem] overflow-hidden rounded-lg text-white shadow-sm ring-1 ring-white/15 transition-colors duration-500 ${o.bg}`}
    >
      <div key={i} className="ad-fade flex w-full flex-col @lg:flex-row @lg:items-stretch">
        {/* Words */}
        <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-3.5 @lg:gap-2 @lg:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FCDC04] @lg:text-[11px]">
            Phone Festival
          </p>
          <h3 className="font-display text-lg font-black leading-tight drop-shadow-sm @lg:text-3xl">{o.series}</h3>
          <p className="hidden text-[13px] text-white/85 @lg:block">{o.line}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-tight text-ink-900 shadow-sm @lg:px-4 @lg:py-1.5 @lg:text-sm">
              From {ugx(o.from)}
            </span>
            <span className="press rounded-full bg-[#FCDC04] px-3 py-1 text-[11px] font-extrabold text-ink-900 shadow-sm @lg:px-4 @lg:py-1.5 @lg:text-sm">
              Shop now →
            </span>
          </div>
        </div>

        {/* The line-up itself — under the words when the strip is narrow,
            beside them when it is wide. */}
        <div className="relative min-h-[6rem] flex-1 @lg:min-h-0 @lg:max-w-[55%]">
          <Image
            src={o.img}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 40vw"
            className="object-cover object-center transition duration-700 group-hover:scale-105"
          />
          <span className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-black/35 to-transparent @lg:block" />
        </div>
      </div>

      {/* Which of the four is showing */}
      <span className="absolute bottom-2 left-3.5 z-10 flex gap-1 @lg:left-6">
        {OFFERS.map((x, n) => (
          <span key={x.series} className={`h-1.5 rounded-full transition-all ${n === i ? "w-4 bg-white" : "w-1.5 bg-white/45"}`} />
        ))}
      </span>
    </Link>
  );
}
