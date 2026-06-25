"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { ugx } from "@/lib/site";

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
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <header className="flex items-center justify-between border-b border-ink-600/10 p-5">
          <h2 className="text-lg font-extrabold text-ink-600">Your cart ({count})</h2>
          <button onClick={close} aria-label="Close cart" className="text-2xl leading-none text-ink-600/60 hover:text-ink-600">
            ×
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="text-5xl">🛒</span>
            <p className="font-semibold text-ink-600">Your cart is empty</p>
            <Link href="/shop" onClick={close} className="text-sm font-semibold text-brand-600 hover:underline">
              Browse products →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map((i) => (
                <div key={i.slug} className="flex gap-3 rounded-lg border border-ink-600/10 p-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-ink-50 text-2xl">
                    {i.category === "Laptops" ? "💻" : i.category === "Desktops" ? "🖥️" : i.category === "Networking" ? "📡" : i.category === "Storage" ? "💾" : "🖱️"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-600">{i.name}</p>
                    <p className="text-xs text-ink-700/60">{ugx(i.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => setQty(i.slug, i.quantity - 1)} className="h-6 w-6 rounded border border-ink-600/20 text-ink-600">−</button>
                      <span className="w-6 text-center text-sm">{i.quantity}</span>
                      <button onClick={() => setQty(i.slug, i.quantity + 1)} className="h-6 w-6 rounded border border-ink-600/20 text-ink-600">+</button>
                      <button onClick={() => remove(i.slug)} className="ml-auto text-xs text-brand-600 hover:underline">Remove</button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-ink-600">{ugx(i.price * i.quantity)}</p>
                </div>
              ))}
            </div>

            <footer className="border-t border-ink-600/10 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-700/70">Subtotal</span>
                <span className="text-lg font-extrabold text-ink-600">{ugx(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-700/50">Delivery calculated at checkout.</p>
              <Link
                href="/checkout"
                onClick={close}
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Checkout →
              </Link>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
