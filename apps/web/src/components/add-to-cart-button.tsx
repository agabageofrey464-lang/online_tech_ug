"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";

export function AddToCartButton({
  item,
  className = "",
  label = "Add to cart",
  variant = "brand",
}: {
  item: Omit<CartItem, "quantity">;
  className?: string;
  label?: string;
  variant?: "brand" | "amazon";
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  // "amazon" = the signature yellow pill; "brand" = orange rounded button.
  const styles =
    variant === "amazon"
      ? "rounded-full border border-[#e0b400] bg-[#ffd814] text-[#0f1111] shadow-sm hover:bg-[#f7ca00]"
      : "rounded-lg bg-brand-500 text-white hover:bg-brand-600";

  return (
    <button
      type="button"
      onClick={() => {
        add(item);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition ${styles} ${className}`}
    >
      {added ? "✓ Added" : label}
    </button>
  );
}
