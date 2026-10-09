"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart";
import { ugx } from "@/lib/site";
import { products, productImage } from "@/lib/data";
import { SafeImage } from "@/components/safe-image";
import { Breadcrumbs } from "@/components/breadcrumbs";

function imgFor(item: CartItem) {
  const p = products.find((x) => x.id === item.slug);
  return item.image || productImage(p ?? { id: item.slug });
}
const linkFor = (slug: string) => (slug.startsWith("vp-") ? "/marketplace" : `/shop/${slug}`);

export default function CartPage() {
  const { items, subtotal, count, remove, setQty } = useCart();

  return (
    <div className="container-page py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Cart" }]} />
      </div>
      <h1 className="mb-8 mt-4 text-center text-[34px] leading-tight text-ink-900 sm:text-[44px]">Your Cart {count > 0 && <span className="text-ink-700/50">({count})</span>}</h1>

      {items.length === 0 ? (
        <EmptyState
          art="cart"
          title="Your cart is empty"
          message="Browse the shop and add items to get started."
          actionLabel="Start shopping"
          actionHref="/shop"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
          {/* Items */}
          <div className="divide-y divide-ink-600/10 overflow-hidden bg-white">
            {items.map((i) => (
              <div key={i.slug} className="flex gap-3 p-4">
                <Link href={linkFor(i.slug)} className="relative h-28 w-28 shrink-0 overflow-hidden bg-[var(--tile)]">
                  <SafeImage src={imgFor(i)} alt={i.name} fill sizes="112px" className="object-contain p-2 mix-blend-multiply" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={linkFor(i.slug)} className="clamp-2 font-display text-[19px] leading-snug text-ink-900 hover:text-brand-600">{i.name}</Link>
                  <p className="mt-0.5 text-base font-extrabold text-ink-900">{ugx(i.price)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-[3px] border border-ink-600/20">
                      <button onClick={() => (i.quantity <= 1 ? remove(i.slug) : setQty(i.slug, i.quantity - 1))} aria-label="Decrease" className="px-2.5 py-1.5 text-ink-700 hover:bg-ink-50">
                        <Minus size={14} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold text-ink-900">{i.quantity}</span>
                      <button onClick={() => setQty(i.slug, i.quantity + 1)} aria-label="Increase" className="px-2.5 py-1.5 text-ink-700 hover:bg-ink-50">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => remove(i.slug)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-extrabold text-ink-900">{ugx(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="h-fit bg-[var(--tile)] p-6 lg:sticky lg:top-40">
            <h2 className="border-b border-ink-600/10 pb-3 text-[24px] leading-none text-ink-900">Order Summary</h2>
            <div className="flex items-center justify-between py-3 text-sm">
              <span className="text-ink-700/70">Subtotal ({count} item{count > 1 ? "s" : ""})</span>
              <span className="font-extrabold text-ink-900">{ugx(subtotal)}</span>
            </div>
            <p className="mb-3 text-xs text-ink-700/50">Delivery is calculated at checkout based on your location.</p>
            <Link href="/checkout" className="flex h-14 w-full items-center justify-center bg-brand-500 px-5 text-center text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-brand-600">
              Proceed to checkout
            </Link>
            <Link href="/shop" className="mt-2 flex h-12 w-full items-center justify-center border border-ink-900 px-5 text-center text-[12px] font-bold uppercase tracking-[0.16em] text-ink-900 hover:bg-ink-900 hover:text-white">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
