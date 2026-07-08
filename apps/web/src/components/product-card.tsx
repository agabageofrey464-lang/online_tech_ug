import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist-button";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;
  const inStock = product.inStock !== false;
  const priceNum = new Intl.NumberFormat("en-UG").format(product.price);

  return (
    <article className="group relative flex flex-col rounded-lg border border-ink-600/10 bg-white p-2.5 shadow-sm transition hover:border-ink-600/20 hover:shadow-md sm:p-3">
      <WishlistButton slug={product.id} className="absolute right-2 top-2 z-10" />
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-white">
          <Image
            src={`/products/${product.id}.webp`}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-contain p-1 transition duration-200 group-hover:scale-[1.04] ${inStock ? "" : "opacity-50"}`}
          />
          {!inStock && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-ink-900/80 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Out of stock
            </span>
          )}
          {discount > 0 && (
            <span className="absolute bottom-1.5 left-1.5 rounded bg-brand-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
              -{discount}%
            </span>
          )}
          {product.badge && (
            <span className="absolute left-1.5 top-1.5 rounded bg-ink-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {product.badge}
            </span>
          )}
        </div>

        <h3 className="clamp-2 mt-2 min-h-[2.5rem] text-[13px] leading-tight text-ink-900 group-hover:text-brand-600">
          {product.name}
        </h3>

        {/* Rating — Amazon-style orange stars + count */}
        <div className="mt-1 flex items-center gap-1.5 text-[11px]">
          <span className="tracking-tight text-[#ffa41c]">
            {"★".repeat(Math.round(product.rating))}
            <span className="text-ink-600/20">{"★".repeat(5 - Math.round(product.rating))}</span>
          </span>
          <span className="text-ink-700/50">{product.rating.toFixed(1)}</span>
        </div>

        {/* Price — small currency + prominent amount */}
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-[11px] font-semibold text-ink-900">UGX</span>
          <span className="text-xl font-extrabold leading-none text-ink-900">{priceNum}</span>
        </div>
        {product.oldPrice && (
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
            <span className="text-ink-700/45">List: <span className="line-through">{ugx(product.oldPrice)}</span></span>
            {discount > 0 && <span className="font-semibold text-brand-600">Save {discount}%</span>}
          </div>
        )}

        <p className={`mt-1.5 text-[11px] font-semibold ${inStock ? "text-green-700" : "text-red-500"}`}>
          {inStock ? "In stock · Free delivery on 3M+" : "Currently unavailable"}
        </p>
      </Link>

      <div className="mt-2">
        {inStock ? (
          <AddToCartButton
            variant="amazon"
            className="w-full !py-1.5 text-xs"
            label="Add to cart"
            item={{
              slug: product.id,
              name: product.name,
              price: product.price,
              category: product.category,
              condition: product.condition,
            }}
          />
        ) : (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-full bg-ink-100 py-1.5 text-xs font-bold text-ink-700/50"
          >
            Out of stock
          </button>
        )}
      </div>
    </article>
  );
}
