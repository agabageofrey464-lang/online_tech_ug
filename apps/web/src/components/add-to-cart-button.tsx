"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";

export function AddToCartButton({
  item,
  className = "",
  label = "Add to cart",
}: {
  item: Omit<CartItem, "quantity">;
  className?: string;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add(item);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 ${className}`}
    >
      {added ? "✓ Added" : label}
    </button>
  );
}
