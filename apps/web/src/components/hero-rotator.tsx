"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Award,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  GraduationCap,
  Play,
  ShieldCheck,
  Smartphone,
  Truck,
  Wrench,
} from "lucide-react";

// A page has one main heading. Every slide used to be an <h1>, so the home
// page had several; only the first slide is one now.
function SlideHeading({ first, ...rest }: { first: boolean; className?: string; children: ReactNode }) {
  return first ? <h1 {...rest} /> : <p {...rest} />;
}

/* ─── The pictures ────────────────────────────────────────────────
   Each slide has a small scene built from the thing it is about: products on
   tiles, a lesson playing, code being written, a repair being ticked off, an
   acceptance letter. They are drawn in the page, not photographs, so they
   stay sharp at any size and can move. */

const card = "absolute bg-white text-ink-900 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.55)]";
const chip = "absolute flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-ink-900 shadow-lg";

function ShopArt() {
  const tiles = [
    { src: "/products/macbook-air-15-midnight-p66.webp", name: "MacBook Air 15", cls: "left-0 top-10 w-[46%] -rotate-6", d: "0s" },
    { src: "/products/hp-omnibook-x-flip-14-wa0014-p35.webp", name: "HP OmniBook X Flip", cls: "right-0 top-0 w-[46%] rotate-3", d: "0.8s" },
    { src: "/products/hp-elitebook-840-g6-wa0017-p41.webp", name: "HP EliteBook 840", cls: "left-[27%] bottom-0 w-[42%] rotate-1", d: "1.6s" },
  ];
  return (
    <>
      {tiles.map((t) => (
        <div key={t.src} className={`${card} hero-float p-2 ${t.cls}`} style={{ animationDelay: t.d }}>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ede6]">
            <Image src={t.src} alt="" fill sizes="220px" className="object-cover" />
          </div>
          <p className="mt-1.5 truncate px-1 font-display text-[15px]">{t.name}</p>
          <p className="px-1 pb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-600">In stock · tested</p>
        </div>
      ))}
      <span className={`${chip} hero-float left-[2%] bottom-[14%]`} style={{ animationDelay: "0.4s" }}>
        <ShieldCheck size={14} className="text-brand-500" /> Warranty included
      </span>
      <span className={`${chip} hero-float right-[1%] bottom-[30%]`} style={{ animationDelay: "1.2s" }}>
        <Truck size={14} className="text-brand-500" /> Countrywide delivery
      </span>
    </>
  );
}

function LearnArt() {
  return (
    <>
      <div className={`${card} hero-float left-[12%] top-0 w-[66%] p-2 lg:left-[6%] lg:top-4 lg:w-[78%] lg:p-2.5`}>
        <div className="relative aspect-video overflow-hidden bg-ink-900">
          <Image src="/courses/web-development.webp" alt="" fill sizes="360px" className="object-cover opacity-80" />
          <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg">
            <Play size={20} className="ml-0.5 fill-white" />
          </span>
          <span className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
            <span className="hero-grow block h-full bg-brand-500" style={{ ["--to" as string]: "68%" }} />
          </span>
        </div>
        <p className="mt-2 font-display text-[17px] leading-tight">Web Development</p>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-700/60">Lesson 3 of 12 · pay per lesson</p>
      </div>
      <span className={`${chip} hero-float right-0 top-[8%]`} style={{ animationDelay: "0.6s" }}>
        <GraduationCap size={14} className="text-brand-500" /> 22 courses
      </span>
      <div className={`${card} hero-float bottom-0 left-0 w-[40%] p-1.5 lg:w-[36%]`} style={{ animationDelay: "0.8s" }}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ede6]">
          <Image src="/web/photo-1516321318423-f06f85e504b3.webp" alt="" fill sizes="200px" className="object-cover" />
        </div>
        <p className="px-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-700/70">Hands-on practicals</p>
      </div>
      <div className={`${card} hero-float bottom-2 right-0 flex w-[50%] items-center gap-2.5 p-2.5 lg:p-3`} style={{ animationDelay: "1.1s" }}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Award size={22} />
        </span>
        <span>
          <span className="block font-display text-[16px] leading-tight">Certificate</span>
          <span className="block text-[10.5px] text-ink-700/70">In class or online</span>
        </span>
      </div>
    </>
  );
}

function SoftwareArt() {
  const lines = [
    ["62%", "bg-brand-400"], ["84%", "bg-white/70"], ["48%", "bg-green-400"], ["72%", "bg-white/70"], ["36%", "bg-brand-300"], ["58%", "bg-white/50"],
  ];
  return (
    <>
      <div className="hero-float absolute left-0 top-6 w-[76%] overflow-hidden bg-[#16151d] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/15">
        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-gold-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="ml-2 text-[10px] font-semibold text-white/60">your-business.com</span>
        </div>
        <div className="space-y-2.5 p-4">
          {lines.map(([w, c], n) => (
            <span key={n} className={`hero-grow block h-2 rounded-full ${c}`} style={{ ["--to" as string]: w, animationDelay: `${n * 0.22}s`, marginLeft: n % 3 === 1 ? "8%" : n % 3 === 2 ? "16%" : 0 }} />
          ))}
        </div>
      </div>
      <div className={`${card} hero-float bottom-0 right-0 w-[52%] p-1.5`} style={{ animationDelay: "0.9s" }}>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#f0ede6]">
          <Image src="/portfolio/beds-beddings-1.webp" alt="" fill sizes="280px" className="object-cover object-top" />
        </div>
        <p className="px-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-700/70">A store we built · live</p>
      </div>
      <span className={`${chip} hero-float right-0 top-[4%]`} style={{ animationDelay: "0.5s" }}>
        <Code2 size={14} className="text-brand-500" /> Websites
      </span>
      <span className={`${chip} hero-float left-0 bottom-[30%]`} style={{ animationDelay: "1.4s" }}>
        <Smartphone size={14} className="text-brand-500" /> Mobile apps &amp; systems
      </span>
    </>
  );
}

function RepairArt() {
  const steps = ["Free diagnosis", "Parts fitted", "Tested before you collect"];
  return (
    <>
      <div className={`${card} hero-float left-0 top-4 w-[66%] p-4 lg:p-5`}>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            <Wrench size={22} />
          </span>
          <span>
            <span className="block font-display text-[19px] leading-tight">Laptop repair</span>
            <span className="block text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-700/60">Job card</span>
          </span>
        </div>
        <ul className="mt-4 space-y-2.5">
          {steps.map((s, n) => (
            <li key={s} className="flex items-center gap-2.5 text-[13.5px]">
              <span className="hero-tick flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white" style={{ animationDelay: `${0.5 + n * 0.5}s` }}>
                <Check size={13} strokeWidth={3} />
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
      <span className={`${chip} hero-float right-0 top-[10%]`} style={{ animationDelay: "0.7s" }}>
        From UGX 30,000
      </span>
      <div className={`${card} hero-float bottom-0 right-0 w-[44%] p-1.5`} style={{ animationDelay: "1s" }}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ede6]">
          <Image src="/products/hp-elitebook-x360-1030-0af99d-p62.webp" alt="" fill sizes="240px" className="object-cover" />
        </div>
        <p className="px-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-700/70">On our bench</p>
      </div>
      <span className={`${chip} hero-float bottom-[4%] left-[2%]`} style={{ animationDelay: "1.3s" }}>
        <ShieldCheck size={14} className="text-brand-500" /> Onsite &amp; remote
      </span>
    </>
  );
}

function InternArt() {
  return (
    <>
      <div className={`${card} hero-float left-0 top-2 w-[58%] p-4 lg:p-5`}>
        <div className="flex items-center justify-between">
          <FileText size={22} className="text-brand-500" />
          <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-700/55">Online Tech Uganda</span>
        </div>
        <p className="mt-3 font-display text-[20px] leading-tight">Acceptance Letter</p>
        <div className="mt-3 space-y-2">
          {["92%", "100%", "78%", "86%"].map((w, n) => (
            <span key={n} className="hero-grow block h-1.5 rounded-full bg-ink-900/15" style={{ ["--to" as string]: w, animationDelay: `${n * 0.2}s` }} />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-[15px] italic text-ink-700">Signed</span>
          <span className="hero-tick flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-500 text-brand-600" style={{ animationDelay: "1.1s" }}>
            <Award size={18} />
          </span>
        </div>
      </div>
      <span className={`${chip} hero-float right-0 top-[12%]`} style={{ animationDelay: "0.5s" }}>
        <CalendarDays size={14} className="text-brand-500" /> 1 Nov – 18 Dec
      </span>
      <div className={`${card} hero-float bottom-0 right-0 w-[46%] p-1.5`} style={{ animationDelay: "1s" }}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ede6]">
          <Image src="/web/photo-1523240795612-9a054b0db644.webp" alt="" fill sizes="240px" className="object-cover" />
        </div>
        <p className="px-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-700/70">Practical work, in teams</p>
      </div>
      <span className={`${chip} hero-float right-0 top-[40%]`} style={{ animationDelay: "1.2s" }}>
        <GraduationCap size={14} className="text-brand-500" /> Every university welcome
      </span>
      <span className={`${chip} hero-float bottom-[2%] left-[2%]`} style={{ animationDelay: "0.9s" }}>
        100% online
      </span>
    </>
  );
}

const SLIDES = [
  {
    tab: "Shop",
    eyebrow: "Shop · genuine & warranted",
    title: "Powering Uganda, One Device at a Time",
    sub: "Laptops, desktops & accessories — tested, with warranty and countrywide delivery.",
    cta: "Shop now",
    href: "/shop",
    more: { label: "Find my laptop", href: "/find" },
    img: "/hero/shop-shelves.webp",
    pos: "object-[center_58%]",
    Art: ShopArt,
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
    Art: LearnArt,
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
    Art: SoftwareArt,
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
    Art: RepairArt,
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
    Art: InternArt,
  },
];

// The droplets: where each starts, how big it is, how fast it rises and how
// far it drifts sideways. Fixed, so the server and the browser draw the same.
const DROPS = [
  { left: "6%", size: 7, time: "11s", delay: "-2s", sway: "40px" },
  { left: "14%", size: 4, time: "14s", delay: "-7s", sway: "-25px" },
  { left: "23%", size: 9, time: "12s", delay: "-4s", sway: "30px" },
  { left: "33%", size: 5, time: "16s", delay: "-11s", sway: "-35px" },
  { left: "44%", size: 6, time: "13s", delay: "-1s", sway: "20px" },
  { left: "52%", size: 10, time: "15s", delay: "-9s", sway: "-30px" },
  { left: "61%", size: 4, time: "10s", delay: "-5s", sway: "45px" },
  { left: "69%", size: 8, time: "14s", delay: "-12s", sway: "-20px" },
  { left: "77%", size: 5, time: "12s", delay: "-3s", sway: "35px" },
  { left: "85%", size: 9, time: "17s", delay: "-8s", sway: "-40px" },
  { left: "92%", size: 6, time: "11s", delay: "-6s", sway: "25px" },
  { left: "97%", size: 4, time: "15s", delay: "-10s", sway: "-15px" },
];

/** How long a slide stays. */
const STAY = 6500;

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

  // Auto-advance; resetting the timer on a manual change gives that slide its full time.
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % n), STAY);
    return () => clearInterval(t);
  }, [n, i]);

  // Only the slide on show, the one it replaced and the one after carry a photograph.
  const near = (idx: number) => idx === i || idx === prev || idx === (i + 1) % n;

  return (
    <div className="group/hero relative h-[440px] overflow-hidden sm:h-[720px] lg:h-[560px] xl:h-[640px]">
      {SLIDES.map((s, idx) => (
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
          {/* The photograph, dimmed; a glow in the logo's orange; a fine grid. */}
          {near(idx) && <Image src={s.img} alt="" fill priority={idx === 0} sizes="100vw" className={`object-cover ${s.pos}`} />}
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/80 to-ink-900/55" />
          <div className="hero-grid absolute inset-0 opacity-[0.07]" />
          {/* Mist and rising droplets, behind everything that is read. */}
          {idx === i && (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="hero-mist right-[4%] top-[8%] h-[26rem] w-[26rem] bg-brand-500/45" />
              <span className="hero-mist bottom-[-10%] right-[28%] h-[22rem] w-[22rem] bg-gold-400/30" style={{ animationDelay: "-5s", animationDuration: "19s" }} />
              <span className="hero-mist left-[30%] top-[-12%] h-[20rem] w-[20rem] bg-white/15" style={{ animationDelay: "-9s", animationDuration: "23s" }} />
              <span className="hero-mist bottom-[4%] left-[-6%] h-[18rem] w-[18rem] bg-brand-400/25" style={{ animationDelay: "-3s", animationDuration: "21s" }} />
              {DROPS.map((d, k) => (
                <span
                  key={k}
                  className="hero-drop"
                  style={{ left: d.left, width: d.size, height: d.size, animationDuration: d.time, animationDelay: d.delay, ["--sway" as string]: d.sway }}
                />
              ))}
            </div>
          )}

          {/* Only the slide on show has words and a picture: the one underneath
              keeps its photograph while the next fades in, and nothing else. */}
          <div
            className={`container-wide relative z-10 grid h-full content-center items-center gap-3 pb-12 pt-3 sm:gap-4 sm:pb-14 sm:pt-5 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-10 ${
              idx === i ? "" : "invisible"
            }`}
          >
            {/* On a phone the order is headline, scene, then the line and the
                buttons, so the scene is on the first screen and not below it.
                On a wide screen the words sit left and the scene right. */}
            <div className="contents lg:block lg:text-left">
              <div className="order-1 text-center text-white lg:text-left">
                <p className="font-display text-[15px] italic leading-tight text-brand-200 sm:text-[21px]">{s.eyebrow}</p>
                <SlideHeading first={idx === 0} className="mt-0.5 font-display text-[25px] leading-[1.08] sm:mt-1 sm:text-[50px] lg:mt-2 xl:text-[62px]">
                  {s.title}
                </SlideHeading>
              </div>
              <div className="order-3 text-center text-white lg:text-left">
                {/* A phone has the headline and the scene; the line is for wider screens. */}
                <p className="mx-auto hidden max-w-xl text-white/90 sm:block sm:text-[19px] lg:mx-0 lg:mt-3">{s.sub}</p>
                <div className="mx-auto flex max-w-sm gap-2 pr-14 sm:mt-4 sm:max-w-none sm:justify-center sm:gap-3 sm:pr-0 lg:mt-5 lg:justify-start">
                  <Link
                    href={s.href}
                    className="press inline-flex flex-1 items-center justify-center bg-brand-500 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-brand-600 sm:flex-none sm:px-9 sm:py-4 sm:text-[13px]"
                  >
                    {s.cta}
                  </Link>
                  <Link
                    href={s.more.href}
                    className="inline-flex flex-1 items-center justify-center border border-white px-3 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-ink-900 sm:flex-none sm:px-9 sm:py-4 sm:text-[13px]"
                  >
                    {s.more.label}
                  </Link>
                </div>
              </div>
            </div>

            {/* The scene. Drawn only for the slide on show, so its pieces
                animate in each time that slide comes round. */}
            {/* On a phone the whole scene is drawn at its usual size and
                shrunk to three quarters, so its pieces keep their proportions
                in a smaller space. */}
            <div className="relative order-2 mx-auto h-[162px] w-[255px] sm:h-[270px] sm:w-full sm:max-w-[440px] lg:h-[400px] lg:max-w-[520px] xl:h-[440px] xl:max-w-[580px]">
              <div className="absolute left-0 top-0 h-[215px] w-[340px] origin-top-left scale-75 sm:relative sm:h-full sm:w-full sm:scale-100">
                {idx === i && <s.Art />}
              </div>
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

      {/* One tab per service. Each is a link to that service's page; pointing
          at one on a computer shows its slide first. They were buttons that
          only changed the slide, which read as a link that went nowhere. */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex gap-1 overflow-x-auto bg-ink-900/60 px-2 py-2 backdrop-blur-sm no-scrollbar sm:justify-center">
        {SLIDES.map((s, idx) => (
          <Link
            key={s.tab}
            href={s.href}
            onMouseEnter={() => setI(idx)}
            onFocus={() => setI(idx)}
            aria-label={`Go to ${s.tab}`}
            aria-current={idx === i}
            className={`relative shrink-0 overflow-hidden whitespace-nowrap px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] transition sm:px-4 sm:py-2 sm:text-[11px] ${
              idx === i ? "bg-white text-ink-900" : "text-white/75 hover:text-white"
            }`}
          >
            {s.tab}
            {idx === i && <span key={`c${i}`} className="strip-count !bg-brand-500" style={{ animationDuration: `${STAY}ms` }} />}
          </Link>
        ))}
      </div>
    </div>
  );
}
