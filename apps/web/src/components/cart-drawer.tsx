"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { ugx } from "@/lib/site";
import { products, productImage } from "@/lib/data";

const imgFor = (item: { slug: string; image?: string }) => {
  if (item.image) return item.image; // vendor products carry their own image
  const p = products.find((x) => x.id === item.slug);
  return productImage(p ?? { id: item.slug });
};

// Vendor marketplace items use slug "vp-<id>" and live on /marketplace, not /shop.
const linkFor = (slug: string) => (slug.startsWith("vp-") ? "/marketplace" : `/shop/${slug}`);

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotal, count } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-[#f6f7f9] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <header className="flex items-center justify-between bg-white px-5 py-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
            <ShoppingCart size={20} className="text-brand-500" /> Cart ({count})
          </h2>
          <button onClick={close} aria-label="Close cart" className="rounded-full p-1 text-ink-600/60 hover:bg-ink-50 hover:text-ink-900">
            <X size={22} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingCart size={56} className="text-ink-300" strokeWidth={1.4} />
            <p className="font-semibold text-ink-700">Your cart is empty</p>
            <Link href="/shop" onClick={close} className="rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
              {items.map((i) => (
                <div key={i.slug} className="flex gap-3 rounded-lg bg-white p-3 shadow-sm">
                  <Link
                    href={linkFor(i.slug)}
                    onClick={close}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-ink-600/10 bg-white"
                  >
                    <Image src={imgFor(i)} alt={i.name} fill sizes="80px" className="object-contain p-1" />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={linkFor(i.slug)} onClick={close} className="clamp-2 text-sm font-semibold text-ink-800 hover:text-brand-600">
                      {i.name}
                    </Link>
                    <p className="mt-0.5 text-[11px] font-semibold text-green-700">In stock</p>
                    <p className="mt-0.5 text-base font-extrabold text-ink-900">{ugx(i.price)}</p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center overflow-hidden rounded-md border border-ink-600/15">
                        <button
                          onClick={() => (i.quantity <= 1 ? remove(i.slug) : setQty(i.slug, i.quantity - 1))}
                          aria-label="Decrease quantity"
                          className="flex h-8 w-8 items-center justify-center text-ink-700 hover:bg-ink-50"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-ink-900">{i.quantity}</span>
                        <button
                          onClick={() => setQty(i.slug, i.quantity + 1)}
                          aria-label="Increase quantity"
                          className="flex h-8 w-8 items-center justify-center bg-brand-500 text-white hover:bg-brand-600"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(i.slug)}
                        className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-700/70">Subtotal</span>
                <span className="text-xl font-extrabold text-ink-900">{ugx(subtotal)}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-ink-700/50">Delivery calculated at checkout.</p>
              <Link
                href="/checkout"
                onClick={close}
                className="mt-3 flex w-full items-center justify-center rounded-md bg-brand-500 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-600"
              >
                Checkout ({count})
              </Link>
              <button onClick={close} className="mt-2 w-full text-center text-xs font-semibold text-ink-700/60 hover:text-brand-600">
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
