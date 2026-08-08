"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

/** Homepage sponsored banner — admin adverts (placement "home"), auto-rotating like Jumia. */
export function HomeAdverts() {
  const [ads, setAds] = useState<Advert[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/_api/adverts?placement=home", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setAds(data);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // Auto-rotate through the adverts.
  useEffect(() => {
    if (ads.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % ads.length), 4500);
    return () => clearInterval(t);
  }, [ads.length]);

  if (ads.length === 0) return null;
  const go = (n: number) => setI((v) => (v + n + ads.length) % ads.length);
  const ad = ads[i];

  const banner = (
    /* Full-bleed strip on phones (square edges, screen-wide); a rounded card
       from tablets up. */
    <div key={i} className="hero-fade relative h-[150px] overflow-hidden bg-gradient-to-br from-ink-700 to-ink-500 text-white sm:h-[160px] sm:rounded-xl sm:shadow-md sm:ring-1 sm:ring-ink-900/5">
      {ad.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ad.image_url} alt={ad.title} className="animate-kenburns-loop absolute inset-0 h-full w-full object-cover" />
      )}
      {/* Illustrations: drifting blobs + diagonal texture for depth (even without an image) */}
      <span className="animate-blob pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      <span className="animate-blob-slow pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 16px)" }}
      />
      {/* Gradient scrim keeps the text readable over any image. Darker on
          phones, where the text sits over more of the picture. */}
      {ad.image_url && (
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/70 to-ink-900/25 sm:from-ink-900/90 sm:via-ink-900/55 sm:to-ink-900/10" />
      )}
      <div className="relative flex h-full min-w-0 flex-col justify-center px-4 sm:px-7">
        <span className="inline-flex w-fit items-center rounded-full bg-brand-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white sm:text-[10px]">
          Sponsored{ad.advertiser ? ` · ${ad.advertiser}` : ""}
        </span>
        <h3 className="mt-1.5 line-clamp-2 max-w-[85%] text-[17px] font-extrabold leading-tight drop-shadow sm:max-w-[78%] sm:text-2xl">
          {ad.title}
        </h3>
        {ad.description && (
          <p className="mt-1 line-clamp-1 max-w-md text-[11px] text-white/80 sm:text-sm">{ad.description}</p>
        )}
        {isWebLink(ad.link_url) && (
          <span className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-500 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-brand-500/30 transition group-hover:bg-brand-600 sm:text-sm">
            Learn more <span aria-hidden>→</span>
          </span>
        )}
      </div>
    </div>
  );

  return (
    /* bleed-wide cancels the container gutter so the advert reaches both screen
       edges on mobile; from tablets up it sits back inside the layout. */
    <section className="group relative bleed-wide sm:mx-0">
      {isWebLink(ad.link_url) ? (
        <a href={ad.link_url} target="_blank" rel="noreferrer" className="block">{banner}</a>
      ) : (
        banner
      )}

      {ads.length > 1 && (
        <>
          {/* Arrows on tablet/desktop only — on phones they crowd the banner
              edges, so the dots and auto-rotation carry it instead. */}
          <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 sm:flex">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => go(1)} aria-label="Next" className="absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 sm:flex">
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2.5 right-4 flex gap-1.5 rounded-full bg-black/25 px-2 py-1 backdrop-blur-sm sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            {ads.map((_, idx) => (
              <button key={idx} onClick={() => setI(idx)} aria-label={`Advert ${idx + 1}`} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-brand-400" : "w-2 bg-white/60 hover:bg-white/90"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
