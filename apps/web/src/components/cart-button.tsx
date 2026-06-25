"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartButton({ className = "" }: { className?: string }) {
  const { count, open } = useCart();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open cart, ${count} item(s)`}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-brand-600 transition hover:bg-brand-500 hover:text-white ${className}`}
    >
      <ShoppingCart size={20} strokeWidth={2.2} />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
