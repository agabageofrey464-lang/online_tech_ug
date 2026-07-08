"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const MAX = 12;

type RecentlyViewedState = {
  slugs: string[];
  track: (slug: string) => void;
  clear: () => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedState | null>(null);
const STORAGE_KEY = "otu_recently_viewed_v1";

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
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

  const track = useCallback((slug: string) => {
    setSlugs((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX));
  }, []);

  const value = useMemo<RecentlyViewedState>(
    () => ({ slugs, track, clear: () => setSlugs([]) }),
    [slugs, track],
  );

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}
