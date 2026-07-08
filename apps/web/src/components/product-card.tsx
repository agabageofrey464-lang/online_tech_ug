import Image from "next/image";
import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist-button";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;
  const inStock = product.inStock !== false;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-md border border-ink-600/10 bg-white transition hover:shadow-lg">
      <WishlistButton slug={product.id} className="absolute left-2 top-2 z-10" />

      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-white">
          <Image
            src={productImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-contain p-2 transition duration-200 group-hover:scale-[1.04] ${inStock ? "" : "opacity-50"}`}
          />
          {/* Jumia-style peach discount badge, top-right */}
          {discount > 0 && (
            <span className="absolute right-2 top-2 rounded bg-[#fde3c7] px-1.5 py-0.5 text-[12px] font-bold text-[#e06f00]">
              -{discount}%
            </span>
          )}
          {product.badge && discount === 0 && (
            <span className="absolute right-2 top-2 rounded bg-ink-600/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {product.badge}
            </span>
          )}
          {!inStock && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-ink-900/80 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Out of stock
            </span>
          )}
        </div>

        <div className="px-2.5 pb-2.5 pt-1.5">
          <h3 className="truncate text-[13px] text-ink-800 group-hover:text-brand-600">{product.name}</h3>
          <p className="mt-1 text-[15px] font-extrabold text-ink-900">{ugx(product.price)}</p>
          {product.oldPrice && (
            <p className="text-[11px] text-ink-700/40 line-through">{ugx(product.oldPrice)}</p>
          )}
        </div>
      </Link>

      {/* Add to cart — slides up on hover (Jumia grid behaviour); card links to detail on mobile */}
      {inStock ? (
        <div className="absolute inset-x-0 bottom-0 translate-y-full border-t border-ink-600/10 bg-white p-2 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] transition duration-200 group-hover:translate-y-0">
          <AddToCartButton
            className="w-full !rounded !py-1.5 text-xs"
            label="ADD TO CART"
            item={{
              slug: product.id,
              name: product.name,
              price: product.price,
              category: product.category,
              condition: product.condition,
            }}
          />
        </div>
      ) : null}
    </article>
  );
}
