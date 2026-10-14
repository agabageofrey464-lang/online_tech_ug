"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { whatsappLink } from "@/lib/site";
import { ChevronLeft, ChevronRight } from "lucide-react";

// A page has one main heading. Every slide used to be an <h1>, so the home
// page had several; only the first slide is one now.
function SlideHeading({ first, ...rest }: { first: boolean; className?: string; children: ReactNode }) {
  return first ? <h1 {...rest} /> : <p {...rest} />;
}

type Slide = {
  tab: string;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  more: { label: string; href: string };
  img: string;
  pos: string;
  /** Set on an advertiser's slide: its picture comes from outside the site. */
  ad?: boolean;
};

/* ─── Adverts ─────────────────────────────────────────────────────
   An advert the owner has placed in the hero takes a turn among the service
   slides and is drawn the same way: its picture across the whole hero, and
   its words over it. */

type Advert = { id: number; title: string; advertiser: string; description: string; image_url: string; link_url: string; category: string };

// Only a real web address opens from the button — never an image or upload URL.
const isWebLink = (url: string) => /^https?:\/\//i.test(url) && !/\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(url) && !/\/uploads\/|\/_next\/image/i.test(url);

function adSlide(ad: Advert): Slide {
  const name = ad.advertiser || "Sponsored";
  return {
    tab: name.length > 18 ? `${name.slice(0, 17)}…` : name,
    eyebrow: `Sponsored · ${name}`,
    title: ad.title,
    sub: ad.description,
    cta: "Learn more",
    href: isWebLink(ad.link_url) ? ad.link_url : whatsappLink(`Hello Online Tech Uganda, I saw the advert "${ad.title}" by ${name} on your site and would like to know more.`),
    more: { label: "Advertise here", href: "/advertise" },
    img: ad.image_url,
    pos: "",
    ad: true,
  };
}

/** A link that leaves the site in a new tab, or stays in it. */
function Go({ href, children, ...rest }: { href: string; children: ReactNode; className?: string; onMouseEnter?: () => void; onFocus?: () => void; "aria-label"?: string; "aria-current"?: boolean }) {
  return /^https?:/i.test(href) ? (
    <a href={href} target="_blank" rel="noopener sponsored" {...rest}>
      {children}
    </a>
  ) : (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

const SLIDES: Slide[] = [
  {
    tab: "Shop",
    eyebrow: "Shop · genuine & warranted",
    title: "Powering Uganda, One Device at a Time",
    sub: "Phones, laptops, desktops & accessories — tested, with warranty and countrywide delivery.",
    cta: "Shop now",
    href: "/shop",
    more: { label: "Find my laptop", href: "/find" },
    img: "/hero/shop-shelves.webp",
    pos: "object-[center_58%]",
  },
  {
    tab: "Learn Academy",
    eyebrow: "Learn Academy",
    title: "Real Computer Skills, Lesson By Lesson",
    sub: "22 courses in short video lessons. Pay per lesson, in class or online, and earn a certificate.",
    cta: "Browse courses",
    href: "/learn",
    more: { label: "My academy", href: "/academy" },
    img: "/web/photo-1509062522246-3755977927d7.webp",
    pos: "",
  },
  {
    tab: "Software",
    eyebrow: "Software development",
    title: "Websites, Apps & Systems Built For You",
    sub: "From a first website to a full business system — designed, built, hosted and looked after.",
    cta: "Start a project",
    href: "/development",
    more: { label: "See our work", href: "/portfolio" },
    img: "/hero/hero-6.webp",
    pos: "",
  },
  {
    tab: "Repairs",
    eyebrow: "Repairs & IT support",
    title: "Fast, Reliable Tech Support",
    sub: "Laptops, desktops & networks — free diagnosis, onsite or remote, done right.",
    cta: "Book a repair",
    href: "/services#repairs-support",
    more: { label: "All services", href: "/services" },
    img: "/hero/hero-5.webp",
    pos: "",
  },
  {
    tab: "Internships",
    eyebrow: "Internships",
    title: "Industrial Training, On Real Client Work",
    sub: "Online placements for university and college students, with signed letters.",
    cta: "Apply for a place",
    href: "/internship",
    more: { label: "How it works", href: "/internship" },
    img: "/web/photo-1523240795612-9a054b0db644.webp",
    pos: "",
  },
];

/** How long a slide stays. */
const STAY = 6500;

/** `heading` is false where the page already has its main heading above the hero. */
export function HeroRotator({ heading = true }: { heading?: boolean }) {
  const [i, setI] = useState(0);
  // The slide just left. It stays whole underneath while the next fades in
  // over it; fading both at once showed two headlines through each other.
  const [prev, setPrev] = useState(0);
  // Adverts placed in the hero from the dashboard. They join after the page
  // has loaded, so the first slide a visitor sees is always one of ours.
  const [ads, setAds] = useState<Advert[]>([]);
  useEffect(() => {
    let live = true;
    fetch("/_api/adverts?placement=hero", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => live && Array.isArray(d) && setAds(d.slice(0, 6)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  // One advert after every two of our own slides, so neither crowds out the other.
  const slides = useMemo(() => {
    if (ads.length === 0) return SLIDES;
    const out: Slide[] = [];
    let a = 0;
    SLIDES.forEach((s, k) => {
      out.push(s);
      if (k % 2 === 1 && a < ads.length) out.push(adSlide(ads[a++]));
    });
    while (a < ads.length) out.push(adSlide(ads[a++]));
    return out;
  }, [ads]);
  const n = slides.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const t = setTimeout(() => setPrev(i), 750);
    return () => clearTimeout(t);
  }, [i]);

  // Auto-advance; resetting the timer on a manual change gives that slide its full time.
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % n), STAY);
    return () => clearInterval(t);
  }, [n, i]);

  // Only the slide on show, the one it replaced and the one after carry a photograph.
  const near = (idx: number) => idx === i || idx === prev || idx === (i + 1) % n;

  // A banner from edge to edge, as the big home stores run theirs: the
  // photograph behind, the headline large and centred in capitals, one solid
  // button, and the dots beneath the banner rather than on it.
  return (
    <div>
    <div className="group/hero relative h-[420px] overflow-hidden bg-ink-900 sm:h-[400px] xl:h-[440px]">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 bg-ink-900 ${
            idx === i
              ? "z-[2] opacity-100 transition-opacity duration-700"
              : idx === prev
                ? "pointer-events-none z-[1] opacity-100"
                : "pointer-events-none z-0 opacity-0"
          }`}
          aria-hidden={idx !== i}
        >
          {near(idx) &&
            (s.ad ? (
              // eslint-disable-next-line @next/next/no-img-element
              s.img && <img src={s.img} alt={s.title} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Image src={s.img} alt={`${s.tab} — Online Tech Uganda`} fill priority={idx === 0} sizes="100vw" className={`object-cover ${s.pos}`} />
            ))}
          {/* Just enough shade under the words for them to be read. */}
          <div className="absolute inset-0 bg-ink-900/55" />

          {/* Only the slide on show has words: the one underneath keeps its
              photograph while the next fades in, and nothing else. */}
          <div className={`container-wide relative z-10 flex h-full items-center justify-center ${idx === i ? "" : "invisible"}`}>
            <div key={`w${i}`} className="strip-rise max-w-[56rem] text-center text-white">
              <p className="text-[13px] font-medium uppercase tracking-[0.2em] sm:text-[16px]">{s.eyebrow}</p>
              <SlideHeading
                first={heading && idx === 0}
                className={`mt-2 font-display !font-semibold uppercase leading-[1.02] tracking-[0.01em] ${
                  // An advertiser's headline can be any length; ours are written to fit.
                  s.ad && s.title.length > 48 ? "line-clamp-3 text-[28px] sm:text-[40px] xl:text-[46px]" : "line-clamp-3 text-[38px] sm:text-[58px] xl:text-[70px]"
                }`}
              >
                {s.title}
              </SlideHeading>
              <p className="mx-auto mt-3 line-clamp-2 max-w-xl text-[15px] leading-snug text-white/95 sm:text-[20px]">{s.sub}</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                <Go href={s.href} className="rounded-[3px] bg-brand-500 px-10 py-3 text-[17px] font-medium text-white shadow-md transition hover:bg-brand-600 sm:text-[19px]">
                  {s.cta}
                </Go>
                <Link href={s.more.href} className="text-[15px] font-medium text-white underline underline-offset-4 hover:text-brand-200 sm:text-[16px]">
                  {s.more.label}
                </Link>
              </div>
              {s.ad && <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">Sponsored</p>}
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition hover:bg-white group-hover/hero:opacity-100 sm:flex"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition hover:bg-white group-hover/hero:opacity-100 sm:flex"
      >
        <ChevronRight size={20} />
      </button>

    </div>

      {/* One dot per slide, beneath the banner; the one on show is filled. */}
      <div className="flex justify-center gap-3 py-4">
        {slides.map((s, idx) => (
          <button
            key={`${s.tab}-${idx}`}
            type="button"
            onClick={() => setI(idx)}
            aria-label={`Show ${s.tab}`}
            aria-current={idx === i}
            className={`h-2.5 w-2.5 rounded-full transition ${idx === i ? "bg-ink-900" : "bg-ink-700/25 hover:bg-ink-700/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
