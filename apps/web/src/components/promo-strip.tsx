"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

/**
 * The festival strip at the top of the site.
 *
 * It used to be type on a flat teal band, which reads as a notice rather than
 * an offer. Each offer now carries the thing it is selling: a real product
 * photograph, cut out on the right of the strip, plus a tinted wash so the
 * band still changes colour as it rotates.
 *
 * The images are the same files the shop already ships, so this costs no new
 * assets — and they are small, fixed-size and lazily decoded so a banner never
 * delays the page.
 */

type Offer = {
  title: string;
  deal: string;
  note: string;
  href: string;
  /** Tailwind background for the band. */
  bg: string;
  /** A product photo from /public/products, without the extension. */
  img: string;
};

const OFFERS: Offer[] = [
  { title: "Online Tech Festival", deal: "UP TO 20% OFF", note: "Limited stock · T&Cs apply", href: "/shop?deals=1", bg: "bg-teal-600", img: "hp-elitebook-840-g8" },
  { title: "Laptop Week", deal: "FROM UGX 900,000", note: "UK-used & brand new", href: "/shop?cat=Laptops", bg: "bg-brand-600", img: "hp-elitebook-840-g3" },
  { title: "Storage Deals", deal: "1TB SSD · UGX 580,000", note: "Genuine, warranted", href: "/shop?cat=Storage", bg: "bg-ink-600", img: "ssd-480gb-sata" },
  { title: "Learn & Earn", deal: "22 COURSES", note: "Physical or online · certificates", href: "/learn", bg: "bg-teal-700", img: "asus-vivobook-15" },
  { title: "Repairs & Support", deal: "FROM UGX 30,000", note: "Onsite & remote", href: "/services", bg: "bg-green-700", img: "ram-ddr4-8gb-sodimm" },
  { title: "MacBook Deals", deal: "APPLE IN STOCK", note: "Sealed & UK-used", href: "/shop?brand=Apple", bg: "bg-brand-700", img: "macbook-air-m1" },
  { title: "Gaming Zone", deal: "RTX LAPTOPS", note: "OMEN · Victus · Legion", href: "/shop?q=gaming", bg: "bg-ink-700", img: "lenovo-legion-5-15" },
  { title: "Upgrade Your PC", deal: "RAM FROM UGX 130,000", note: "Free fitting in shop", href: "/shop?cat=Components", bg: "bg-teal-800", img: "ram-ddr4-8gb-dimm" },
  { title: "Desktops In Stock", deal: "FROM UGX 750,000", note: "Office & home towers", href: "/shop?cat=Desktops", bg: "bg-teal-600", img: "hp-280-g6-desktop" },
  { title: "Power & Backup", deal: "POWER BANKS & UPS", note: "Keep working in outages", href: "/shop?cat=Power", bg: "bg-brand-600", img: "power-bank-20000" },
  { title: "Accessories Sale", deal: "FROM UGX 20,000", note: "Mice · keyboards · bags", href: "/shop?cat=Accessories", bg: "bg-ink-600", img: "logitech-mk270" },
  { title: "Carry It Safely", deal: "BAGS & SLEEVES", note: "Padded, water-resistant", href: "/shop?cat=Accessories", bg: "bg-teal-700", img: "laptop-sleeve-grey" },
  { title: "Networking Gear", deal: "ROUTERS & SWITCHES", note: "TP-Link · Netgear", href: "/shop?cat=Networking", bg: "bg-green-700", img: "tp-link-archer-c6" },
  { title: "Charge Anywhere", deal: "65W USB-C", note: "Fast, universal chargers", href: "/shop?cat=Power", bg: "bg-brand-700", img: "usb-c-charger-65w" },
  { title: "Sell With Us", deal: "OPEN A SHOP FREE", note: "Reach more buyers", href: "/sell", bg: "bg-ink-700", img: "asus-zenbook-14" },
  { title: "Industrial Training", deal: "UGX 150,000 · 2 MONTHS", note: "Software & IT — every university welcome", href: "/jobs", bg: "bg-green-700", img: "dell-xps-13-9310" },
];

export function PromoStrip() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % OFFERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const o = OFFERS[i];
  // The bar is wide and the offer only fills its left end, so the middle sat
  // empty on desktop. These are the next two deals in the rotation, shown
  // small — the strip advertises three things at once instead of one.
  const upNext = [OFFERS[(i + 1) % OFFERS.length], OFFERS[(i + 2) % OFFERS.length]];

  return (
    <div className={`relative overflow-hidden text-white transition-colors duration-500 ${o.bg}`}>
      {/* Faint diagonal texture, like a printed festival banner */}
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 14px)" }}
      />

      <div
        key={i}
        className="ad-fade container-wide relative flex min-h-[46px] items-center justify-between gap-3 py-2 sm:min-h-[62px] sm:py-2.5"
      >
        {/* Rotating offer */}
        <Link href={o.href} className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3.5 lg:flex-none">
          {/* The product itself. Small, round and lit from behind so it reads
              as a picture on a banner rather than a thumbnail in a list. */}
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-[0_0_0_3px_rgba(255,255,255,0.18)] sm:h-11 sm:w-11">
            <Image
              src={`/products/${o.img}.webp`}
              alt=""
              width={44}
              height={44}
              loading="lazy"
              className="h-7 w-7 object-contain sm:h-9 sm:w-9"
            />
          </span>

          <span className="truncate font-display text-[15px] font-black uppercase tracking-tight drop-shadow-sm sm:text-xl">
            {o.title}
          </span>
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-ink-900 shadow-sm sm:text-sm">
            {o.deal}
          </span>
          <span className="hidden text-xs font-medium text-white/90 md:inline">{o.note}</span>
        </Link>

        {/* What is coming up next, so the middle of the bar carries offers
            instead of empty teal. Desktop only — there is no room on a phone. */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {upNext.map((n) => (
            <Link
              key={n.title}
              href={n.href}
              className="group flex items-center gap-2 rounded-full bg-black/15 py-1 pl-1 pr-3 ring-1 ring-white/15 transition hover:bg-black/25"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/95">
                <Image
                  src={`/products/${n.img}.webp`}
                  alt=""
                  width={28}
                  height={28}
                  loading="lazy"
                  className="h-5 w-5 object-contain"
                />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10.5px] font-bold uppercase tracking-wide text-white/70">
                  {n.title}
                </span>
                <span className="text-[11.5px] font-extrabold">{n.deal}</span>
              </span>
            </Link>
          ))}
        </div>

        {/* Call to order — always visible on desktop */}
        <a
          href={telHref(site.phoneDisplay)}
          className="hidden shrink-0 items-center gap-2 rounded-full bg-black/15 px-3 py-1.5 text-right text-[11px] font-bold leading-tight ring-1 ring-white/20 sm:flex"
        >
          <span className="text-white/80">Call to order</span>
          <span className="text-sm font-black tracking-tight sm:text-base">{site.phoneDisplay}</span>
        </a>
      </div>

      {/* Slim progress bar — 15 dots would overflow, this reads cleaner */}
      <div className="relative h-0.5 w-full bg-white/20">
        <span
          className="block h-full bg-white transition-all duration-500"
          style={{ width: `${((i + 1) / OFFERS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
