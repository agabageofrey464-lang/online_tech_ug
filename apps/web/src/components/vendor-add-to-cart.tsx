"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { soldBy } from "@/lib/site";

type Props = {
  id: number;
  name: string;
  price: number;
  category: string;
  vendorName: string;
  image?: string;
};

/** Adds a marketplace (vendor) product to the cart using the "vp-<id>" slug
 *  so checkout creates a real order and the platform commission is applied. */
export function VendorAddToCart({ id, name, price, category, vendorName, image }: Props) {
  const { add } = useCart();
  return (
    <button
      onClick={() =>
        add({
          slug: `vp-${id}`,
          name,
          price,
          category,
          condition: soldBy(vendorName),
          image,
        })
      }
      className="mt-auto flex items-center justify-center gap-1.5 rounded bg-brand-500 px-3 py-1.5 text-center text-xs font-bold text-white transition hover:bg-brand-600"
    >
      <ShoppingCart size={14} /> Order now
    </button>
  );
}
