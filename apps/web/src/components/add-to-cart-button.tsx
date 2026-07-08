"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";

export function AddToCartButton({
  item,
  className = "",
  label = "Add to cart",
  pill = false,
}: {
  item: Omit<CartItem, "quantity">;
  className?: string;
  label?: string;
  pill?: boolean;
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
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition bg-brand-500 hover:bg-brand-600 ${
        pill ? "rounded-full" : "rounded-lg"
      } ${className}`}
    >
      {added ? "✓ Added" : label}
    </button>
  );
}
