import Link from "next/link";
import { SafeImage } from "@/components/safe-image";
import { products, productImage } from "@/lib/data";
import { ugx } from "@/lib/site";

/**
 * Fills the filter column below the filters.
 *
 * The filter panel is only as tall as its own content, so on a long results
 * page the rest of that column was just empty background. This puts the space
 * to work with a trending list and two offers, rather than leaving a stripe of
 * flat colour running down the page.
 */
export function SidebarExtras() {
  // Best-rated in-stock items, varied by brand so it isn't five of the same.
  const seen = new Set<string>();
  const trending = [...products]
    .filter((p) => p.inStock !== false)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .filter((p) => {
      if (seen.has(p.brand)) return false;
      seen.add(p.brand);
      return true;
    })
    .slice(0, 5);

  return (
    <div className="mt-3 space-y-3">
      {/* Budget finder — the most useful thing we can offer someone still deciding */}
      <Link
        href="/find"
        className="group block overflow-hidden rounded bg-brand-500 p-4 text-white shadow-sm transition hover:brightness-110"
      >
        <span className="text-xl" aria-hidden>
          🔎
        </span>
        <p className="mt-1 text-sm font-extrabold leading-snug">Not sure what to buy?</p>
        <p className="mt-0.5 text-xs text-white/85">
          Tell us your budget — we&apos;ll show what genuinely fits.
        </p>
        <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold text-brand-600">
          Find my laptop →
        </span>
      </Link>

      {/* Trending */}
      <div className="rounded bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-ink-900">Trending now</p>
        <ul className="mt-2 space-y-2.5">
          {trending.map((p, i) => (
            <li key={p.id}>
              <Link href={`/shop/${p.id}`} className="group flex items-center gap-2.5">
                <span className="w-3 shrink-0 text-center text-[11px] font-black text-ink-600/30">
                  {i + 1}
                </span>
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-ink-50">
                  <SafeImage
                    src={productImage(p)}
                    alt={p.name}
                    fill
                    sizes="40px"
                    className="object-contain p-0.5"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="clamp-2 block text-[11.5px] leading-snug text-ink-800 group-hover:text-brand-600">
                    {p.name}
                  </span>
                  <span className="block text-[11px] font-bold text-ink-900">{ugx(p.price)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Courses — the other half of the business, easy to miss from the shop */}
      <Link
        href="/learn"
        className="group block overflow-hidden rounded bg-green-600 p-4 text-white shadow-sm transition hover:brightness-110"
      >
        <span className="text-xl" aria-hidden>
          🎓
        </span>
        <p className="mt-1 text-sm font-extrabold leading-snug">Learn computer skills</p>
        <p className="mt-0.5 text-xs text-white/85">
          22 courses, physical or online, with a certificate.
        </p>
        <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold text-green-700">
          Browse courses →
        </span>
      </Link>

      {/* Repairs */}
      <Link
        href="/services#repairs-support"
        className="group block overflow-hidden rounded bg-ink-700 p-4 text-white shadow-sm transition hover:brightness-110"
      >
        <span className="text-xl" aria-hidden>
          🔧
        </span>
        <p className="mt-1 text-sm font-extrabold leading-snug">Laptop not working?</p>
        <p className="mt-0.5 text-xs text-white/85">Free diagnosis, repairs from UGX 30,000.</p>
        <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold text-ink-800">
          Book a repair →
        </span>
      </Link>
    </div>
  );
}
