"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ShoppingBag } from "lucide-react";
import { site } from "@/lib/site";
import { thumb } from "@/lib/thumb";
import { upcomingIntakes } from "@/lib/intakes";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

/**
 * The festival strip at the top of the site, in two halves.
 *
 * It used to rotate everything through one band — a laptop deal, then a
 * course, then a repair offer — so the shop and the academy took turns being
 * invisible. They are separate things we sell, to different people, and each
 * now has its own side: the store on the left, the academy on the right, cut
 * on a slant with a yellow seam so they read as one banner rather than two
 * bars pushed together. Each side keeps its own colour and turns over on the
 * other's off-beat, so the two never change at the same moment.
 *
 * A phone has room for one offer, not two, so there the sides take turns in
 * the same band, each labelled.
 *
 * The images are files the site already ships — small, fixed-size and lazily
 * decoded, so the banner never delays the page.
 */

type Offer = {
  title: string;
  deal: string;
  note: string;
  href: string;
  /** Tailwind background for the band. */
  bg: string;
  /** A product photo from /public/products, without the extension. */
  img?: string;
  /** Or any picture on the site, by its full path — course covers, mostly. */
  photo?: string;
};

const picture = (o: Offer) => (o.photo ? thumb(o.photo) : `/products/${o.img}.webp`);

const STORE: Offer[] = [
  { title: "Online Tech Festival", deal: "UP TO 20% OFF", note: "Limited stock · T&Cs apply", href: "/shop?deals=1", bg: "bg-ink-600", img: "hp-elitebook-840-g8" },
  { title: "Laptop Week", deal: "FROM UGX 900,000", note: "UK-used & brand new", href: "/shop?cat=Laptops", bg: "bg-ink-600", img: "hp-elitebook-840-g3" },
  { title: "Storage Deals", deal: "1TB SSD · UGX 580,000", note: "Genuine, warranted", href: "/shop?cat=Storage", bg: "bg-ink-600", img: "ssd-480gb-sata" },
  { title: "Repairs & Support", deal: "FROM UGX 30,000", note: "Onsite & remote", href: "/services", bg: "bg-ink-600", img: "ram-ddr4-8gb-sodimm" },
  { title: "MacBook Deals", deal: "APPLE IN STOCK", note: "Sealed & UK-used", href: "/shop?brand=Apple", bg: "bg-ink-600", img: "macbook-air-m1" },
  { title: "Gaming Zone", deal: "RTX LAPTOPS", note: "OMEN · Victus · Legion", href: "/shop?q=gaming", bg: "bg-ink-600", img: "lenovo-legion-5-15" },
  { title: "Upgrade Your PC", deal: "RAM FROM UGX 130,000", note: "Free fitting in shop", href: "/shop?cat=Components", bg: "bg-ink-600", img: "ram-ddr4-8gb-dimm" },
  { title: "Desktops In Stock", deal: "FROM UGX 750,000", note: "Office & home towers", href: "/shop?cat=Desktops", bg: "bg-ink-600", img: "hp-280-g6-desktop" },
  { title: "Power & Backup", deal: "POWER BANKS & UPS", note: "Keep working in outages", href: "/shop?cat=Power", bg: "bg-ink-600", img: "power-bank-20000" },
  { title: "Accessories Sale", deal: "FROM UGX 20,000", note: "Mice · keyboards · bags", href: "/shop?cat=Accessories", bg: "bg-ink-600", img: "logitech-mk270" },
  { title: "Carry It Safely", deal: "BAGS & SLEEVES", note: "Padded, water-resistant", href: "/shop?cat=Accessories", bg: "bg-ink-600", img: "laptop-sleeve-grey" },
  { title: "Networking Gear", deal: "ROUTERS & SWITCHES", note: "TP-Link · Netgear", href: "/shop?cat=Networking", bg: "bg-ink-600", img: "tp-link-archer-c6" },
  { title: "Charge Anywhere", deal: "65W USB-C", note: "Fast, universal chargers", href: "/shop?cat=Power", bg: "bg-ink-600", img: "usb-c-charger-65w" },
  { title: "Sell With Us", deal: "OPEN A SHOP FREE", note: "Reach more buyers", href: "/sell", bg: "bg-ink-600", img: "asus-zenbook-14" },
];

/** The academy's standing offers. Dated intakes are added in front of these
 *  from the intake list, so a date that has passed leaves on its own. */
const ACADEMY: Offer[] = [
  { title: "Learn & Earn", deal: "22 COURSES", note: "Physical or online · certificates", href: "/learn", bg: "bg-teal-700", photo: "/courses/microsoft-office.webp" },
  { title: "Microsoft Excel", deal: "UGX 530,000", note: "2 months · certificate", href: "/learn/microsoft-excel", bg: "bg-teal-700", photo: "/courses/microsoft-excel.webp" },
  { title: "Graphic Design", deal: "PHOTOSHOP · CANVA", note: "The work Kampala businesses buy", href: "/learn/graphic-design", bg: "bg-teal-700", photo: "/courses/graphic-design.webp" },
  { title: "Web Development", deal: "BUILD REAL SITES", note: "HTML, CSS, JavaScript & WordPress", href: "/learn/web-development", bg: "bg-teal-700", photo: "/courses/web-development.webp" },
  { title: "Industrial Training", deal: "UGX 150,000 · 2 MONTHS", note: "Every university welcome", href: "/internship", bg: "bg-teal-700", photo: "/courses/python-programming.webp" },
  { title: "Pay Per Lesson", deal: "FROM UGX 5,000", note: "Study at your own pace", href: "/learn", bg: "bg-teal-700", photo: "/courses/computer-basics.webp" },
];

const academyOffers = (): Offer[] => [
  ...upcomingIntakes().map((i) => ({
    title: i.title,
    deal: `STARTS ${i.label.replace(/ \d{4}$/, "").toUpperCase()}`,
    note: i.small,
    href: "/learn",
    bg: i.bg,
    photo: i.img,
  })),
  ...ACADEMY,
];

/** One side of the banner: a picture, what it is, and the offer. */
function Side({
  offer,
  label,
  icon,
  className = "",
}: {
  offer: Offer;
  label: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={offer.href} className={`ad-fade flex min-w-0 items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Small, round and lit from behind, so it reads as a picture on a
          banner rather than a thumbnail in a list. */}
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 shadow-[0_0_0_3px_rgba(255,255,255,0.18)] sm:h-11 sm:w-11">
        <Image
          src={picture(offer)}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          className={offer.photo ? "h-full w-full object-cover" : "h-7 w-7 object-contain sm:h-9 sm:w-9"}
        />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-[9.5px] font-black uppercase leading-none tracking-[0.2em] text-white/70 sm:text-[10px]">
          {icon}
          {label}
        </span>
        <span className="mt-0.5 block truncate font-display text-[15px] font-black uppercase leading-tight tracking-tight drop-shadow-sm sm:text-lg">
          {offer.title}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-extrabold text-ink-900 shadow-sm sm:px-3 sm:text-[13px]">
        {offer.deal}
      </span>
      <span className="hidden truncate text-xs font-medium text-white/90 2xl:inline">{offer.note}</span>
    </Link>
  );
}

export function PromoStrip() {
  const [tick, setTick] = useState(0);
  const [academy] = useState(academyOffers);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 3500);
    return () => clearInterval(t);
  }, []);

  // The store turns over on even ticks and the academy on odd ones, so on a
  // desktop the two halves never change together, and on a phone — where only
  // one is shown — each has a fresh offer when its turn comes.
  const store = STORE[Math.floor((tick + 1) / 2) % STORE.length];
  const course = academy[Math.floor(tick / 2) % academy.length];
  // The academy keeps one colour — the green of its button in the menu below —
  // and the store never borrows it, so the halves cannot land on the same
  // shade and lose the seam between them.
  const storeBg = "band-light";
  const academyBg = "band-sand";
  const turn = tick % 2 === 0 ? "store" : "academy";

  return (
    <div className="relative flex overflow-hidden border-b border-ink-600/10 text-ink-900">
      {/* ── Store ─────────────────────────────────────────────── */}
      <div
        className={`stripes relative z-10 min-w-0 flex-1 items-center transition-colors duration-500 ${storeBg} ${
          turn === "store" ? "flex" : "hidden"
        } lg:flex`}
      >
        <div className="flex min-h-[46px] w-full min-w-0 items-center py-2 pl-[clamp(0.875rem,2.5vw,2rem)] pr-3 sm:min-h-[62px] lg:pr-10">
          <Side key={`s${store.title}`} offer={store} label="Store" icon={<ShoppingBag size={10} />} className="flex-1" />
          {/* Call to order belongs with the shop — a tablet has room for it
              here; a desktop moves it to the far end of the banner. */}
          <a
            href={telHref(site.phoneDisplay)}
            className="ml-3 hidden shrink-0 items-center gap-2 rounded-full bg-black/15 px-3 py-1.5 text-[11px] font-bold leading-tight ring-1 ring-white/20 sm:flex lg:hidden"
          >
            <span className="text-white/80">Call</span>
            <span className="text-sm font-black tracking-tight">{site.phoneDisplay}</span>
          </a>
        </div>
        {/* The slanted edge, in the store's own colour, with the yellow seam
            that joins the two halves. Desktop only. */}
        <span
          aria-hidden
          className={`absolute -right-5 top-0 hidden h-full w-10 -skew-x-[18deg] shadow-[4px_0_0_0_#ffffff] transition-colors duration-500 lg:block ${storeBg}`}
        />
      </div>

      {/* ── Academy ───────────────────────────────────────────── */}
      <div
        className={`stripes relative min-w-0 flex-1 items-center ${academyBg} ${
          turn === "academy" ? "flex" : "hidden"
        } lg:flex`}
      >
        <div className="flex min-h-[46px] w-full min-w-0 items-center gap-3 py-2 pl-3 pr-[clamp(0.875rem,2.5vw,2rem)] sm:min-h-[62px] lg:pl-12">
          <Side key={`a${course.title}`} offer={course} label="Academy" icon={<GraduationCap size={11} />} className="flex-1" />
          <a
            href={telHref(site.phoneDisplay)}
            className="hidden shrink-0 items-center gap-2 rounded-full bg-black/20 px-3 py-1.5 text-right text-[11px] font-bold leading-tight ring-1 ring-white/20 2xl:flex"
          >
            <span className="text-white/80">Call to order</span>
            <span className="text-base font-black tracking-tight">{site.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
