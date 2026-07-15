"use client";

import { useEffect, useState } from "react";

type Advert = {
  id: number;
  title: string;
  advertiser: string;
  description: string;
  image_url: string;
  link_url: string;
};

/** Vertical advert stack that fills the space below the shop filters (desktop only). */
export function ShopSidebarAdverts({ className = "" }: { className?: string }) {
  const [ads, setAds] = useState<Advert[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/_api/adverts?placement=sidebar", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setAds(data);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <div className={`mt-3 space-y-3 ${className}`}>
      <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-ink-700/40">Sponsored</p>

      {ads.map((ad) => {
        const card = (
          <div className="overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md">
            {ad.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ad.image_url} alt={ad.title} className="h-32 w-full object-cover" />
            )}
            <div className="p-3">
              {ad.advertiser && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-brand-500">{ad.advertiser}</span>
              )}
              <h4 className="text-sm font-extrabold leading-tight text-ink-900">{ad.title}</h4>
              {ad.description && <p className="mt-1 line-clamp-2 text-xs text-ink-700/60">{ad.description}</p>}
              {ad.link_url && (
                <span className="mt-2 inline-block rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white">
                  Learn more →
                </span>
              )}
            </div>
          </div>
        );
        return ad.link_url ? (
          <a key={ad.id} href={ad.link_url} target="_blank" rel="noreferrer" className="block">
            {card}
          </a>
        ) : (
          <div key={ad.id}>{card}</div>
        );
      })}

      {/* Always show the "advertise with us" prompt so the space is never empty. */}
      <a
        href="/advertise"
        className="block rounded-lg border border-dashed border-ink-600/25 bg-white/60 p-4 text-center text-xs font-semibold text-ink-700/60 transition hover:border-brand-300 hover:text-brand-600"
      >
        📢 Advertise your business here
      </a>
    </div>
  );
}
