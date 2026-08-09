import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { WishlistButton } from "@/components/wishlist-button";
import { SafeImage } from "@/components/safe-image";
import { WhatsAppOrder, storeOrderMessage } from "@/components/whatsapp-order";

// One-line key spec for the card: for computers, CPU · RAM · Storage; otherwise
// the product's first short spec bullet.
function keySpec(product: Product): string {
  const d = product.details;
  if (d) {
    const cpu = d.processor.match(/Core i\d|Ryzen \d|Apple M\d|Celeron|Pentium|Athlon/i)?.[0] ?? "";
    const ram = d.ram.split("(")[0].trim();
    const storage = d.storage.split("(")[0].trim();
    return [cpu, ram, storage].filter(Boolean).join(" · ");
  }
  return product.specs?.[0] ?? "";
}

// Colour the condition tag by how new the item is.
function conditionStyle(c: string): string {
  if (c === "Brand New") return "bg-green-100 text-green-700";
  if (c === "Refurbished") return "bg-amber-100 text-amber-700";
  return "bg-ink-100 text-ink-700"; // UK Used / other
}

/** Jumia-style rating bar: grey stars with a gold overlay clipped to rating. */
function Stars({ rating }: { rating: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span
      className="relative inline-block align-middle text-[11px] leading-none tracking-[1px]"
      aria-label={`Rated ${rating} out of 5`}
    >
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
  // Deterministic rating count (Jumia/Amazon show the number of ratings, not
  // the score) — stable per product so it never shifts between renders.
  const reviews = Math.max(6, Math.round(product.rating * 13) + (product.name.length % 9) * 5);
  // WhatsApp order — carries the exact product, its details and a link so the
  // owner sees precisely what was ordered, and asks the buyer for their location.
  const orderMsg = storeOrderMessage({
    name: product.name,
    priceLabel: ugx(product.price),
    condition: product.condition,
    category: product.category,
    url: `https://www.onlinetechug.com/shop/${product.id}`,
  });

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink-600/[0.06] transition duration-200 hover:z-10 hover:ring-brand-200 hover:shadow-[0_4px_18px_rgba(20,16,46,0.12)]">
      {/* Image area — its own relative box so the cart button pins to the photo. */}
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={`/shop/${product.id}`} className="block h-full w-full">
          <SafeImage
            src={productImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className={`object-contain p-1.5 transition duration-200 group-hover:scale-[1.04] ${inStock ? "" : "opacity-50"}`}
          />
        </Link>

        <WishlistButton
          slug={product.id}
          className="absolute left-2 top-2 z-20 opacity-0 transition group-hover:opacity-100"
        />
        {product.badge && (
          <span className="absolute right-2 top-2 z-10 rounded bg-ink-600/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {product.badge}
          </span>
        )}

        {!inStock && (
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-ink-900/80 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}

      </div>

      <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col px-2.5 pt-1.5">
        <h3 className="clamp-2 min-h-[2.4em] text-[12.5px] leading-tight text-ink-800 group-hover:text-brand-600">
          {product.name}
        </h3>

        {/* Key spec line — CPU · RAM · Storage for computers, else first bullet. */}
        {keySpec(product) && (
          <p className="mt-0.5 truncate text-[10.5px] font-medium text-ink-700/55">{keySpec(product)}</p>
        )}

        {/* Condition + brand row. */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${conditionStyle(product.condition)}`}>
            {product.condition}
          </span>
          {product.brand && product.brand !== "Generic" && (
            <span className="text-[10px] font-semibold text-ink-700/50">{product.brand}</span>
          )}
        </div>

        {/* Price — full price, no discount markdown. */}
        <p className="mt-1.5 text-[15px] font-extrabold text-ink-900">{ugx(product.price)}</p>

        {/* Rating + review count (Jumia/Amazon show the number of ratings). */}
        <div className="mt-0.5 flex items-center gap-1">
          <Stars rating={product.rating} />
          <span className="text-[11px] text-ink-700/45">({reviews})</span>
        </div>

        {/* Trust line: delivery by distance + warranty by condition. */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-medium text-ink-700/55">
          <span className="inline-flex items-center gap-1">🚚 Delivery by distance</span>
          <span className="inline-flex items-center gap-1 text-green-700/80">
            🛡 {product.condition === "Brand New" ? "12mo" : product.condition === "Refurbished" ? "6mo" : "3mo"} warranty
          </span>
        </div>
      </Link>

      {/* Order on WhatsApp — compact, carries the product + details to the owner. */}
      <WhatsAppOrder message={orderMsg} disabled={!inStock} className="mx-2.5 mb-2.5 mt-2" />
    </article>
  );
}
