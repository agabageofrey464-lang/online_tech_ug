"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

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
  // Dated intakes — these drop off by themselves once the date passes.
  {
    text: "New ONLINE classes start 28 September — register now",
    cta: "Reserve a place",
    href: "/learn",
    bg: "bg-teal-600",
    img: "/courses/computer-basics.webp",
    until: "2026-09-29",
  },
  {
    text: "Next ONLINE intake: 15 October — limited places",
    cta: "Register now",
    href: "/learn",
    bg: "bg-teal-700",
    img: "/courses/graphic-design.jpg",
    until: "2026-10-16",
  },
  { text: "Free Windows, Office & antivirus setup on laptops over UGX 1M", cta: "Shop laptops", href: "/shop?cat=Laptops", bg: "bg-teal-600", img: "/products/hp-elitebook-840-g3.webp" },
  { text: "Not sure what to buy? Tell us your budget and we'll advise honestly", cta: "Find my laptop", href: "/find", bg: "bg-teal-700", img: "/products/dell-xps-13-9310.webp" },
  { text: "22 computer courses — physical or online, certificate included", cta: "Browse courses", href: "/learn", bg: "bg-teal-600", img: "/courses/microsoft-office.webp" },
  { text: "Laptop trouble? Free diagnosis, repairs from UGX 30,000", cta: "Book a repair", href: "/services#repairs-support", bg: "bg-teal-800", img: "/products/ram-ddr4-8gb-dimm.webp" },
  { text: "University student? Do your industrial training with us", cta: "Apply now", href: "/jobs", bg: "bg-teal-600", img: "/courses/python-programming.png" },
  { text: "1TB & 2TB SSDs in stock — make an old laptop feel new", cta: "Shop storage", href: "/shop?cat=Storage", bg: "bg-teal-700", img: "/products/ssd-480gb-sata.webp" },
];

const DISMISS_KEY = "otu_strip_closed";
const ROTATE_MS = 5000;

/** Keeps only strips that haven't passed their date. */
const live = (list: Strip[]) => {
  const today = new Date().toISOString().slice(0, 10);
  return list.filter((s) => !s.until || s.until >= today);
};

export function FestivalStrip() {
  const [strips, setStrips] = useState<Strip[]>(() => live(FALLBACK));
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
        setStrips(
          rows.slice(0, 8).map((c) => ({
            text: [c.title, c.pill].filter(Boolean).join(" — "),
            cta: c.cta_label || "See offer",
            href: c.link_url || "/shop",
            bg: c.bg_color || "bg-teal-600",
            img: c.image_url || undefined,
          })),
        );
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
              <Image
                src={s.img}
                alt=""
                width={28}
                height={28}
                loading="lazy"
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
