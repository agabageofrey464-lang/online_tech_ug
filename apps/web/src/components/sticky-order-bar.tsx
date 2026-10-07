"use client";

import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ugx } from "@/lib/site";
import type { CartItem } from "@/lib/cart";

/**
 * The order button, kept on screen on a phone.
 *
 * A product page on a phone is long: photos, price, specifications, reviews.
 * The only "Order now" was near the top, so someone who read down to the
 * specifications and decided had to scroll all the way back to act on it.
 * Once that button has left the screen, this bar carries the name, the price
 * and the same button, sitting just above the tab bar. Phones only — on a
 * desktop the buy box is already in view.
 */
export function StickyOrderBar({ item, anchorId }: { item: Omit<CartItem, "quantity">; anchorId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor || typeof IntersectionObserver === "undefined") return;
    // Shown only once the real button has scrolled away above the screen.
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(anchor);
    return () => io.disconnect();
  }, [anchorId]);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-30 border-t border-ink-600/10 bg-white/95 px-3 py-2 shadow-[0_-4px_16px_rgba(20,16,46,0.12)] backdrop-blur transition duration-200 md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {/* Room is left on the right for the WhatsApp button that floats there. */}
      <div className="flex items-center gap-3 pr-16">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] text-ink-700/70">{item.name}</p>
          <p className="text-[15px] font-extrabold leading-tight text-ink-900">{ugx(item.price)}</p>
        </div>
        <AddToCartButton item={item} label="Order now" className="shrink-0 !px-5" pill />
      </div>
    </div>
  );
}
