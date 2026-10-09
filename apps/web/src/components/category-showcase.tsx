"use client";

import Link from "next/link";
import { useState } from "react";
import { SafeImage } from "@/components/safe-image";

/**
 * "Find what you need" — a centred heading, two tabs, and a row of tall
 * picture tiles that slides sideways: by category, or by brand. Each tile is a
 * photograph, a name in the serif, a line about it and an underlined link.
 *
 * It replaced a row of small category circles on phones and stands under the
 * hero on every screen, so the first thing after the headline is the range.
 */
export type ShowcaseTile = { name: string; href: string; img: string; blurb: string };

export function CategoryShowcase({ categories, brands }: { categories: ShowcaseTile[]; brands: ShowcaseTile[] }) {
  const [tab, setTab] = useState<"category" | "brand">("category");
  const tiles = tab === "category" ? categories : brands;

  return (
    <section aria-label="Shop by category or brand" className="py-6 sm:py-8">
      <div className="mx-auto max-w-xl px-2 text-center">
        <h2 className="text-[28px] leading-tight text-ink-900 sm:text-[36px]">Find What You Need</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-700/80">
          Laptops, phones and everything that goes with them — tested, warranted and delivered countrywide.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          {(
            [
              ["category", "Shop By Category"],
              ["brand", "Shop By Brand"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              aria-pressed={tab === value}
              className={`px-5 py-2.5 text-[14px] transition ${
                tab === value ? "bg-brand-500 font-semibold text-white" : "border border-ink-700/25 bg-white text-ink-800 hover:border-ink-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex snap-x gap-3 overflow-x-auto pb-3 no-scrollbar">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="group w-[62%] shrink-0 snap-start sm:w-[36%] lg:w-[calc((100%-2.25rem)/4)]">
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--tile)]">
              <SafeImage
                src={t.img}
                alt={t.name}
                fill
                sizes="(max-width: 640px) 62vw, (max-width: 1024px) 36vw, 24vw"
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <h3 className="mt-4 text-[21px] leading-tight text-ink-900">{t.name}</h3>
            <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-ink-700/80">{t.blurb}</p>
            <span className="mt-3 inline-block text-[14px] text-ink-800 underline underline-offset-4 group-hover:text-brand-600">
              Shop Now
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
