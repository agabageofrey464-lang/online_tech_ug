"use client";

import { CheckCircle2, X } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartToast() {
  const { toast, dismissToast, open } = useCart();
  if (!toast) return null;

  return (
    <div className="fixed inset-x-0 top-20 z-[90] flex justify-center px-4">
      <div className="flex w-full max-w-md items-center gap-3 rounded-lg border border-green-200 bg-white p-3 shadow-xl">
        <CheckCircle2 className="shrink-0 text-green-600" size={22} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink-800">Added to cart</p>
          <p className="truncate text-xs text-ink-700/60">{toast}</p>
        </div>
        <button
          onClick={() => {
            dismissToast();
            open();
          }}
          className="shrink-0 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600"
        >
          View cart
        </button>
        <button onClick={dismissToast} aria-label="Dismiss" className="shrink-0 text-ink-600/40 hover:text-ink-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
