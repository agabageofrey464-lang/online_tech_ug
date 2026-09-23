"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

// Rotating festival-style offers. Each shows a headline + a bold deal pill, so
// the strip advertises something different every few seconds.
const OFFERS = [
  { title: "Online Tech Festival", deal: "UP TO 20% OFF", note: "Limited stock · T&Cs apply", href: "/shop?deals=1", bg: "bg-teal-600" },
  { title: "Laptop Week", deal: "FROM UGX 900,000", note: "UK-used & brand new", href: "/shop?cat=Laptops", bg: "bg-teal-700" },
  { title: "Storage Deals", deal: "1TB SSD · UGX 580,000", note: "Genuine, warranted", href: "/shop?cat=Storage", bg: "bg-teal-800" },
  { title: "Learn & Earn", deal: "22 COURSES", note: "Physical or online · certificates", href: "/learn", bg: "bg-teal-600" },
  { title: "Repairs & Support", deal: "FROM UGX 30,000", note: "Onsite & remote", href: "/services", bg: "bg-teal-700" },
  { title: "MacBook Deals", deal: "APPLE IN STOCK", note: "Sealed & UK-used", href: "/shop?brand=Apple", bg: "bg-teal-800" },
  { title: "Gaming Zone", deal: "RTX LAPTOPS", note: "OMEN · Victus · Legion", href: "/shop?q=gaming", bg: "bg-teal-600" },
  { title: "Upgrade Your PC", deal: "RAM FROM UGX 130,000", note: "Free fitting in shop", href: "/shop?cat=Components", bg: "bg-teal-700" },
  { title: "Free Delivery Zone", deal: "COUNTRYWIDE", note: "Fee by distance · fast", href: "/shop", bg: "bg-teal-800" },
  { title: "Power & Backup", deal: "UPS FROM UGX 180,000", note: "Keep working in outages", href: "/shop?cat=Power", bg: "bg-teal-600" },
  { title: "Accessories Sale", deal: "FROM UGX 20,000", note: "Mice · keyboards · bags", href: "/shop?cat=Accessories", bg: "bg-teal-700" },
  { title: "Sell With Us", deal: "OPEN A SHOP FREE", note: "Reach more buyers", href: "/sell", bg: "bg-teal-800" },
  { title: "Websites & Software", deal: "FROM UGX 500,000", note: "Built for your business", href: "/services", bg: "bg-teal-600" },
  { title: "Networking Gear", deal: "ROUTERS & SWITCHES", note: "TP-Link · Netgear", href: "/shop?cat=Networking", bg: "bg-teal-700" },
  { title: "Refer & Earn", deal: "GET REWARDED", note: "Invite friends, earn cash", href: "/refer", bg: "bg-teal-800" },
];

export function PromoStrip() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % OFFERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const o = OFFERS[i];

  return (
    <div className={`relative overflow-hidden text-white transition-colors duration-500 ${o.bg}`}>
      {/* Faint diagonal texture, like a printed festival banner */}
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 14px)" }}
      />
      <div key={i} className="ad-fade container-wide relative flex min-h-[46px] items-center justify-between gap-3 py-2 sm:min-h-[58px] sm:py-2.5">
        {/* Rotating offer */}
        <Link href={o.href} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span className="truncate font-display text-[15px] font-black uppercase tracking-tight drop-shadow-sm sm:text-xl">
            {o.title}
          </span>
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-ink-900 shadow-sm sm:text-sm">
            {o.deal}
          </span>
          <span className="hidden text-xs font-medium text-white/90 md:inline">{o.note}</span>
        </Link>

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
