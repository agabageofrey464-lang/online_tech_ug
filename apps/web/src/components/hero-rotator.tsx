"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Store, Cpu } from "lucide-react";

// Jumia-style promotional banner slides. Solid brand-coloured panels with a
// headline, a deal pill and a framed photo — kept in Online Tech Uganda's own
// colours (orange / indigo) and copy.
const SLIDES = [
  {
    bg: "from-brand-500 via-brand-600 to-brand-700",
    eyebrow: "Genuine & warranted",
    title: "Powering Uganda, One Device at a Time",
    sub: "Laptops, desktops & accessories — warranty included, countrywide delivery.",
    pill: "Easy Mobile Money",
    cta: "Shop now",
    href: "/shop",
    img: "/hero/hero-1.webp",
    icon: ShieldCheck,
  },
  {
    bg: "from-brand-600 via-brand-700 to-ink-700",
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
    bg: "from-ink-700 via-ink-600 to-brand-700",
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
    bg: "from-brand-500 via-brand-600 to-ink-700",
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
    <div className="group/hero relative min-h-[280px] overflow-hidden rounded-lg shadow-md ring-1 ring-black/5 sm:min-h-[320px] lg:h-[400px]">
      {SLIDES.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-opacity duration-700 ${
            idx === i ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={idx !== i}
        >
          {/* Mobile: full-bleed photo with a dark scrim (desktop uses the framed photo). */}
          <div className="absolute inset-0 sm:hidden">
            <Image src={s.img} alt="" fill priority={idx === 0} sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/40" />
          </div>

          <div className="relative z-10 grid h-full grid-cols-1 items-center gap-4 p-6 sm:grid-cols-2 sm:p-10">
            {/* Text */}
            <div className="max-w-md text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ring-1 ring-white/20">
                <s.icon size={13} /> {s.eyebrow}
              </span>
              <h1 className="mt-3 text-2xl font-black leading-tight [text-shadow:0_2px_10px_rgba(0,0,0,0.35)] sm:text-4xl">
                {s.title}
              </h1>
              <p className="mt-2 max-w-sm text-sm text-white/90 sm:text-base">{s.sub}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={s.href}
                  className="press inline-flex items-center gap-1.5 rounded-lg bg-white px-6 py-2.5 text-sm font-extrabold text-ink-900 shadow-lg transition hover:bg-white/90"
                >
                  {s.cta} <ChevronRight size={16} />
                </Link>
                <span className="rounded-full bg-black/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15">
                  {s.pill}
                </span>
              </div>
            </div>

            {/* Framed photo (desktop) */}
            <div className="relative hidden h-[70%] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/25 sm:block">
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
            className={`h-2 rounded-full transition-all ${idx === i ? "w-5 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </div>
  );
}
