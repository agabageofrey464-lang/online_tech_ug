"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

// Rotating festival-style offers. Each shows a headline + a bold deal pill, so
// the strip advertises something different every few seconds.
const OFFERS = [
  { title: "Online Tech Festival", deal: "UP TO 20% OFF", note: "Limited stock · T&Cs apply", href: "/shop?deals=1" },
  { title: "Laptop Week", deal: "FROM UGX 900,000", note: "UK-used & brand new", href: "/shop?cat=Laptops" },
  { title: "Storage Deals", deal: "1TB SSD · UGX 580,000", note: "Genuine, warranted", href: "/shop?cat=Storage" },
  { title: "Learn & Earn", deal: "1ST LESSON FREE", note: "22 courses · certificates", href: "/learn" },
  { title: "Repairs & Support", deal: "FROM UGX 30,000", note: "Onsite & remote", href: "/services" },
  { title: "MacBook Deals", deal: "APPLE IN STOCK", note: "Sealed & UK-used", href: "/shop?brand=Apple" },
  { title: "Gaming Zone", deal: "RTX LAPTOPS", note: "OMEN · Victus · Legion", href: "/shop?q=gaming" },
  { title: "Upgrade Your PC", deal: "RAM FROM UGX 130,000", note: "Free fitting in shop", href: "/shop?cat=Components" },
  { title: "Free Delivery Zone", deal: "COUNTRYWIDE", note: "Fee by distance · fast", href: "/shop" },
  { title: "Power & Backup", deal: "UPS FROM UGX 180,000", note: "Keep working in outages", href: "/shop?cat=Power" },
  { title: "Accessories Sale", deal: "FROM UGX 20,000", note: "Mice · keyboards · bags", href: "/shop?cat=Accessories" },
  { title: "Sell With Us", deal: "OPEN A SHOP FREE", note: "Reach more buyers", href: "/sell" },
  { title: "Websites & Software", deal: "FROM UGX 500,000", note: "Built for your business", href: "/services" },
  { title: "Networking Gear", deal: "ROUTERS & SWITCHES", note: "TP-Link · Netgear", href: "/shop?cat=Networking" },
  { title: "Refer & Earn", deal: "GET REWARDED", note: "Invite friends, earn cash", href: "/refer" },
];

export function PromoStrip() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % OFFERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const o = OFFERS[i];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-500 to-gold-500 text-white">
      {/* Faint diagonal texture, like a printed festival banner */}
      <span
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 14px)" }}
      />
      <div className="container-wide relative flex items-center justify-center gap-3 py-1.5 sm:justify-between">
        {/* Rotating offer */}
        <Link href={o.href} key={i} className="ad-fade flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="truncate font-display text-[13px] font-black uppercase tracking-tight drop-shadow-sm sm:text-base">
            {o.title}
          </span>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-brand-600 shadow-sm sm:text-xs">
            {o.deal}
          </span>
          <span className="hidden text-[11px] font-medium text-white/85 md:inline">{o.note}</span>
        </Link>

        {/* Call to order — always visible on desktop */}
        <a
          href={telHref(site.phoneDisplay)}
          className="hidden shrink-0 items-center gap-1.5 text-right text-[11px] font-bold leading-tight sm:flex"
        >
          <span className="text-white/80">Call to order</span>
          <span className="text-sm font-black tracking-tight">{site.phoneDisplay}</span>
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
