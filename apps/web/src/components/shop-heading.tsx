"use client";

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
      <div className="mb-3">
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

      <section className="band-light mb-3 overflow-hidden">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-extrabold sm:text-2xl">
              {isFiltered ? title : <>💻 Computers &amp; Accessories</>}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/80">
              {isFiltered
                ? `Browse ${title} at Online Tech Uganda — quality-checked, warranty & countrywide delivery.`
                : "Genuine laptops, desktops, components & accessories — quality-checked, with delivery and flexible payments."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.map((s) => (
              <span
                key={s}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
