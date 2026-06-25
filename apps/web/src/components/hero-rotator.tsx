"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Laptop, Cpu, HardDrive, Headphones, Wifi, MousePointer2 } from "lucide-react";

type Slide = {
  img: string;
  eyebrow: string;
  title: string;
  sub: string;
  cta: { label: string; href: string };
  cta2?: { label: string; href: string };
};

const SLIDES: Slide[] = [
  {
    img: "/hero-1.webp",
    eyebrow: "Online Tech Uganda",
    title: "Genuine Computers, Unbeatable Prices",
    sub: "Laptops, desktops & accessories from UGX 65,000 — warranty, countrywide delivery & Mobile Money.",
    cta: { label: "Shop now", href: "/shop" },
    cta2: { label: "Learn computer basics", href: "/learn" },
  },
  {
    img: "/hero-2.webp",
    eyebrow: "Laptops",
    title: "Laptops for Every Budget",
    sub: "Business, gaming & student laptops — from quality UK-used to brand new.",
    cta: { label: "Shop laptops", href: "/shop?cat=Laptops" },
    cta2: { label: "View gaming", href: "/shop?q=ROG" },
  },
  {
    img: "/hero-3.webp",
    eyebrow: "Accessories & Components",
    title: "Upgrade & Accessorize",
    sub: "RAM, SSDs, chargers, power banks, bags, mice & keyboards — everything for your setup.",
    cta: { label: "Shop accessories", href: "/shop?cat=Accessories" },
    cta2: { label: "RAM & SSD", href: "/shop?cat=Components" },
  },
];

export function HeroRotator() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative min-h-[260px] overflow-hidden rounded text-white sm:min-h-[320px] lg:h-[400px]">
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

      {/* Balanced dark overlay for centered text legibility */}
      <div className="absolute inset-0 bg-ink-900/60" />

      {/* Edge fade — feathers only the outer edges to the navigation colour (no blur) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] rounded"
        style={{ boxShadow: "inset 0 0 60px 18px #131921" }}
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

      {/* Content (centered) */}
      <div className="relative flex h-full flex-col items-center justify-center p-6 text-center sm:p-10">
        <div key={i} className="hero-fade mx-auto max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">{SLIDES[i].eyebrow}</p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight sm:text-4xl">{SLIDES[i].title}</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/85 sm:text-base">{SLIDES[i].sub}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href={SLIDES[i].cta.href} className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
              {SLIDES[i].cta.label} →
            </Link>
            {SLIDES[i].cta2 && (
              <Link href={SLIDES[i].cta2!.href} className="rounded-md border border-white/40 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
                {SLIDES[i].cta2!.label}
              </Link>
            )}
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-brand-400" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
