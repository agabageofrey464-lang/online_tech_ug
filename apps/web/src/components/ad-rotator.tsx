"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ugx } from "@/lib/site";

export type AdItem = {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
};

export function AdRotator({ items, intervalMs = 3500 }: { items: AdItem[]; intervalMs?: number }) {
  const [i, setI] = useState(0);
  const n = items.length;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), intervalMs);
    return () => clearInterval(t);
  }, [n, intervalMs]);

  if (n === 0) return null;
  const ad = items[i];
  const discount =
    ad.oldPrice && ad.oldPrice > ad.price
      ? Math.round(((ad.oldPrice - ad.price) / ad.oldPrice) * 100)
      : 0;

  return (
    <Link
      href={`/shop/${ad.slug}`}
      className="group relative flex-1 overflow-hidden rounded bg-brand-600 p-4 text-white shadow-sm"
    >
      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
        🔥 Trending now
      </span>

      {/* Slide */}
      <div key={ad.slug} className="ad-fade mt-2 flex items-center gap-3">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-white">
          <Image
            src={`/products/${ad.slug}.webp`}
            alt={ad.name}
            fill
            sizes="64px"
            className="object-contain p-1"
          />
        </span>
        <div className="min-w-0">
          <p className="clamp-2 text-sm font-extrabold leading-tight">{ad.name}</p>
          <p className="mt-0.5 text-sm font-extrabold">
            {ugx(ad.price)}
            {discount > 0 && (
              <span className="ml-1 rounded bg-white/25 px-1 text-[10px] font-bold">-{discount}%</span>
            )}
          </p>
        </div>
      </div>

      <span className="mt-3 inline-block rounded-md bg-white px-3 py-1.5 text-xs font-bold text-brand-600 group-hover:bg-brand-50">
        Grab this deal →
      </span>

      {/* Dots */}
      <div className="mt-3 flex gap-1">
        {items.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? "w-4 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </Link>
  );
}
