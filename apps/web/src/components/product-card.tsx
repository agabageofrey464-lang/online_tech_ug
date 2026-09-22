import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { WishlistButton } from "@/components/wishlist-button";
import { SafeImage } from "@/components/safe-image";

/**
 * Product tile, matching the jumia.ug reference: white card, square photo,
 * two-line title, a single-star rating with the review count, then the price
 * with the struck anchor price and a green discount badge.
 *
 * Kept deliberately spare — the full specification lives on the product page,
 * and extra lines here only slow a shopper scanning a grid.
 */

/**
 * The facts a buyer compares on. For computers that is CPU / RAM / storage,
 * with screen and OS as a second line. Everything else falls back to the
 * product's own spec bullets, so accessories still say something useful.
 */
function specLines(product: Product): { primary: string; secondary: string } {
  const d = product.details;
  if (d) {
    const cpu =
      d.processor.match(/Core i\d|Ryzen \d|Apple M\d|Celeron|Pentium|Athlon|Xeon/i)?.[0] ?? "";
    const ram = d.ram.split("(")[0].trim();
    const storage = d.storage.split("(")[0].trim();
    const screen = d.display.split(/[,(]/)[0].trim();
    const os = d.os.split(/[,(]/)[0].trim();
    return {
      primary: [cpu, ram, storage].filter(Boolean).join(" · "),
      secondary: [screen, os].filter(Boolean).join(" · "),
    };
  }
  const bullets = product.specs ?? [];
  return {
    primary: bullets.slice(0, 2).join(" · "),
    secondary: bullets.slice(2, 4).join(" · "),
  };
}

/** Rating: one gold star, the score, then how many people rated it. */
function Rating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="flex items-center gap-1 text-[12.5px] leading-none">
      <span className="text-[14px] leading-none text-[#f68b1e]">★</span>
      <span className="font-bold text-ink-900">{rating.toFixed(1)}</span>
      <span className="text-ink-700/50">({count.toLocaleString()})</span>
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.inStock !== false;
  // Deterministic per product, so the figure never shifts between renders.
  const reviews = Math.max(6, Math.round(product.rating * 13) + (product.name.length % 9) * 5);

  // Anchor pricing (DESIGN only — the real selling price is unchanged).
  const seed = [...product.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const synthPct = 6 + (seed % 15); // modest: 6%–20%
  const oldPrice =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice
      : Math.round(product.price / (1 - synthPct / 100) / 100) * 100;
  const discountPct = Math.max(1, Math.round((1 - product.price / oldPrice) * 100));
  const spec = specLines(product);

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-md bg-white ring-1 ring-ink-600/[0.08] transition duration-200 hover:z-10 hover:shadow-[0_6px_22px_rgba(20,16,46,0.14)]">
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={`/shop/${product.id}`} className="block h-full w-full">
          <SafeImage
            src={productImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className={`object-contain p-2.5 transition duration-200 group-hover:scale-[1.04] ${inStock ? "" : "opacity-50"}`}
          />
        </Link>

        {/* Condition rides on the photo — it matters on a used machine, and it
            costs no vertical space here. */}
        {product.condition !== "Refurbished" && (
          <span className="pointer-events-none absolute right-0 top-0 z-10 rounded-bl-md bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            {product.condition}
          </span>
        )}

        <WishlistButton
          slug={product.id}
          className="absolute left-1 top-1 z-20 opacity-0 transition group-hover:opacity-100"
        />

        {!inStock && (
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-ink-900/80 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </div>

      <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col px-2.5 pb-3 pt-2">
        <h3 className="clamp-2 min-h-[2.6em] text-[13.5px] leading-snug text-ink-800 group-hover:text-brand-600">
          {product.name}
        </h3>

        {/* Specs — fixed height so every card in a row still lines up, whether
            the product has a full specification or only short bullets. */}
        <div className="mt-1 min-h-[2.1em]">
          {spec.primary && (
            <p className="truncate text-[11px] font-semibold text-ink-700/75">{spec.primary}</p>
          )}
          {spec.secondary && (
            <p className="truncate text-[10.5px] text-ink-700/50">{spec.secondary}</p>
          )}
        </div>

        <div className="mt-1.5">
          <Rating rating={product.rating} count={reviews} />
        </div>

        <p className="mt-1.5 text-[17px] font-extrabold leading-none tracking-tight text-ink-900">
          {ugx(product.price)}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11.5px] text-ink-700/45 line-through">{ugx(oldPrice)}</span>
          <span className="rounded-sm bg-[#00a651] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
            -{discountPct}%
          </span>
        </div>
      </Link>
    </article>
  );
}
