"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SafeImage } from "@/components/safe-image";

export type ShopTile = { name: string; img: string };

/**
 * The top of the shop: breadcrumb, the page's name, a line about it, and a
 * rail of the categories — each a photograph with its name beneath.
 *
 * These read the query string, and reading it on the server made the whole
 * page render per request: /shop could never be cached, so every visitor
 * waited for a function to start in Stockholm, call the API and render ~200
 * products — about a second before anything appeared, against 0.4s for the
 * cached home page.
 *
 * The grid already filters from the query string in the browser, so the
 * heading doing the same costs nothing and lets the page itself be static.
 * Filtered views were never meant to be indexed separately anyway — they
 * already declare /shop as their canonical.
 */
export function ShopHeading({ stats, tiles }: { stats: string[]; tiles: ShopTile[] }) {
  const params = useSearchParams();
  const cat = params.get("cat") ?? "";
  const brand = params.get("brand") ?? "";
  const q = params.get("q") ?? "";
  const deals = params.get("deals") === "1" || params.get("deals") === "true";
  const isNew = params.get("sort") === "new";
  const rail = useRef<HTMLDivElement | null>(null);
  // An arrow shows only while there is something that way to slide to.
  const [ends, setEnds] = useState({ start: true, end: false });
  const measure = () => {
    const el = rail.current;
    if (el) setEnds({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  useEffect(measure, [tiles.length]);

  const title = q
    ? `Search: “${q}”`
    : brand || cat || (deals ? "Reduced Prices" : isNew ? "New Arrivals" : "Computers & Accessories");
  const isFiltered = Boolean(q || brand || cat || deals || isNew);

  const slide = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });
  const arrow =
    "absolute top-[38%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink-900 shadow-md ring-1 ring-ink-700/10 transition hover:bg-brand-500 hover:text-white lg:flex";
  const tile = "group block w-[42%] shrink-0 snap-start sm:w-[28%] lg:w-[calc((100%-5rem)/6)]";
  const label = "mt-3 text-center font-sans text-[11.5px] font-semibold uppercase tracking-[0.18em] group-hover:text-brand-600 sm:text-[12.5px]";

  return (
    <>
      <div className="mb-4 mt-1">
        <Breadcrumbs items={isFiltered ? [{ label: "Shop", href: "/shop" }, { label: title }] : [{ label: "Shop" }]} />
      </div>

      <h1 className="text-[30px] leading-[1.15] text-ink-900 sm:text-[40px]">{isFiltered ? title : "The Online Tech Collection"}</h1>
      <p className="mt-3 max-w-4xl text-[15px] leading-relaxed text-ink-800 sm:text-[17px]">
        {isFiltered
          ? `${title} at Online Tech Uganda — quality-checked, with warranty and countrywide delivery.`
          : "Genuine laptops, phones and accessories. Tested, warranted and delivered countrywide."}{" "}
        {/* Not everyone knows what specs they need — many know only what they can spend. */}
        <Link href="/find" className="whitespace-nowrap font-semibold text-brand-600 underline underline-offset-4 hover:text-brand-700">
          Not sure which one? Tell us your budget ›
        </Link>
      </p>
      <p className="mt-2 text-[12.5px] text-ink-700/70">{stats.join("  ·  ")}</p>

      {/* The categories, as a rail to slide through. */}
      <div className="relative mb-6 mt-6">
        <button type="button" aria-label="Earlier categories" onClick={() => slide(-1)} className={`${arrow} left-3 ${ends.start ? "lg:hidden" : ""}`}>
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <button type="button" aria-label="More categories" onClick={() => slide(1)} className={`${arrow} right-3 ${ends.end ? "lg:hidden" : ""}`}>
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
        <div ref={rail} onScroll={measure} className="flex snap-x gap-4 overflow-x-auto no-scrollbar">
          <Link href="/shop?sort=new" className={tile}>
            <div className="flex aspect-[4/3] flex-col items-center justify-center border border-ink-700/15 bg-white px-3 text-center">
              <span className="font-display text-[30px] leading-none text-ink-900 sm:text-[36px]">New In</span>
              <span className="mt-2 font-display text-[16px] leading-tight text-ink-800 sm:text-[18px]">Just arrived at the shop</span>
            </div>
            <p className={`${label} ${isNew ? "text-brand-600" : "text-ink-900"}`}>
              See what is new <span aria-hidden>›</span>
            </p>
          </Link>
          {tiles.map((t) => (
            <Link key={t.name} href={`/shop?cat=${encodeURIComponent(t.name)}`} className={tile}>
              <div className={`relative aspect-[4/3] overflow-hidden bg-white ${cat === t.name ? "ring-2 ring-brand-500" : ""}`}>
                <SafeImage
                  src={t.img}
                  alt={t.name}
                  fill
                  sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 16vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <p className={`${label} ${cat === t.name ? "text-brand-600" : "text-ink-900"}`}>
                {t.name} <span aria-hidden>›</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
