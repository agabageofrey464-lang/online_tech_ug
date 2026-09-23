import Link from "next/link";
import { Icon } from "@/components/icon";
import { products, productCategories } from "@/lib/data";

/**
 * Categories, as a row you can thumb through.
 *
 * On a phone the home page had no way into a category at all — the mega-menu
 * and the sidebar are both desktop-only, so browsing by category meant opening
 * the menu and going looking. This puts every category one tap away, with the
 * number of items in each so nobody taps into a near-empty one.
 */

const ICONS: Record<string, string> = {
  Laptops: "laptop",
  Desktops: "monitor",
  Components: "components",
  Power: "power",
  Accessories: "mouse",
  Networking: "wifi",
  Storage: "storage",
};

export function CategoryStrip({ className = "" }: { className?: string }) {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.inStock === false) continue;
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }

  // Busiest first: what we actually have most of is what most people want.
  const cats = productCategories
    .filter((c) => c !== "All")
    .map((c) => ({ name: c, count: counts.get(c) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  if (cats.length === 0) return null;

  return (
    <section className={`overflow-hidden rounded-lg bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-3 pt-2.5">
        <h2 className="text-[13px] font-extrabold text-ink-900">Shop by category</h2>
        <Link href="/categories" className="text-[11px] font-bold text-brand-600">
          See all →
        </Link>
      </div>

      {/* A scrolling row rather than a grid: a grid of eight leaves an orphan
          on its own line and eats the top of the page. */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-3 pb-3 pt-2 no-scrollbar">
        {cats.map((c) => (
          <Link
            key={c.name}
            href={`/shop?cat=${encodeURIComponent(c.name)}`}
            className="press group flex w-[66px] shrink-0 flex-col items-center gap-1 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-500/15 transition group-hover:bg-brand-500 group-hover:text-white">
              <Icon name={ICONS[c.name] ?? "package"} size={20} strokeWidth={2.1} />
            </span>
            <span className="w-full truncate text-[10.5px] font-bold leading-tight text-ink-800">
              {c.name}
            </span>
            <span className="text-[9px] font-semibold text-ink-700/55">{c.count} items</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
