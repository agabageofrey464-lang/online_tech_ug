"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";

export function WishlistButton({
  slug,
  className = "",
  variant = "icon",
}: {
  slug: string;
  className?: string;
  variant?: "icon" | "full";
}) {
  const { has, toggle } = useWishlist();
  const saved = has(slug);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(slug);
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={`flex w-full items-center justify-center gap-2 rounded-md border py-2.5 text-sm font-bold transition ${
          saved
            ? "border-brand-300 bg-brand-50 text-brand-600"
            : "border-ink-600/20 text-ink-700 hover:border-brand-300 hover:text-brand-600"
        } ${className}`}
      >
        <Heart size={18} className={saved ? "fill-brand-500 text-brand-500" : ""} />
        {saved ? "Saved to list" : "Add to list"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white ${className}`}
    >
      <Heart
        size={17}
        className={saved ? "fill-brand-500 text-brand-500" : "text-ink-700/70"}
      />
    </button>
  );
}
