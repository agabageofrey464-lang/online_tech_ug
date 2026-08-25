"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Big campaign banners ("Don't Miss Out!") — bold badge, headline, a white offer
// pill and a photo panel. Colours come from the Online Tech Uganda palette.
const BANNERS = [
  {
    badge: "Super Saver",
    badgeSub: "Sale",
    dates: "This Month",
    title: "Enjoy FREE Setup",
    pill: "ON LAPTOPS OVER UGX 1M",
    note: "Windows, Office & antivirus installed free",
    small: "T&Cs Apply",
    cta: "Shop laptops",
    href: "/shop?cat=Laptops",
    bg: "bg-[#6d28d9]",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-1.jpg",
  },
  {
    badge: "Storage",
    badgeSub: "Week",
    dates: "Limited stock",
    title: "1TB SSD Deals",
    pill: "FROM UGX 580,000",
    note: "Genuine Samsung, Kingston, Crucial & WD",
    small: "While stocks last",
    cta: "Shop storage",
    href: "/shop?cat=Storage",
    bg: "bg-[#0e7490]",
    panel: "bg-[#22d3ee]",
    img: "/hero/hero-3.jpg",
  },
  {
    badge: "Learn",
    badgeSub: "& Earn",
    dates: "22 courses",
    title: "Start Learning Free",
    pill: "1ST LESSON ON US",
    note: "Certificates you keep · pay per lesson from 5K",
    small: "Online, at your pace",
    cta: "Browse courses",
    href: "/learn",
    bg: "bg-[#c41c2e]",
    panel: "bg-[#fb7185]",
    img: "/hero/hero-4.jpg",
  },
  {
    badge: "Repairs",
    badgeSub: "& Support",
    dates: "Same day",
    title: "Fix It Today",
    pill: "FROM UGX 30,000",
    note: "Laptops, desktops & networks — onsite or remote",
    small: "Free diagnosis",
    cta: "Book a repair",
    href: "/services#repairs-support",
    bg: "bg-[#f15a29]",
    panel: "bg-[#282363]",
    img: "/hero/hero-5.jpg",
  },
  {
    badge: "Sell",
    badgeSub: "With Us",
    dates: "Free to join",
    title: "Open Your Shop",
    pill: "REACH MORE BUYERS",
    note: "List your products on our marketplace today",
    small: "Verified vendors only",
    cta: "Start selling",
    href: "/sell",
    bg: "bg-[#00a651]",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-6.jpg",
  },
];

export function PromoBanners() {
  const [i, setI] = useState(0);
  const n = BANNERS.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const t = setTimeout(() => setI((v) => (v + 1) % n), 6000);
    return () => clearTimeout(t);
  }, [i, n]);

  const b = BANNERS[i];

  return (
    <section>
      <h2 className="mb-2 text-base font-extrabold text-ink-900 sm:text-lg">Don&apos;t Miss Out!</h2>

      <div className="group/promo relative overflow-hidden rounded-lg shadow-sm">
        <div className={`relative flex min-h-[190px] transition-colors duration-500 sm:min-h-[260px] ${b.bg}`}>
          {/* Soft wave texture, like a printed campaign board */}
          <span
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "repeating-linear-gradient(115deg, #fff 0 3px, transparent 3px 22px)" }}
          />

          {/* Copy */}
          <div key={i} className="ad-fade relative z-10 flex flex-1 flex-col justify-center gap-2 p-5 text-white sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-ink-900 sm:text-xs">
                {b.badge}
              </span>
              <span className="font-display text-lg font-black uppercase leading-none tracking-tight sm:text-2xl">
                {b.badgeSub}
              </span>
              <span className="rounded-full border border-white/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-[11px]">
                {b.dates}
              </span>
            </div>

            <h3 className="font-display text-2xl font-black leading-none tracking-tight drop-shadow-sm sm:text-4xl">
              {b.title}
            </h3>

            <span className="w-fit rounded-full bg-white px-4 py-1.5 text-sm font-black uppercase tracking-tight text-ink-900 shadow-sm sm:px-6 sm:py-2 sm:text-lg">
              {b.pill}
            </span>

            <p className="max-w-md text-xs text-white/90 sm:text-sm">{b.note}</p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Link
                href={b.href}
                className="press rounded-full bg-white px-5 py-2 text-xs font-extrabold text-ink-900 shadow-sm transition hover:bg-white/90 sm:text-sm"
              >
                {b.cta} →
              </Link>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">{b.small}</span>
            </div>
          </div>

          {/* Photo panel (desktop) */}
          <div className={`relative hidden w-[38%] shrink-0 sm:block ${b.panel}`}>
            <Image
              src={b.img}
              alt=""
              fill
              sizes="38vw"
              className="object-cover mix-blend-multiply opacity-90"
            />
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous banner"
          className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition hover:bg-white group-hover/promo:opacity-100"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next banner"
          className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition hover:bg-white group-hover/promo:opacity-100"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-5 z-20 flex items-center gap-1.5 sm:left-8">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Banner ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
