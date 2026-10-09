"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";

/**
 * The shop's breadcrumb and category banner.
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
export function ShopHeading({ stats }: { stats: string[] }) {
  const params = useSearchParams();
  const cat = params.get("cat") ?? "";
  const brand = params.get("brand") ?? "";
  const q = params.get("q") ?? "";
  const deals = params.get("deals") === "1" || params.get("deals") === "true";
  const isNew = params.get("sort") === "new";

  const title = q
    ? `Search: “${q}”`
    : brand || cat || (deals ? "Reduced Prices" : isNew ? "New Arrivals" : "Computers & Accessories");
  const isFiltered = Boolean(q || brand || cat || deals || isNew);

  return (
    <>


      <section className="relative overflow-hidden bg-ink-800 text-white">
        <Image src="/hero/shop-floor.webp" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink-900/55" />
        <div className="relative flex min-h-[230px] flex-col items-center justify-center px-5 py-8 text-center sm:min-h-[330px]">
          <h1 className="text-[34px] leading-[1.1] sm:text-[52px]">{isFiltered ? title : "The Online Tech Collection"}</h1>
          <p className="mt-3 max-w-2xl text-[16px] text-white/95 sm:text-[18px]">
            {isFiltered
              ? `${title} at Online Tech Uganda — quality-checked, with warranty and countrywide delivery.`
              : "Genuine laptops, phones and accessories. Tested, warranted and delivered countrywide."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {stats.map((st) => (
              <span key={st} className="bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/25">
                {st}
              </span>
            ))}
          </div>
        </div>
      </section>
      <div className="my-3">
        <Breadcrumbs
          items={
            isFiltered
              ? [{ label: "Shop", href: "/shop" }, { label: title }]
              : [{ label: "Shop" }]
          }
        />
      </div>
      {/* Not everyone knows what specs they need — many shoppers know only what
          they can spend, so offer that route before the grid. */}
      <Link
        href="/find"
        className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-brand-200 bg-brand-50 p-4 transition hover:shadow-md"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-lg text-white">
            🔎
          </span>
          <span>
            <span className="block font-extrabold text-ink-900">
              Not sure which one? Tell us your budget
            </span>
            <span className="block text-sm text-ink-700/70">
              We&apos;ll show what genuinely fits — and say so if it doesn&apos;t.
            </span>
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white">
          Find my laptop →
        </span>
      </Link>
    </>
  );
}
