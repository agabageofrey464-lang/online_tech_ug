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

// Sharp, high-resolution hero photos (w=1920) so the Ken Burns zoom stays crisp.
const SLIDES: Slide[] = [
  {
    img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1920&q=80",
    eyebrow: "Online Tech Uganda",
    title: "Powering Uganda, One Device at a Time",
    sub: "Genuine laptops, desktops & accessories — warranty included, countrywide delivery and easy Mobile Money.",
    cta: { label: "Shop now", href: "/shop" },
    cta2: { label: "Learn computer skills", href: "/learn" },
  },
  {
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1920&q=80",
    eyebrow: "Laptops",
    title: "Find the Perfect Laptop for You",
    sub: "Work, school or gaming — quality UK-used and brand-new machines to fit every budget.",
    cta: { label: "Shop laptops", href: "/shop?cat=Laptops" },
    cta2: { label: "Gaming laptops", href: "/shop?q=ROG" },
  },
  {
    img: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1920&q=80",
    eyebrow: "Accessories & Upgrades",
    title: "Level Up Your Setup",
    sub: "Faster SSDs, more RAM, chargers, keyboards, mice & bags — everything to upgrade and personalise your device.",
    cta: { label: "Shop accessories", href: "/shop?cat=Accessories" },
    cta2: { label: "RAM & SSD", href: "/shop?cat=Components" },
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
    <div className="group/hero relative min-h-[260px] overflow-hidden rounded-lg text-white shadow-md ring-1 ring-black/5 sm:min-h-[320px] lg:h-[400px]">
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

      {/* Lighter overlay so the bright accessory photos show through; scrim only where text sits */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink-900/55 via-ink-900/25 to-brand-900/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/65 via-transparent to-transparent" />

      {/* Edge vignette — feathers the outer edges to the navigation colour */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] rounded-lg"
        style={{ boxShadow: "inset 0 0 70px 20px #131921" }}
      />

      {/* Decorative animated graphics */}
      <span className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 animate-blob rounded-full bg-brand-500/30 blur-3xl" />
      <span className="pointer-events-none absolute -left-10 bottom-[-30px] h-44 w-44 animate-blob-slow rounded-full bg-brand-400/20 blur-3xl" />

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
      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 lg:opacity-0 lg:group-hover/hero:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 lg:opacity-0 lg:group-hover/hero:opacity-100"
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
