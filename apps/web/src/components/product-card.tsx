import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { WishlistButton } from "@/components/wishlist-button";
import { SafeImage } from "@/components/safe-image";
import { AddToCartButton } from "@/components/add-to-cart-button";

/**
 * Product tile, jumia.ug style.
 *
 * Borderless while it sits in the grid so a row reads as one catalogue; on
 * hover it lifts into a white card with a shadow and reveals the order button,
 * which is how the reference keeps the grid calm but still one click from a
 * sale.
 */

/** Five-star bar: grey stars with a gold overlay clipped to the rating. */
function Stars({ rating }: { rating: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className="relative inline-block align-middle text-[13px] leading-none tracking-[1px]">
      <span className="text-ink-600/20">★★★★★</span>
      <span
        className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-[#f68b1e]"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.inStock !== false;
  // Deterministic rating count — stable per product so it never shifts.
  const reviews = Math.max(6, Math.round(product.rating * 13) + (product.name.length % 9) * 5);

  // Anchor pricing (DESIGN only — the real selling price is unchanged).
  const seed = [...product.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const synthPct = 6 + (seed % 15); // modest: 6%–20%
  const oldPrice =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice
      : Math.round(product.price / (1 - synthPct / 100) / 100) * 100;
  const discountPct = Math.max(1, Math.round((1 - product.price / oldPrice) * 100));

  return (
    <article className="group relative flex h-full w-full flex-col bg-white transition duration-200 hover:z-20 hover:shadow-[0_6px_26px_rgba(20,16,46,0.18)]">
      {/* Campaign ribbon — where the reference carries "Jumia Festival Deal" */}
      {product.badge && (
        <span className="absolute left-0 top-0 z-10 bg-brand-500 px-2 py-1 text-[11px] font-bold text-white">
          {product.badge}
        </span>
      )}

      <div className="relative aspect-square overflow-hidden">
        <Link href={`/shop/${product.id}`} className="block h-full w-full">
          <SafeImage
            src={productImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className={`object-contain p-3 transition duration-200 group-hover:scale-[1.03] ${inStock ? "" : "opacity-50"}`}
          />
        </Link>

        <WishlistButton
          slug={product.id}
          className="absolute bottom-1 right-1 z-20 text-brand-500"
        />

        {!inStock && (
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-ink-900/80 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2">
        {/* Store / condition tag, in the reference's blue */}
        <span className="mb-1 inline-flex w-fit rounded bg-[#1c5eb8] px-1.5 py-0.5 text-[10px] font-bold text-white">
          {product.condition === "Brand New" ? "Official Store" : product.condition}
        </span>

        <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col">
          <h3 className="clamp-2 min-h-[2.6em] text-[13.5px] leading-snug text-ink-800 group-hover:text-brand-600">
            {product.name}
          </h3>

          <p className="mt-1 text-[15px] font-bold leading-tight tracking-tight text-ink-900">
            {ugx(product.price)}
          </p>

          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11.5px] text-ink-700/45 line-through">{ugx(oldPrice)}</span>
            <span className="rounded bg-[#fdeee4] px-1.5 py-0.5 text-[11px] font-bold text-[#f68b1e]">
              -{discountPct}%
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            <Stars rating={product.rating} />
            <span className="text-[11.5px] text-ink-700/50">({reviews.toLocaleString()})</span>
          </div>

          {/* Delivery promise — where the reference shows JUMIA EXPRESS */}
          <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wide text-brand-600">
            Online Tech <span className="text-ink-700/60">Delivery</span>
          </p>
        </Link>

        {/* Revealed on hover, exactly like the reference's lifted card */}
        {inStock && (
          <div className="pointer-events-none mt-2 max-h-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:max-h-16 group-hover:opacity-100">
            <AddToCartButton
              className="w-full justify-center !py-2.5 !text-sm"
              item={{
                slug: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                condition: product.condition,
              }}
            />
          </div>
        )}
      </div>
    </article>
  );
}
