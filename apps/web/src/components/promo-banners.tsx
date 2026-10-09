"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isAcademyLink } from "@/lib/academy-zone";
import { onPalette, SAND } from "@/lib/palette";

// The rotating campaign offers, drawn as a tall festival strip — a picture,
// the headline, a white offer pill and the button, in one band. Colours come
// from the Online Tech Uganda palette.
const BANNERS = [
  // Intake slides used to live here, typed out by hand with their dates in
  // the copy. They could not expire, so this carousel was still inviting
  // people to classes that had already started. Intakes are advertised by
  // <IntakeAdverts /> now, generated from the one dated list.
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
    bg: "bg-brand-600",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-4.webp",
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
    bg: "bg-ink-800",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-3.webp",
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
    bg: "bg-brand-600",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-1.webp",
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
    bg: "bg-ink-800",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-5.webp",
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
    bg: "bg-brand-600",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-3.webp",
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
    bg: "bg-ink-800",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-1.webp",
  },
  // ── Office skills ───────────────────────────────────────────
  // The panel artwork is each course's own cover, so these read as different
  // offers rather than the same picture under four headlines.
  {
    program: "Online Tech Academy",
    badge: "Office",
    badgeSub: "Skills",
    dates: "Enrolling now",
    title: "Excel Pays The Bills",
    pill: "MICROSOFT EXCEL · UGX 530,000",
    note: "Formulas, charts and the reports an employer asks for",
    small: "2 months · certificate included",
    cta: "Enrol now",
    href: "/learn/microsoft-excel",
    bg: "bg-green-700",
    panel: "bg-[#f3efe9]",
    img: "/courses/microsoft-excel.webp",
  },
  {
    program: "Online Tech Academy",
    badge: "Full",
    badgeSub: "Suite",
    dates: "Most popular",
    title: "Learn The Whole Office",
    pill: "WORD · EXCEL · POWERPOINT · ACCESS",
    note: "One programme, five applications, one certificate",
    small: "From UGX 530,000",
    cta: "See the programme",
    href: "/learn/microsoft-office",
    bg: "bg-brand-600",
    panel: "bg-[#f3efe9]",
    img: "/courses/microsoft-office.webp",
  },
  {
    program: "Online Tech Academy",
    badge: "Present",
    badgeSub: "Like A Pro",
    dates: "Evenings & weekends",
    title: "Slides That Win The Room",
    pill: "POWERPOINT FROM SCRATCH",
    note: "Design, animate and deliver — without reading off the screen",
    small: "Physical or online",
    cta: "Start learning",
    href: "/learn/microsoft-powerpoint",
    bg: "bg-brand-700",
    panel: "bg-[#f3efe9]",
    img: "/courses/microsoft-powerpoint.webp",
  },

  // ── iPhones ─────────────────────────────────────────────────
  // The panel artwork is the series line-up itself, so a shopper can see which
  // model is which before they click. Photographs live in public/promos.
  {
    program: "Apple at Online Tech",
    badge: "iPhone",
    badgeSub: "16 Series",
    dates: "In stock now",
    title: "The iPhone 16 Is Here",
    pill: "iPHONE 16 FROM UGX 4,600,000",
    note: "Sealed, 12 months Apple warranty, five colours",
    small: "Pro & Pro Max also in stock",
    cta: "Shop iPhone",
    href: "/shop?cat=Phones&q=iPhone",
    bg: "bg-ink-700",
    panel: "bg-[#f3efe9]",
    img: "/promos/iphone-16-series.webp",
  },
  {
    program: "Apple at Online Tech",
    badge: "iPhone",
    badgeSub: "17 Series",
    dates: "Latest release",
    title: "The Newest iPhone",
    pill: "iPHONE 17 256GB · UGX 6,300,000",
    note: "120Hz on a standard iPhone for the first time",
    small: "Sealed with Apple warranty",
    cta: "See the iPhone 17",
    href: "/shop/iphone-17-256gb",
    bg: "bg-brand-600",
    panel: "bg-[#f3efe9]",
    img: "/promos/iphone-17-series.webp",
  },
  {
    program: "Apple at Online Tech",
    badge: "iPhone",
    badgeSub: "14 Series",
    dates: "Best value",
    title: "iPhone Without The Wait",
    pill: "iPHONE 14 FROM UGX 2,850,000",
    note: "14, 14 Plus and 14 Pro Max — check the model before you buy",
    small: "Used handsets tested and warranted",
    cta: "Compare the 14s",
    href: "/shop?cat=Phones&q=iPhone%2014",
    bg: "bg-brand-600",
    panel: "bg-[#f3efe9]",
    img: "/promos/iphone-14-series.webp",
  },
  {
    program: "Apple at Online Tech",
    badge: "iPhone",
    badgeSub: "15 Series",
    dates: "USB-C generation",
    title: "One Cable For Everything",
    pill: "iPHONE 15 FROM UGX 3,650,000",
    note: "USB-C, 48MP camera, titanium on the Pro",
    small: "Sealed with Apple warranty",
    cta: "Shop iPhone 15",
    href: "/shop?cat=Phones&q=iPhone%2015",
    bg: "bg-ink-600",
    panel: "bg-[#f3efe9]",
    img: "/promos/iphone-15-series.webp",
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
    bg: "bg-ink-800",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-6.webp",
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
    bg: "bg-brand-600",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-3.webp",
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
    bg: "bg-ink-800",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-1.webp",
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
    bg: "bg-brand-600",
    panel: "bg-[#b3d3dc]",
    img: "/hero/hero-3.webp",
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
    bg: "bg-ink-800",
    panel: "bg-[#fa7547]",
    img: "/hero/hero-4.webp",
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
    bg: "bg-brand-600",
    panel: "bg-[#3a3945]",
    img: "/hero/hero-5.webp",
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
    bg: "bg-ink-800",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-6.webp",
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
    bg: "bg-brand-600",
    panel: "bg-[#b3d3dc]",
    img: "/hero/hero-1.webp",
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
    bg: "bg-ink-800",
    panel: "bg-[#b3d3dc]",
    img: "/hero/hero-6.webp",
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
    bg: "bg-brand-600",
    panel: "bg-[#f3efe9]",
    img: "/hero/hero-4.webp",
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
    bg: "bg-ink-800",
    panel: "bg-[#e8e1d7]",
    img: "/hero/hero-3.webp",
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
    bg: "bg-brand-600",
    panel: "bg-[#f15a29]",
    img: "/hero/hero-5.webp",
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

/**
 * `zone` picks the side of the business: the home page shows shop offers, and
 * the Learn page shows the course offers that used to be mixed in with them.
 */
export function PromoBanners({ zone = "shop" }: { zone?: "shop" | "academy" }) {
  const mine = useCallback(
    (list: Banner[]) => list.filter((b) => isAcademyLink(b.href) === (zone === "academy")),
    [zone],
  );
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // Campaigns created in the admin replace these built-ins the moment any are
  // live for this side; the hard-coded set stays as a fallback so the slot is
  // never empty.
  const [banners, setBanners] = useState<Banner[]>(() => mine(BANNERS as Banner[]));
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
        const campaigns = mine(
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
            img: c.image_url || "/hero/hero-1.webp",
            bg: "bg-ink-800",
            panel: "",
            bgHex: undefined,
            panelHex: onPalette(c.panel_color, SAND),
            slug: c.slug,
          })),
        );
        if (campaigns.length === 0) return;
        setBanners(campaigns);
        setI(0);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [mine]);
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  const b = banners[i % Math.max(n, 1)];
  if (!b) return null;

  return (
    // A festival strip, like the offer bar under the header, at about twice
    // its height. This used to be a 260px campaign board with a photo panel,
    // which pushed the shop a full screen down the page to say one thing. A
    // strip says the same thing in a line: what it is, the offer, the button.
    <section
      aria-label="Offers"
      className={`group/promo relative overflow-hidden text-white transition-colors duration-500 ${b.bg}`}
      style={b.bgHex ? { backgroundColor: b.bgHex } : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <span aria-hidden className="strip-shine" />
      <Link
        key={i}
        href={b.href}
        className="ad-fade grid min-h-[5.75rem] grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-3 py-3 sm:min-h-[6.5rem] sm:px-12 lg:grid-cols-[auto_1fr_auto_auto] lg:gap-x-6"
      >
        {/* What is on offer, as a picture. */}
        <span
          className={`strip-photo relative h-12 w-12 shrink-0 overflow-hidden rounded-full sm:h-16 sm:w-16 ${b.panel}`}
          style={b.panelHex ? { backgroundColor: b.panelHex } : undefined}
        >
          <Image src={b.img} alt="" fill sizes="64px" className="object-cover" />
        </span>

        {/* What it is. */}
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/75 sm:text-[11px]">
            {b.program}
            {b.dates && (
              <span className="rounded-full border border-white/40 px-2 py-px text-[9.5px] tracking-wide text-white sm:text-[10px]">
                {b.dates}
              </span>
            )}
          </span>
          <span className="strip-rise mt-0.5 truncate font-display text-lg font-black leading-tight sm:text-2xl">
            {b.title}
          </span>
          <span className="mt-0.5 hidden truncate text-xs text-white/85 sm:block">{b.note}</span>
        </span>

        {/* The offer and the button — a second row on a phone, the right-hand
            side of the strip on a desktop. */}
        <span className="col-span-2 flex items-center justify-between gap-2 lg:col-span-1 lg:contents">
          <span className="strip-spring min-w-0 truncate rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-tight text-ink-900 shadow-sm sm:px-5 sm:py-2 sm:text-sm">
            {b.pill}
          </span>
          <span className="press shrink-0 rounded-full bg-[#f3efe9] px-3.5 py-1.5 text-[11px] font-extrabold text-ink-900 shadow-sm sm:px-5 sm:py-2 sm:text-sm">
            {b.cta} →
          </span>
        </span>
      </Link>

      {/* Arrows — desktop, on hover */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous offer"
        className="absolute left-1.5 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition hover:bg-white group-hover/promo:opacity-100 sm:flex"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next offer"
        className="absolute right-1.5 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition hover:bg-white group-hover/promo:opacity-100 sm:flex"
      >
        <ChevronRight size={18} />
      </button>
    </section>
  );
}
