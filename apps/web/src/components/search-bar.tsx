"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { thumb } from "@/lib/thumb";
import { ugx } from "@/lib/site";

/**
 * The site search, with suggestions as you type.
 *
 * It used to be a box and a button: type a word, press Search, land on the
 * shop and find out whether we stock it. Now the matching products appear
 * under the box while you type — picture, name and price — so "do you have a
 * ThinkPad" is answered in three letters, and one tap opens the product.
 *
 * The catalogue is fetched once, the first time the box is focused, and
 * filtered in the browser; nothing is sent to a server per keystroke.
 */

type Item = { slug: string; name: string; category: string; brand: string; price_ugx: number; image_url: string; in_stock: boolean };

let catalogue: Promise<Item[]> | null = null;
const loadCatalogue = () =>
  (catalogue ??= fetch("/api/catalog")
    .then((r) => (r.ok ? r.json() : { items: [] }))
    .then((d) => (Array.isArray(d) ? d : (d.items ?? [])) as Item[])
    .catch(() => []));

const MAX = 6;

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  // Close when the visitor clicks or taps anywhere else.
  useEffect(() => {
    const away = (e: MouseEvent | TouchEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("touchstart", away);
    };
  }, []);

  const term = q.trim().toLowerCase();
  const { matches, categories, total } = useMemo(() => {
    if (term.length < 2) return { matches: [] as Item[], categories: [] as string[], total: 0 };
    const words = term.split(/\s+/);
    const hit = (p: Item) => {
      const text = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
      return words.every((w) => text.includes(w));
    };
    const found = items.filter(hit);
    // Things we can sell today first, then names that start with what was typed.
    found.sort(
      (a, b) =>
        Number(b.in_stock) - Number(a.in_stock) ||
        Number(b.name.toLowerCase().startsWith(term)) - Number(a.name.toLowerCase().startsWith(term)),
    );
    const cats = [...new Set(items.map((p) => p.category))].filter((c) => c.toLowerCase().includes(term));
    return { matches: found.slice(0, MAX), categories: cats.slice(0, 2), total: found.length };
  }, [items, term]);

  const showPanel = open && term.length >= 2;
  const all = term ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop";

  function go(href: string) {
    setOpen(false);
    setActive(-1);
    // Opening a product ends the search; a results page keeps the words in the box.
    if (!href.includes("?q=")) setQ("");
    router.push(href);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    go(active >= 0 && matches[active] ? `/shop/${matches[active].slug}` : all);
  }

  function onKey(e: React.KeyboardEvent) {
    if (!showPanel) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={box} className="relative w-full">
      {/* Pill-shaped search: magnifier sits inside the field, action button
          rides flush inside the right edge. */}
      <form onSubmit={submit} className={`flex w-full items-center gap-2 rounded-full bg-white p-1 pl-4 ${className}`}>
        <Search size={18} strokeWidth={2.2} className="shrink-0 text-ink-700/40" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => {
            setOpen(true);
            void loadCatalogue().then(setItems);
          }}
          onKeyDown={onKey}
          placeholder="Search products, brands and categories"
          className="w-full min-w-0 bg-transparent py-1.5 text-sm text-ink-900 outline-none placeholder:text-ink-700/40"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="search-suggestions"
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-600 sm:px-7"
        >
          <Search size={17} strokeWidth={2.5} className="sm:hidden" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {showPanel && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-1.5 max-h-[70vh] overflow-y-auto rounded-xl border border-ink-600/10 bg-white p-1.5 text-left shadow-[0_14px_40px_rgba(20,16,46,0.18)]"
        >
          {categories.map((c) => (
            <Link
              key={c}
              href={`/shop?cat=${encodeURIComponent(c)}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
            >
              <Search size={14} className="text-ink-700/40" />
              All <b>{c}</b>
            </Link>
          ))}

          {matches.map((p, i) => (
            <Link
              key={p.slug}
              href={`/shop/${p.slug}`}
              onClick={() => {
                setOpen(false);
                setQ("");
              }}
              role="option"
              aria-selected={i === active}
              className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${i === active ? "bg-brand-50" : "hover:bg-ink-50"}`}
            >
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-ink-600/10">
                <Image src={thumb(p.image_url)} alt="" fill sizes="44px" className="object-contain p-0.5" unoptimized={p.image_url.startsWith("http")} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink-900">{p.name}</span>
                <span className="block text-xs text-ink-700/60">
                  {p.category}
                  {!p.in_stock && <span className="ml-1.5 font-semibold text-red-500">· Out of stock</span>}
                </span>
              </span>
              <span className="shrink-0 text-sm font-extrabold text-ink-900">{ugx(p.price_ugx)}</span>
            </Link>
          ))}

          {items.length > 0 && matches.length === 0 && categories.length === 0 && (
            <p className="px-3 py-3 text-sm text-ink-700/70">
              Nothing matches &ldquo;{q.trim()}&rdquo;. Try a brand or a product type — or{" "}
              <Link href="/find" onClick={() => setOpen(false)} className="font-bold text-brand-600 hover:underline">
                tell us your budget
              </Link>
              .
            </p>
          )}

          {total > matches.length && (
            <button
              type="button"
              onClick={() => go(all)}
              className="mt-1 w-full rounded-lg bg-ink-50 px-3 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50"
            >
              See all {total} results for &ldquo;{q.trim()}&rdquo; →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
