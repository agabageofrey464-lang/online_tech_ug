"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Store, Cpu } from "lucide-react";

// Jumia-style promotional banner slides. Solid brand-coloured panels with a
// headline, a deal pill and a framed photo — kept in Online Tech Uganda's own
// colours (orange / indigo) and copy.
// A page has one main heading. Every slide used to be an <h1>, so the home
// page had several and a search engine could not tell which named the page.
function SlideHeading({ first, ...rest }: { first: boolean } & React.HTMLAttributes<HTMLHeadingElement>) {
  return first ? <h1 {...rest} /> : <p {...rest} />;
}

const SLIDES = [
  {
    bg: "from-ink-500 via-ink-600 to-ink-700",
    eyebrow: "Genuine & warranted",
    title: "Powering Uganda, One Device at a Time",
    sub: "Laptops, desktops & accessories — warranty included, countrywide delivery.",
    pill: "Easy Mobile Money",
    cta: "Shop now",
    href: "/shop",
    img: "/hero/shop-floor.webp",
    icon: ShieldCheck,
  },
  {
    bg: "from-ink-600 via-ink-700 to-ink-700",
    eyebrow: "Repairs & IT support",
    title: "Fast, Reliable Tech Support",
    sub: "Laptops, desktops & networks — onsite & remote, done right.",
    pill: "From UGX 30,000",
    cta: "Book a repair",
    href: "/services",
    img: "/hero/hero-5.webp",
    icon: Truck,
  },
  {
    bg: "from-ink-700 via-ink-600 to-ink-700",
    eyebrow: "Marketplace",
    title: "Buy & Sell on our Marketplace",
    sub: "Shop trusted vendors, or list your own products and reach more buyers.",
    pill: "Verified vendors",
    cta: "Explore marketplace",
    href: "/marketplace",
    img: "/hero/hero-6.webp",
    icon: Store,
  },
  {
    bg: "from-ink-500 via-ink-600 to-ink-700",
    eyebrow: "Upgrades & accessories",
    title: "Boost Your PC — RAM, SSDs & More",
    sub: "Genuine memory, storage, power and accessories to speed up any machine.",
    pill: "Brand new stock",
    cta: "Shop upgrades",
    href: "/shop?cat=Components",
    img: "/hero/hero-3.webp",
    icon: Cpu,
  },
];

export function HeroRotator() {
  const [i, setI] = useState(0);
  const n = SLIDES.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  // Auto-advance; pauses is handled by resetting the timer on manual change.
  useEffect(() => {
    // Snappier — a hero that lingers gets scrolled past unseen.
    const t = setInterval(() => setI((v) => (v + 1) % n), 4000);
    return () => clearInterval(t);
  }, [n, i]);

  return (
    <div className="group/hero relative min-h-[440px] overflow-hidden sm:min-h-[320px] lg:h-[400px]">
      {SLIDES.map((s, idx) => (
        <div
          key={idx}
          // A light panel on a desktop — the photograph carries the colour. A phone
          // keeps the photograph full-bleed behind white text.
          className={`absolute inset-0 bg-ink-700 transition-opacity duration-700 sm:bg-[var(--tile)] ${
            idx === i ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={idx !== i}
        >
          {/* Mobile: full-bleed photo with a dark scrim (desktop uses the framed photo). */}
          <div className="absolute inset-0 sm:hidden">
            <Image src={s.img} alt="" fill priority={idx === 0} sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-ink-900/45" />
          </div>

          <div className="relative z-10 grid h-full min-h-[440px] grid-cols-1 items-center gap-4 p-6 sm:min-h-0 sm:grid-cols-2 sm:p-10">
            {/* Text */}
            <div className="mx-auto max-w-md text-center text-white sm:mx-0 sm:text-left sm:text-ink-900">
              <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ring-1 ring-white/20 sm:inline-flex sm:rounded-none sm:bg-transparent sm:px-0 sm:text-brand-600 sm:ring-0">
                <s.icon size={13} /> {s.eyebrow}
              </span>
              <SlideHeading first={idx === 0} className="mt-3 font-display text-[40px] leading-[1.08] [text-shadow:0_2px_10px_rgba(0,0,0,0.35)] sm:text-[44px] sm:[text-shadow:none]">
                {s.title}
              </SlideHeading>
              <p className="mx-auto mt-3 max-w-sm text-[17px] text-white/95 sm:mx-0 sm:text-base sm:text-ink-700">{s.sub}</p>
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href={s.href}
                  className="press inline-flex items-center justify-center gap-1.5 bg-white px-7 py-4 text-[13px] sm:py-3 sm:text-[12px] font-bold uppercase tracking-[0.14em] text-ink-900 transition hover:bg-white/90 sm:bg-ink-600 sm:text-white sm:hover:bg-ink-700"
                >
                  {s.cta} <ChevronRight size={16} />
                </Link>
                <span className="bg-white px-3 py-4 text-center text-[13px] font-bold uppercase tracking-[0.14em] text-ink-900 sm:rounded-full sm:py-1.5 sm:text-xs sm:normal-case sm:tracking-normal sm:ring-1 sm:ring-ink-600/15">
                  {s.pill}
                </span>
              </div>
            </div>

            {/* Framed photo (desktop) */}
            <div className="relative hidden h-[86%] overflow-hidden sm:block">
              <Image
                src={s.img}
                alt=""
                fill
                priority={idx === 0}
                sizes="(max-width: 1024px) 45vw, 34vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition hover:bg-white group-hover/hero:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition hover:bg-white group-hover/hero:opacity-100"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-5 bg-white sm:bg-ink-600" : "w-2 bg-white/50 hover:bg-white/80 sm:bg-ink-600/25 sm:hover:bg-ink-600/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
