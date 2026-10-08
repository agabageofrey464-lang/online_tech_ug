"use client";

import { useEffect, useState } from "react";

/**
 * A product's rating, from the reviews customers have actually left.
 *
 * Every card used to print a star score and a count — "★ 4.9 (74)" — and the
 * count was arithmetic on the product's name. Nobody had written those
 * reviews; the site had no way to collect one. This reads the real figures
 * from the API, and a product that has not been reviewed shows nothing on its
 * card rather than a number that was never true.
 *
 * One request serves the whole page: the summary for every reviewed product
 * comes back in a single small reply, shared by every card that asks.
 */

export type RatingSummary = { average: number; count: number };

let cache: Promise<Record<string, RatingSummary>> | null = null;

export function loadRatings(): Promise<Record<string, RatingSummary>> {
  cache ??= fetch("/_api/reviews/summary")
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return cache;
}

/** Forget what was loaded — after a visitor submits a review, say. */
export function refreshRatings() {
  cache = null;
}

export function useRating(slug: string): RatingSummary | null {
  const [rating, setRating] = useState<RatingSummary | null>(null);
  useEffect(() => {
    let alive = true;
    loadRatings().then((all) => {
      if (alive) setRating(all[slug] ?? null);
    });
    return () => {
      alive = false;
    };
  }, [slug]);
  return rating;
}

/** The line on a product card: one gold star, the score, how many reviews. */
export function ProductRating({ slug, className = "" }: { slug: string; className?: string }) {
  const rating = useRating(slug);
  if (!rating || rating.count === 0) return null;
  return (
    <span className={`flex items-center gap-1 text-[12.5px] leading-none ${className}`}>
      <span className="text-[14px] leading-none text-[#f15a29]">★</span>
      <span className="font-bold text-ink-900">{rating.average.toFixed(1)}</span>
      <span className="text-ink-700/50">({rating.count.toLocaleString()})</span>
    </span>
  );
}
