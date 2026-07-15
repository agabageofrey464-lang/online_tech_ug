"use client";

import Link from "next/link";
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
      <h1 className="mb-5 text-2xl font-extrabold text-ink-900">Your cart {count > 0 && <span className="text-ink-700/50">({count})</span>}</h1>

      {items.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-600/20 bg-white p-12 text-center">
          <ShoppingCart className="mx-auto text-ink-700/30" size={40} />
          <p className="mt-3 font-bold text-ink-800">Your cart is empty</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-700/60">Browse the shop and add items to get started.</p>
          <Link href="/shop" className="mt-5 inline-block rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Items */}
          <div className="divide-y divide-ink-600/10 overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm">
            {items.map((i) => (
              <div key={i.slug} className="flex gap-3 p-4">
                <Link href={linkFor(i.slug)} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-ink-600/10 bg-white">
                  <SafeImage src={imgFor(i)} alt={i.name} fill sizes="80px" className="object-contain p-1" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={linkFor(i.slug)} className="clamp-2 text-sm font-semibold text-ink-800 hover:text-brand-600">{i.name}</Link>
                  <p className="mt-0.5 text-base font-extrabold text-ink-900">{ugx(i.price)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-md border border-ink-600/20">
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
          <aside className="h-fit rounded-card border border-ink-600/10 bg-white p-5 shadow-sm lg:sticky lg:top-20">
            <h2 className="border-b border-ink-600/10 pb-3 text-base font-extrabold text-ink-900">Order summary</h2>
            <div className="flex items-center justify-between py-3 text-sm">
              <span className="text-ink-700/70">Subtotal ({count} item{count > 1 ? "s" : ""})</span>
              <span className="font-extrabold text-ink-900">{ugx(subtotal)}</span>
            </div>
            <p className="mb-3 text-xs text-ink-700/50">Delivery is calculated at checkout based on your location.</p>
            <Link href="/checkout" className="block w-full rounded-md bg-brand-500 px-5 py-3 text-center text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600">
              Proceed to checkout
            </Link>
            <Link href="/shop" className="mt-2 block w-full rounded-md border border-ink-600/20 px-5 py-2.5 text-center text-sm font-bold text-ink-700 hover:bg-ink-50">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
