"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { thumb } from "@/lib/thumb";
import { upcomingIntakes } from "@/lib/intakes";
import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { isAcademyLink, offersFor } from "@/lib/academy-zone";

/**
 * Slim rotating offer bar, shown on every page under the header.
 *
 * The home page carries the full "Don't Miss Out!" banner; the rest of the site
 * had nothing, so a visitor who landed on a course or a product page never saw
 * a single offer. This is the thin version of the same idea — one line, easy to
 * ignore, and dismissible, because a promo bar that cannot be closed is just an
 * annoyance on the page someone actually came to read.
 */

type Strip = {
  text: string;
  cta: string;
  href: string;
  bg: string;
  /** A picture of what is on offer. Live campaigns bring their own. */
  img?: string;
  /** ISO date after which this stops showing — for dated intakes. */
  until?: string;
};

/** Used until the live campaigns load, and whenever none are running. */
const FALLBACK: Strip[] = [
  { text: "Free Windows, Office & antivirus setup on laptops over UGX 1M", cta: "Shop laptops", href: "/shop?cat=Laptops", bg: "bg-ink-600", img: "/products/hp-elitebook-840-g3.webp" },
  { text: "Not sure what to buy? Tell us your budget and we'll advise honestly", cta: "Find my laptop", href: "/find", bg: "bg-teal-700", img: "/products/dell-xps-13-9310.webp" },
  { text: "22 computer courses — physical or online, certificate included", cta: "Browse courses", href: "/learn", bg: "bg-green-700", img: "/courses/microsoft-office.webp" },
  { text: "Laptop trouble? Free diagnosis, repairs from UGX 30,000", cta: "Book a repair", href: "/services#repairs-support", bg: "bg-brand-700", img: "/products/ram-ddr4-8gb-dimm.webp" },
  // Industrial training, aimed squarely at the universities. Software first,
  // because that is most of what an intern here actually does.
  { text: "ONLINE industrial training — UGX 150,000, 1 Nov to 18 Dec", cta: "Apply now", href: "/internship", bg: "bg-ink-700", img: "/courses/python-programming.webp" },
  { text: "Makerere · Kyambogo · MUBS · UCU · Ndejje — online internships from 1 Nov", cta: "See placements", href: "/internship", bg: "bg-green-700", img: "/courses/web-development.webp" },
  { text: "Intern on real client software from home — websites, systems, databases", cta: "Apply for a place", href: "/internship", bg: "bg-teal-700", img: "/courses/computer-networking.webp" },
  { text: "Acceptance & completion letters signed on our letterhead", cta: "Start your application", href: "/internship", bg: "bg-brand-700", img: "/courses/graphic-design.webp" },
  // Office skills — the courses that actually fill the classroom. Each points
  // at its own cover now, so the thumbnails differ instead of repeating one
  // photograph six times.
  { text: "Microsoft Excel in 2 months — formulas, charts and reports", cta: "Enrol now", href: "/learn/microsoft-excel", bg: "bg-green-700", img: "/courses/microsoft-excel.webp" },
  { text: "Word, Excel, PowerPoint, Publisher & Access — one programme", cta: "See the suite", href: "/learn/microsoft-office", bg: "bg-brand-600", img: "/courses/microsoft-office.webp" },
  { text: "Build slides that win the room — PowerPoint from scratch", cta: "Start learning", href: "/learn/microsoft-powerpoint", bg: "bg-brand-700", img: "/courses/microsoft-powerpoint.webp" },
  { text: "Keep proper records — Microsoft Access databases", cta: "Browse course", href: "/learn/microsoft-access", bg: "bg-ink-700", img: "/courses/microsoft-access.webp" },

  // iPhones, now that we have photographs of them. The thumbnail is the handset
  // itself so the strip shows what is on offer, not a generic icon.
  { text: "iPhone 16 in stock — sealed, Apple warranty, five colours", cta: "Shop iPhone", href: "/shop?cat=Phones&q=iPhone", bg: "bg-ink-700", img: "/products/iphone-16-128gb.webp" },
  { text: "iPhone 17 256GB — the newest iPhone, UGX 6,300,000", cta: "See it", href: "/shop/iphone-17-256gb", bg: "bg-brand-600", img: "/products/iphone-17-256gb.webp" },
  { text: "iPhone 14 from UGX 2,850,000 — 14, 14 Plus and 14 Pro Max", cta: "Compare", href: "/shop?cat=Phones&q=iPhone%2014", bg: "bg-teal-700", img: "/products/iphone-14-128gb.webp" },
  { text: "iPhone 16 Pro Max — 6.9\" 120Hz, 5× telephoto, biggest battery", cta: "View", href: "/shop/iphone-16-pro-max-256gb", bg: "bg-ink-600", img: "/products/iphone-16-pro-max-256gb.webp" },
  { text: "Every iPhone tested before it leaves the shop — used or sealed", cta: "Browse phones", href: "/shop?cat=Phones", bg: "bg-green-700", img: "/products/iphone-15-pro-256gb.webp" },
  { text: "1TB & 2TB SSDs in stock — make an old laptop feel new", cta: "Shop storage", href: "/shop?cat=Storage", bg: "bg-teal-800", img: "/products/ssd-480gb-sata.webp" },
];

const DISMISS_KEY = "otu_strip_closed";
const ROTATE_MS = 5000;

/** Keeps only strips that haven't passed their date. */
const live = (list: Strip[]) => {
  const today = new Date().toISOString().slice(0, 10);
  return list.filter((s) => !s.until || s.until >= today);
};

/**
 * A strip per upcoming intake, from the same list the Learn page and the home
 * page adverts read. These used to be typed out here by hand, which is how the
 * September intake was still being advertised after it had started.
 */
const intakeStrips = (): Strip[] =>
  upcomingIntakes().map((i) => ({
    text: `${i.title} starts ${i.label.replace(/ \d{4}$/, "")} — ${i.small.toLowerCase()}`,
    cta: "Reserve a place",
    href: "/learn",
    bg: i.bg,
    img: i.img,
  }));

export function FestivalStrip() {
  const pathname = usePathname();
  const [all, setStrips] = useState<Strip[]>(() => [...intakeStrips(), ...live(FALLBACK)]);
  // Course and intake strips inside the academy; shop strips everywhere else.
  const strips = offersFor(all, pathname, (s) => s.href);
  const [i, setI] = useState(0);
  // Shown by default so it renders server-side and the page doesn't jump once
  // hydration runs; only a visitor who actually dismissed it sees it hidden.
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") setClosed(true);
    } catch {
      /* storage blocked — leave the bar visible */
    }
  }, []);

  // Live campaigns from the admin take over when any are running.
  useEffect(() => {
    let alive = true;
    fetch("/_api/campaigns?placement=home", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Record<string, string>[]) => {
        if (!alive || !Array.isArray(rows) || rows.length === 0) return;
        const campaigns = rows.slice(0, 8).map((c) => ({
          text: [c.title, c.pill].filter(Boolean).join(" — "),
          cta: c.cta_label || "See offer",
          href: c.link_url || "/shop",
          bg: c.bg_color || "bg-teal-600",
          img: c.image_url || undefined,
        }));
        // Campaigns replace the built-in shop strips. The academy keeps its
        // own — intake dates come from the intake list, not from a campaign.
        setStrips((prev) => [...campaigns, ...prev.filter((s) => isAcademyLink(s.href))]);
      })
      .catch(() => {
        /* offline — the fallback strips stand in */
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (closed || strips.length <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % strips.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [closed, strips.length]);

  if (closed) return null;
  const s = strips[i % strips.length];
  if (!s) return null;

  function dismiss() {
    setClosed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={`stripes relative ${s.bg.startsWith("bg-") ? s.bg : ""} text-white transition-colors duration-500`}
      style={!s.bg.startsWith("bg-") ? { backgroundColor: s.bg } : undefined}
    >
      <div className="container-wide flex items-center justify-center gap-3 py-2 pr-8 text-center">
        <Link href={s.href} className="group flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          {s.img && (
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 shadow-[0_0_0_2px_rgba(255,255,255,0.2)]">
              {/* Eager, and the 96px copy. This sits at the top of every page,
                  so deferring it meant arriving to a white disc — which reads
                  as a broken image — while a full-size photograph downloaded
                  to fill 28 pixels. */}
              <Image
                src={thumb(s.img)}
                alt=""
                width={28}
                height={28}
                loading="eager"
                unoptimized={s.img.startsWith("http")}
                className="h-full w-full object-cover"
              />
            </span>
          )}
          <span className="text-[12.5px] font-semibold leading-snug sm:text-[13px]">{s.text}</span>
          <span className="whitespace-nowrap rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-white/25 transition group-hover:bg-white group-hover:text-ink-900">
            {s.cta} →
          </span>
        </Link>
      </div>
      <button
        onClick={dismiss}
        aria-label="Close offer bar"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/70 transition hover:bg-white/15 hover:text-white"
      >
        <X size={15} />
      </button>
    </div>
  );
}
