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
    <div key={i} className="hero-fade relative h-[120px] overflow-hidden rounded-xl bg-gradient-to-br from-ink-700 to-ink-500 text-white shadow-sm sm:h-[160px]">
      {ad.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ad.image_url} alt={ad.title} className="absolute inset-0 h-full w-full object-cover" />
      )}
      {/* Illustrations: soft blobs + diagonal texture for depth (even without an image) */}
      <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 16px)" }}
      />
      {/* Gradient scrim keeps the text readable over any image */}
      {ad.image_url && <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-900/55 to-ink-900/10" />}
      <div className="relative flex h-full min-w-0 flex-col justify-center px-4 sm:px-7">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 sm:text-[11px]">
          Sponsored{ad.advertiser ? ` · ${ad.advertiser}` : ""}
        </span>
        <h3 className="mt-0.5 line-clamp-2 max-w-[78%] text-base font-extrabold leading-tight drop-shadow-sm sm:text-2xl">{ad.title}</h3>
        {ad.description && <p className="mt-0.5 line-clamp-1 hidden max-w-md text-xs text-white/85 sm:block sm:text-sm">{ad.description}</p>}
        {isWebLink(ad.link_url) && (
          <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-ink-900 shadow-sm sm:text-sm">
            Learn more →
          </span>
        )}
      </div>
    </div>
  );

  return (
    <section className="group relative">
      {isWebLink(ad.link_url) ? (
        <a href={ad.link_url} target="_blank" rel="noreferrer" className="block">{banner}</a>
      ) : (
        banner
      )}

      {ads.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => go(1)} aria-label="Next" className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50">
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {ads.map((_, idx) => (
              <button key={idx} onClick={() => setI(idx)} aria-label={`Advert ${idx + 1}`} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-brand-400" : "w-2 bg-white/50 hover:bg-white/80"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
