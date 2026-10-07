"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ugx } from "@/lib/site";
import { fallbackImage } from "@/lib/image-fallback";
import { WhatsAppOrder } from "@/components/whatsapp-order";
import { vendorOrderMessage } from "@/lib/order-message";
import Link from "next/link";

/**
 * Browsing the vendor marketplace.
 *
 * The marketplace rendered one flat grid: fine for six products, unusable at
 * sixty, and with no way to answer the two questions a shopper actually has —
 * "do you have X?" and "what does this seller have?".
 *
 * Search, category, seller and price order are all here, they all narrow the
 * same list, and every one of them says how many products are left so nobody
 * filters their way into an empty page without knowing why.
 */

export type MarketItem = {
  id: number;
  vendor_id: number;
  name: string;
  category: string;
  price_ugx: number;
  description: string;
  image_url: string;
  vendor_name: string;
  vendor_verified?: boolean;
  vendor_phone?: string;
  vendor_email?: string;
};

type Sort = "new" | "price-asc" | "price-desc" | "name";

const SORTS: { v: Sort; label: string }[] = [
  { v: "new", label: "Newest" },
  { v: "price-asc", label: "Price: low to high" },
  { v: "price-desc", label: "Price: high to low" },
  { v: "name", label: "Name A–Z" },
];

export function MarketplaceBrowser({
  items,
  initialVendor = "",
}: {
  items: MarketItem[];
  initialVendor?: string;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [vendor, setVendor] = useState(initialVendor);
  const [sort, setSort] = useState<Sort>("new");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of items) counts.set(i.category || "Other", (counts.get(i.category || "Other") ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const vendors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of items) counts.set(i.vendor_name, (counts.get(i.vendor_name) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items.filter((i) => {
      if (category !== "All" && (i.category || "Other") !== category) return false;
      if (vendor && i.vendor_name !== vendor) return false;
      if (verifiedOnly && !i.vendor_verified) return false;
      if (needle) {
        const hay = `${i.name} ${i.category} ${i.vendor_name} ${i.description}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price_ugx - b.price_ugx);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price_ugx - a.price_ugx);
    else if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else list = [...list].sort((a, b) => b.id - a.id); // newest first
    return list;
  }, [items, q, category, vendor, verifiedOnly, sort]);

  const filtered = category !== "All" || !!vendor || verifiedOnly || q.trim().length > 0;

  function clearAll() {
    setQ("");
    setCategory("All");
    setVendor("");
    setVerifiedOnly(false);
  }

  return (
    <section>
      {/* Search — the first thing anyone reaches for */}
      <div className="sticky top-0 z-20 -mx-1 bg-[#e6e8ef]/95 px-1 py-2 backdrop-blur">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the marketplace…"
              className="w-full rounded-full border border-ink-600/12 bg-white py-2.5 pl-9 pr-9 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-700/40 hover:bg-ink-50 hover:text-ink-700"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            onClick={() => setOpenFilters((v) => !v)}
            className={`press flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-sm font-bold shadow-sm transition sm:hidden ${
              filtered
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-ink-600/12 bg-white text-ink-700"
            }`}
          >
            <SlidersHorizontal size={15} />
            {filtered ? "Filtered" : "Filter"}
          </button>
        </div>

        {/* Category row — always visible, it is how most people browse */}
        <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 no-scrollbar">
          <Chip active={category === "All"} onClick={() => setCategory("All")} label="All" count={items.length} />
          {categories.map(([c, n]) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)} label={c} count={n} />
          ))}
        </div>
      </div>

      {/* Seller, sort and verified — always on from sm up, a drawer on a phone */}
      <div className={`${openFilters ? "block" : "hidden"} mt-2 sm:mt-3 sm:block`}>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-600/10 bg-white p-2.5 shadow-sm">
          <select
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="rounded-lg border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">All sellers</option>
            {vendors.map(([v, n]) => (
              <option key={v} value={v}>
                {v} ({n})
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-lg border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.v} value={s.v}>
                {s.label}
              </option>
            ))}
          </select>

          <label className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-ink-700">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            Verified sellers only
          </label>

          {filtered && (
            <button
              onClick={clearAll}
              className="ml-auto rounded-lg border border-ink-600/20 px-3 py-2 text-xs font-bold text-ink-600 hover:bg-ink-50"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Count — so the list is never silently empty */}
      <p className="mt-3 text-sm text-ink-700/65">
        <b className="text-ink-900">{results.length}</b> product{results.length === 1 ? "" : "s"}
        {filtered ? " match your search" : " from our sellers"}
      </p>

      {results.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-ink-600/20 bg-white p-10 text-center shadow-sm">
          <p className="font-bold text-ink-800">Nothing matches that</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-700/60">
            Try a shorter word, or clear the filters to see everything our sellers have.
          </p>
          <button
            onClick={clearAll}
            className="press mt-4 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            Show everything
          </button>
        </div>
      ) : (
        <div className="mt-3 grid-cards gap-3">
          {results.map((p) => (
            <VendorCard key={p.id} p={p} onVendor={() => setVendor(p.vendor_name)} />
          ))}
        </div>
      )}
    </section>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold shadow-sm transition ${
        active ? "bg-brand-500 text-white" : "bg-white text-ink-700 hover:bg-brand-50"
      }`}
    >
      {label}
      <span className={active ? "ml-1 text-white/70" : "ml-1 text-ink-700/45"}>{count}</span>
    </button>
  );
}

function VendorCard({ p, onVendor }: { p: MarketItem; onVendor: () => void }) {
  return (
    <article className="group card-lift flex h-full flex-col overflow-hidden rounded-lg border border-ink-600/[0.08] bg-white shadow-[var(--shadow-1)]">
      <div className="relative aspect-square bg-white">
        <Link href={`/marketplace/${p.id}`} aria-label={p.name} className="block h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.image_url || fallbackImage(p.name, p.category)}
            alt={p.name}
            loading="lazy"
            className="card-zoom h-full w-full object-contain p-2"
          />
        </Link>
        <span className="absolute left-2 top-2 rounded bg-ink-600/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Vendor
        </span>
        {p.vendor_verified && (
          <span
            title="Verified seller"
            className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm"
          >
            ✓ Verified
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
        <h3 className="clamp-2 min-h-[2.25rem] text-[12.5px] leading-tight text-ink-800 transition-colors group-hover:text-brand-600">
          <Link href={`/marketplace/${p.id}`}>{p.name}</Link>
        </h3>
        {/* Tapping the seller shows the rest of their stock — the question a
            shopper asks the moment they like one thing. */}
        <button
          onClick={onVendor}
          className="mt-0.5 truncate text-left text-[10.5px] text-ink-700/55 hover:text-brand-600 hover:underline"
        >
          by {p.vendor_name} · {p.category}
        </button>
        <p className="mt-1 text-[15px] font-extrabold text-ink-900">{ugx(p.price_ugx)}</p>
        <WhatsAppOrder
          className="mt-2"
          label="Order now"
          brand
          phone={p.vendor_verified && p.vendor_phone ? p.vendor_phone : undefined}
          message={vendorOrderMessage({
            name: p.name,
            priceLabel: ugx(p.price_ugx),
            vendor: p.vendor_name,
            category: p.category,
            url: p.image_url || undefined,
          })}
        />
      </div>
    </article>
  );
}
