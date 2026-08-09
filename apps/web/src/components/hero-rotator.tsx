"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Laptop, Cpu, HardDrive, Headphones, Wifi, MousePointer2, ChevronLeft, ChevronRight, Truck, ShieldCheck } from "lucide-react";

type Slide = {
  img: string;
  eyebrow: string;
  title: string;
  sub: string;
  cta: { label: string; href: string };
  cta2?: { label: string; href: string };
};

// Local high-resolution photos — sharp edge-to-edge (no shallow-DoF blur behind
// the text), served instantly with no external dependency.
const SLIDES: Slide[] = [
  {
    img: "/hero/hero-4.jpg", // bright office team on computers
    eyebrow: "Online Tech Uganda",
    title: "Powering Uganda, One Device at a Time",
    sub: "Genuine laptops, desktops & accessories — warranty included, countrywide delivery and easy Mobile Money.",
    cta: { label: "Shop now", href: "/shop" },
    cta2: { label: "Learn computer skills", href: "/learn" },
  },
  {
    img: "/hero/hero-1.jpg", // bright laptop on marble
    eyebrow: "Laptops",
    title: "Find the Perfect Laptop for You",
    sub: "Work, school or gaming — quality UK-used and brand-new machines to fit every budget.",
    cta: { label: "Shop laptops", href: "/shop?cat=Laptops" },
    cta2: { label: "Gaming laptops", href: "/shop?q=ROG" },
  },
  {
    img: "/hero/hero-5.jpg", // two people, bright office
    eyebrow: "Learn & Grow",
    title: "Build Real Computer Skills",
    sub: "Hands-on online courses — computer basics, Microsoft Office, internet & typing, with certificates.",
    cta: { label: "Start learning", href: "/learn" },
    cta2: { label: "Browse courses", href: "/learn" },
  },
  {
    img: "/hero/hero-3.jpg", // bright accessories flat-lay
    eyebrow: "Accessories & Upgrades",
    title: "Level Up Your Setup",
    sub: "Faster SSDs, more RAM, chargers, keyboards, mice & bags — everything to upgrade and personalise your device.",
    cta: { label: "Shop accessories", href: "/shop?cat=Accessories" },
    cta2: { label: "RAM & SSD", href: "/shop?cat=Components" },
  },
  {
    img: "/hero/hero-6.jpg", // team working on laptops
    eyebrow: "IT Services & Support",
    title: "We Keep You Running",
    sub: "Repairs, networking, websites & software — expert IT support for homes, schools and businesses.",
    cta: { label: "Our services", href: "/services" },
    cta2: { label: "Get support", href: "/contact" },
  },
];

export function HeroRotator() {
  const [i, setI] = useState(0);
  const go = (n: number) => setI((v) => (v + n + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="group/hero relative min-h-[300px] overflow-hidden text-white sm:min-h-[320px] sm:rounded-lg sm:shadow-md sm:ring-1 sm:ring-black/5 lg:h-[400px]">
      {/* Slides */}
      {SLIDES.map((s, idx) => (
        <div
          key={s.img}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
          aria-hidden={idx !== i}
        >
          <Image
            src={s.img}
            alt={s.eyebrow}
            fill
            priority={idx === 0}
            sizes="(max-width: 1024px) 100vw, 70vw"
            className={`object-cover ${idx === i ? "animate-kenburns" : ""}`}
          />
        </div>
      ))}

      {/* Bright by default — only a soft pool behind the centred text is darkened,
          so the photo stays bright and clear everywhere else. */}
      <div className="absolute inset-0 bg-ink-900/20" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 48%, rgba(12,10,26,0.6) 0%, rgba(12,10,26,0.14) 55%, transparent 76%)",
        }}
      />

      {/* Light edge feather */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] rounded-lg"
        style={{ boxShadow: "inset 0 0 30px 4px rgba(19,25,33,0.32)" }}
      />

      {/* Subtle brand glow at the corners (kept faint so it doesn't haze the photo) */}
      <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-blob rounded-full bg-brand-500/15 blur-3xl" />
      <span className="pointer-events-none absolute -left-10 bottom-[-30px] h-40 w-40 animate-blob-slow rounded-full bg-brand-400/10 blur-3xl" />

      {/* Floating tech illustrations */}
      <Laptop className="pointer-events-none absolute left-6 top-10 hidden h-10 w-10 animate-blob-slow text-white/15 lg:block" />
      <Cpu className="pointer-events-none absolute left-16 bottom-12 hidden h-8 w-8 animate-blob text-white/15 lg:block" />
      <HardDrive className="pointer-events-none absolute right-10 top-14 hidden h-9 w-9 animate-blob-slow text-white/15 lg:block" />
      <Headphones className="pointer-events-none absolute right-16 bottom-14 hidden h-8 w-8 animate-blob text-white/15 lg:block" />
      <Wifi className="pointer-events-none absolute left-1/2 top-6 hidden h-7 w-7 animate-blob text-white/12 lg:block" />
      <MousePointer2 className="pointer-events-none absolute right-1/3 bottom-6 hidden h-7 w-7 animate-blob-slow text-white/12 lg:block" />
      <span className="pointer-events-none absolute right-12 top-10 hidden h-2.5 w-2.5 animate-ping rounded-full bg-brand-300 lg:block" />
      <span className="pointer-events-none absolute left-12 bottom-16 hidden h-2 w-2 animate-pulse rounded-full bg-white/70 lg:block" />

      {/* Prev / Next arrows (appear on hover, always tappable on touch) */}
      {/* Arrows on desktop only (hover) — on mobile the dots + auto-rotate handle
          navigation, and arrows would overlap the text. */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 lg:flex lg:opacity-0 lg:group-hover/hero:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 lg:flex lg:opacity-0 lg:group-hover/hero:opacity-100"
      >
        <ChevronRight size={20} />
      </button>

      {/* Content (centered) */}
      <div className="relative flex h-full flex-col items-center justify-center p-6 text-center sm:p-10">
        <div key={i} className="hero-fade mx-auto max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-300 ring-1 ring-white/15 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> {SLIDES[i].eyebrow}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] sm:text-4xl">{SLIDES[i].title}</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)] sm:text-base">{SLIDES[i].sub}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Link href={SLIDES[i].cta.href} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-600 hover:shadow-brand-900/50">
              {SLIDES[i].cta.label} →
            </Link>
            {SLIDES[i].cta2 && (
              <Link href={SLIDES[i].cta2!.href} className="rounded-lg border border-white/40 bg-white/5 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15">
                {SLIDES[i].cta2!.label}
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-white/75">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-brand-300" /> Genuine & warranted</span>
            <span className="flex items-center gap-1.5"><Truck size={14} className="text-brand-300" /> Countrywide delivery</span>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-brand-400" : "w-2 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
