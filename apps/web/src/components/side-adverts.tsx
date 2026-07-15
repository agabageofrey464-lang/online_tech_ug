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

// Only real http(s) links open on "Learn more" — never image/upload URLs.
function isWebLink(url: string) {
  if (!url) return false;
  if (/\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(url)) return false;
  if (/\/uploads\/|\/_next\/image/i.test(url)) return false;
  return /^https?:\/\//i.test(url);
}

function AdCard({ ad }: { ad: Advert }) {
  const inner = (
    <div className="overflow-hidden rounded-xl bg-gradient-to-br from-ink-700 to-ink-500 text-white shadow-lg ring-1 ring-black/5">
      {ad.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ad.image_url} alt={ad.title} className="h-28 w-full object-cover" />
      )}
      <div className="p-2.5">
        <p className="truncate text-[9px] font-bold uppercase tracking-wide text-brand-300">
          Sponsored{ad.advertiser ? ` · ${ad.advertiser}` : ""}
        </p>
        <p className="clamp-2 mt-0.5 text-xs font-extrabold leading-tight">{ad.title}</p>
        {isWebLink(ad.link_url) && (
          <span className="mt-1.5 inline-block rounded bg-brand-500 px-2 py-0.5 text-[10px] font-bold">Learn more →</span>
        )}
      </div>
    </div>
  );
  return isWebLink(ad.link_url) ? (
    <a href={ad.link_url} target="_blank" rel="noreferrer" className="block transition hover:opacity-95">{inner}</a>
  ) : (
    inner
  );
}

/** Fixed left & right rotating advert skyscrapers (placement "sidebar"). Only
 *  on very wide screens where there's gutter room; hidden otherwise. */
export function SideAdverts() {
  const [ads, setAds] = useState<Advert[]>([]);
  const [i, setI] = useState(0);

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

  useEffect(() => {
    if (ads.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % ads.length), 6000);
    return () => clearInterval(t);
  }, [ads.length]);

  if (ads.length === 0) return null;
  const left = ads[i];
  const right = ads[(i + 1) % ads.length];

  return (
    <>
      <aside className="fixed left-3 top-28 z-30 hidden w-40 min-[1600px]:block">
        <AdCard ad={left} />
      </aside>
      <aside className="fixed right-3 top-28 z-30 hidden w-40 min-[1600px]:block">
        <AdCard ad={right} />
      </aside>
    </>
  );
}
