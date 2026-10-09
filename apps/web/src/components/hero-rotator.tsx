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
    img: "/hero/shop-shelves.webp",
    // An upright photograph in a wide slide: keep the lit shelves and the desk.
    pos: "object-[center_58%]",
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
  // The slide just left. It stays whole underneath while the next fades in
  // over it; fading both at once showed two headlines through each other.
  const [prev, setPrev] = useState(0);
  const n = SLIDES.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const t = setTimeout(() => setPrev(i), 750);
    return () => clearTimeout(t);
  }, [i]);

  // Auto-advance; pauses is handled by resetting the timer on manual change.
  useEffect(() => {
    // Snappier — a hero that lingers gets scrolled past unseen.
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n, i]);

  // Only the slide on show and the one after it carry their photograph. All
  // four used to load with the page, three of them for slides nobody had
  // reached yet, competing with the product pictures below.
  const near = (idx: number) => idx === i || idx === prev || idx === (i + 1) % n;

  return (
    <div className="group/hero relative h-[460px] overflow-hidden sm:h-[520px] xl:h-[600px]">
      {SLIDES.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 bg-ink-800 ${
            idx === i
              ? "z-[2] opacity-100 transition-opacity duration-700"
              : idx === prev
                ? "pointer-events-none z-[1] opacity-100"
                : "pointer-events-none z-0 opacity-0"
          }`}
          aria-hidden={idx !== i}
        >
          {/* The photograph fills the slide; the words sit over it. */}
          {near(idx) && <Image src={s.img} alt="" fill priority={idx === 0} sizes="100vw" className={`object-cover ${"pos" in s ? s.pos : ""}`} />}
          <div className="absolute inset-0 bg-ink-900/45" />

          {/* Only the slide on show has words: the one underneath keeps its
              photograph while the next fades in, but not its headline. */}
          <div className={`relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white ${idx === i ? "" : "invisible"}`}>
            <p className="font-display text-[18px] italic text-white/95 sm:text-[21px]">{s.eyebrow}</p>
            <SlideHeading first={idx === 0} className="mt-2 max-w-4xl font-display text-[40px] leading-[1.08] [text-shadow:0_2px_10px_rgba(0,0,0,0.35)] sm:text-[58px] xl:text-[68px]">
              {s.title}
            </SlideHeading>
            <p className="mt-3 max-w-xl text-[17px] text-white/95 sm:text-[20px]">{s.sub}</p>
            <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
              <Link
                href={s.href}
                className="press inline-flex items-center justify-center gap-1.5 bg-brand-500 px-9 py-4 text-[13px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-brand-600"
              >
                {s.cta}
              </Link>
              <span className="inline-flex items-center justify-center border border-white px-9 py-4 text-[13px] font-bold uppercase tracking-[0.16em] text-white">
                {s.pill}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition hover:bg-white group-hover/hero:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition hover:bg-white group-hover/hero:opacity-100"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
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
