"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Heart } from "lucide-react";
import { products } from "@/lib/data";
import { useWishlist } from "@/lib/wishlist";
import { ProductCard } from "@/components/product-card";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function WishlistPage() {
  const { slugs, count, clear } = useWishlist();
  const items = slugs.map((s) => products.find((p) => p.id === s)).filter(Boolean) as typeof products;

  return (
    <div className="container-wide py-3">
      <div className="mb-3">
        <Breadcrumbs items={[{ label: "Your List" }]} />
      </div>

      <div className="mb-3 flex items-center justify-between rounded bg-white px-4 py-3 shadow-sm">
        <h1 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
          <Heart size={22} className="fill-brand-500 text-brand-500" /> Your List
          <span className="text-sm font-semibold text-ink-700/50">({count})</span>
        </h1>
        {count > 0 && (
          <button onClick={clear} className="text-sm font-semibold text-brand-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          art="wishlist"
          title="Your list is empty"
          message="Tap the heart on any product to save it here for later."
          actionLabel="Start shopping"
          actionHref="/shop"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
