import Image from "next/image";
import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { WishlistButton } from "@/components/wishlist-button";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;
  const inStock = product.inStock !== false;

  return (
    <article className="group relative flex flex-col rounded-md bg-white transition hover:shadow-md">
      <WishlistButton
        slug={product.id}
        className="absolute left-2 top-2 z-10 opacity-0 transition group-hover:opacity-100"
      />

      <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-white">
          <Image
            src={productImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className={`object-contain p-2 transition duration-200 group-hover:scale-[1.03] ${inStock ? "" : "opacity-50"}`}
          />
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

        <div className="px-2 pb-3 pt-1">
          <h3 className="truncate text-[13px] text-ink-800 group-hover:text-brand-600">{product.name}</h3>
          <p className="mt-1 text-[15px] font-extrabold text-ink-900">{ugx(product.price)}</p>
          {product.oldPrice && (
            <p className="text-[11px] text-ink-700/40 line-through">{ugx(product.oldPrice)}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
