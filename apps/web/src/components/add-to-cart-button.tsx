"use client";

import { useState, type ReactNode } from "react";
import { useCart, type CartItem } from "@/lib/cart";

export function AddToCartButton({
  item,
  className = "",
  label = "Add to cart",
  addedLabel = "✓ Added",
  pill = false,
}: {
  item: Omit<CartItem, "quantity">;
  className?: string;
  label?: ReactNode;
  addedLabel?: ReactNode;
  pill?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        // When overlaid on a linked card, don't let the click navigate.
        e.preventDefault();
        e.stopPropagation();
        add(item);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className={`press inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition ${
        added ? "bg-green-600 hover:bg-green-600" : "bg-brand-500 hover:bg-brand-600"
      } ${pill ? "rounded-full" : "rounded-lg"} ${className}`}
    >
      {added ? (
        <span key="added" className="animate-cart-pop inline-flex items-center gap-1">
          ✓ Added
        </span>
      ) : (
        label
      )}
    </button>
  );
}
