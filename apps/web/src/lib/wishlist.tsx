"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type WishlistState = {
  slugs: string[];
  count: number;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistState | null>(null);
const STORAGE_KEY = "otu_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSlugs(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }, [slugs, hydrated]);

  const value = useMemo<WishlistState>(
    () => ({
      slugs,
      count: slugs.length,
      has: (slug) => slugs.includes(slug),
      toggle: (slug) =>
        setSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev])),
      remove: (slug) => setSlugs((prev) => prev.filter((s) => s !== slug)),
      clear: () => setSlugs([]),
    }),
    [slugs],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
