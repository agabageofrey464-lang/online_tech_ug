"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Big campaign banners ("Don't Miss Out!") — bold badge, headline, a white offer
// pill and a photo panel. Colours come from the Online Tech Uganda palette.
const BANNERS = [
  {
    program: "Online Tech Academy",
    badge: "Online",
    badgeSub: "Intake",
    dates: "Starts 28 September",
    title: "New Online Classes",
    pill: "REGISTER BEFORE 28 SEPTEMBER",
    note: "Learn from anywhere — same tutors, same certificate",
    small: "Limited places",
    cta: "Reserve a place",
    href: "/learn",
    bg: "bg-green-600",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-1.jpg",
  },
  {
    program: "Online Tech Academy",
    badge: "October",
    badgeSub: "Intake",
    dates: "Starts 15 October",
    title: "Next Online Intake",
    pill: "15 OCTOBER · REGISTER EARLY",
    note: "Microsoft Office, design, web development and more",
    small: "Registration UGX 180,000",
    cta: "Register now",
    href: "/learn",
    bg: "bg-teal-600",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-3.jpg",
  },
  {
    program: "Online Tech Festival",
    badge: "Weekend",
    badgeSub: "Blowout",
    dates: "Fri – Sun",
    title: "Weekend Price Drop",
    pill: "SELECTED LAPTOPS & SSDs",
    note: "New prices every weekend while stock lasts",
    small: "T&Cs Apply",
    cta: "See the deals",
    href: "/shop?deals=1",
    bg: "bg-teal-700",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-2.jpg",
  },
  {
    program: "Back to School",
    badge: "Student",
    badgeSub: "Offer",
    dates: "Term time",
    title: "Student Laptop Bundle",
    pill: "LAPTOP + BAG + MOUSE",
    note: "Everything a student needs, one price",
    small: "Show your student ID",
    cta: "Shop bundles",
    href: "/shop?cat=Laptops",
    bg: "bg-teal-800",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-3.jpg",
  },
  {
    program: "Online Tech Academy",
    badge: "Skills",
    badgeSub: "Season",
    dates: "Enrolling now",
    title: "Learn A Skill This Term",
    pill: "22 COURSES · CERTIFICATE",
    note: "Physical & online classes in Kampala",
    small: "Registration UGX 180,000",
    cta: "Browse courses",
    href: "/learn",
    bg: "bg-teal-600",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-1.jpg",
  },
  {
    program: "Online Tech Festival",
    badge: "Flash",
    badgeSub: "Hours",
    dates: "Today only",
    title: "Beat The Clock",
    pill: "PRICES DROP FOR HOURS ONLY",
    note: "Check back — deals refresh through the day",
    small: "While stock lasts",
    cta: "Shop flash sales",
    href: "/shop?deals=1",
    bg: "bg-teal-700",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-2.jpg",
  },
  {
    program: "Business Ready",
    badge: "Office",
    badgeSub: "Setup",
    dates: "All month",
    title: "Kit Out Your Office",
    pill: "DESKTOPS · NETWORK · PRINTERS",
    note: "Free site visit and setup in Kampala",
    small: "Bulk pricing available",
    cta: "Get a quote",
    href: "/services",
    bg: "bg-teal-800",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-3.jpg",
  },
  {
    program: "Online Tech Festival",
    badge: "Trade",
    badgeSub: "In",
    dates: "Any time",
    title: "Trade In Your Old Laptop",
    pill: "PAY LESS ON YOUR UPGRADE",
    note: "We value your machine and take it off the price",
    small: "Subject to condition",
    cta: "Ask for a valuation",
    href: "/contact",
    bg: "bg-teal-600",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-1.jpg",
  },
  {
    program: "Repair Centre",
    badge: "Same Day",
    badgeSub: "Repairs",
    dates: "Mon – Sat",
    title: "Broken? Fixed Today",
    pill: "FREE DIAGNOSIS",
    note: "Screens, batteries, keyboards & software",
    small: "Walk in or book ahead",
    cta: "Book a repair",
    href: "/services#repairs-support",
    bg: "bg-teal-700",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-2.jpg",
  },
  {
    program: "Online Tech Festival",
    badge: "Accessory",
    badgeSub: "Days",
    dates: "This week",
    title: "Finish The Setup",
    pill: "MICE · BAGS · CHARGERS · HUBS",
    note: "The small things that make a laptop work",
    small: "T&Cs Apply",
    cta: "Shop accessories",
    href: "/shop?cat=Accessories",
    bg: "bg-teal-800",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-3.jpg",
  },
  {
    program: "Online Tech Festival",
    badge: "Super Saver",
    badgeSub: "Sale",
    dates: "This Month",
    title: "Enjoy FREE Setup",
    pill: "ON LAPTOPS OVER UGX 1M",
    note: "Windows, Office & antivirus installed free",
    small: "T&Cs Apply",
    cta: "Shop laptops",
    href: "/shop?cat=Laptops",
    bg: "bg-teal-600",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-1.jpg",
  },
  {
    program: "Online Tech Storage",
    badge: "Storage",
    badgeSub: "Week",
    dates: "Limited stock",
    title: "1TB SSD Deals",
    pill: "FROM UGX 580,000",
    note: "Genuine Samsung, Kingston, Crucial & WD",
    small: "While stocks last",
    cta: "Shop storage",
    href: "/shop?cat=Storage",
    bg: "bg-teal-700",
    panel: "bg-[#22d3ee]",
    img: "/hero/hero-3.jpg",
  },
  {
    program: "Online Tech Academy",
    badge: "Learn",
    badgeSub: "& Earn",
    dates: "22 courses",
    title: "Start Learning Free",
    pill: "1ST LESSON ON US",
    note: "Certificates you keep · pay per lesson from 5K",
    small: "Online, at your pace",
    cta: "Browse courses",
    href: "/learn",
    bg: "bg-teal-800",
    panel: "bg-[#fb7185]",
    img: "/hero/hero-4.jpg",
  },
  {
    program: "Online Tech Care",
    badge: "Repairs",
    badgeSub: "& Support",
    dates: "Same day",
    title: "Fix It Today",
    pill: "FROM UGX 30,000",
    note: "Laptops, desktops & networks — onsite or remote",
    small: "Free diagnosis",
    cta: "Book a repair",
    href: "/services#repairs-support",
    bg: "bg-teal-600",
    panel: "bg-[#282363]",
    img: "/hero/hero-5.jpg",
  },
  {
    program: "Online Tech Marketplace",
    badge: "Sell",
    badgeSub: "With Us",
    dates: "Free to join",
    title: "Open Your Shop",
    pill: "REACH MORE BUYERS",
    note: "List your products on our marketplace today",
    small: "Verified vendors only",
    cta: "Start selling",
    href: "/sell",
    bg: "bg-teal-700",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-6.jpg",
  },
  {
    program: "Online Tech Certified",
    badge: "Certified",
    badgeSub: "Pre-Owned",
    dates: "Tested & warranted",
    title: "Perfect Deals, Proven Tech",
    pill: "UK-USED FROM UGX 900,000",
    note: "Every machine battery-, screen- and port-tested before sale",
    small: "T&Cs apply",
    cta: "Shop certified",
    href: "/shop?q=uk used",
    bg: "bg-teal-800",
    panel: "bg-[#86efac]",
    img: "/hero/hero-1.jpg",
  },
  {
    program: "Online Tech Business",
    badge: "Business",
    badgeSub: "Bulk",
    dates: "For offices & schools",
    title: "Kit Out Your Whole Team",
    pill: "BULK PRICING AVAILABLE",
    note: "Laptops, desktops, networking and setup — one supplier",
    small: "Ask for a quote",
    cta: "Get a quote",
    href: "/contact",
    bg: "bg-teal-600",
    panel: "bg-[#93c5fd]",
    img: "/hero/hero-6.jpg",
  },
  {
    program: "Online Tech Student",
    badge: "Student",
    badgeSub: "Deals",
    dates: "Back to campus",
    title: "Study-Ready Laptops",
    pill: "CORE i5 · 8GB · SSD",
    note: "Light, tough machines that survive campus life",
    small: "Free Office setup",
    cta: "Shop student picks",
    href: "/shop?cat=Laptops",
    bg: "bg-teal-700",
    panel: "bg-[#FCDC04]",
    img: "/hero/hero-4.jpg",
  },
  {
    program: "Online Tech Upgrade",
    badge: "Upgrade",
    badgeSub: "Week",
    dates: "Free fitting in shop",
    title: "Make Your PC Fast Again",
    pill: "SSD + RAM FROM UGX 130,000",
    note: "Turn a slow machine into a new one — same day",
    small: "Data transfer included",
    cta: "Shop upgrades",
    href: "/shop?cat=Components",
    bg: "bg-teal-800",
    panel: "bg-[#fcd34d]",
    img: "/hero/hero-3.jpg",
  },
  {
    program: "Online Tech Digital",
    badge: "Websites",
    badgeSub: "& Apps",
    dates: "Built in Uganda",
    title: "Get Your Business Online",
    pill: "WEBSITES FROM UGX 500,000",
    note: "Shops, booking systems and business software",
    small: "Free consultation",
    cta: "See our work",
    href: "/portfolio",
    bg: "bg-teal-600",
    panel: "bg-[#f15a29]",
    img: "/hero/hero-5.jpg",
  },
];

type Banner = {
  program: string; badge: string; badgeSub: string; dates: string; title: string;
  pill: string; note: string; small: string; cta: string; href: string;
  bg: string; panel: string; img: string;
  slug?: string;          // set for API campaigns (used for click tracking)
  bgHex?: string;         // API campaigns colour via inline style, not a class
  panelHex?: string;
};

/** How fast the strip advances. Short on purpose — a festival strip that sits
 *  still reads as a static advert, and shoppers stop seeing it. */
const ROTATE_MS = 3500;

export function PromoBanners() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // Campaigns created in the admin replace these built-ins the moment any are
  // live; the hard-coded set stays as a fallback so the slot is never empty.
  const [banners, setBanners] = useState<Banner[]>(BANNERS as Banner[]);
  const n = banners.length;

  // Auto-advance. Pauses while the pointer is over the strip so a shopper
  // reading an offer doesn't have it yanked away mid-sentence.
  useEffect(() => {
    if (n <= 1 || paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), ROTATE_MS);
    return () => clearInterval(t);
  }, [n, paused]);

  useEffect(() => {
    let alive = true;
    fetch("/_api/campaigns?placement=home", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (!alive || !Array.isArray(rows) || rows.length === 0) return;
        setBanners(
          rows.map((c: Record<string, string>) => ({
            program: c.program || "",
            badge: c.badge || "",
            badgeSub: c.badge_sub || "",
            dates: c.discount_pct ? `-${c.discount_pct}%` : "",
            title: c.title || "",
            pill: c.pill || "",
            note: c.note || "",
            small: c.small || "",
            cta: c.cta_label || "Shop now",
            href: c.link_url || "/shop",
            img: c.image_url || "/hero/hero-1.jpg",
            bg: "",
            panel: "",
            bgHex: c.bg_color || "#0e7490",
            panelHex: c.panel_color || "#FCDC04",
            slug: c.slug,
          })),
        );
        setI(0);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  const b = banners[i];
  if (!b) return null;

  return (
    <section>
      <h2 className="mb-2 text-base font-extrabold text-ink-900 sm:text-lg">Don&apos;t Miss Out!</h2>

      <div
        className="group/promo relative overflow-hidden rounded-lg shadow-sm"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          className={`relative flex min-h-[190px] transition-colors duration-500 sm:min-h-[260px] ${b.bg}`}
          style={b.bgHex ? { backgroundColor: b.bgHex } : undefined}
        >
          {/* Soft wave texture, like a printed campaign board */}
          <span
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "repeating-linear-gradient(115deg, #fff 0 3px, transparent 3px 22px)" }}
          />

          {/* Copy */}
          <div key={i} className="ad-fade relative z-10 flex flex-1 flex-col justify-center gap-2 p-5 text-white sm:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/75 sm:text-xs">
              {b.program}
            </p>
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
          <div
            className={`relative hidden w-[38%] shrink-0 sm:block ${b.panel}`}
            style={b.panelHex ? { backgroundColor: b.panelHex } : undefined}
          >
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
          {banners.map((_, idx) => (
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
