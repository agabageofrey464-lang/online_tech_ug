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
  /** A product that has just been listed: shown under "New in" rather than "Store". */
  fresh?: boolean;
};

const picture = (o: Offer) => (o.photo ? thumb(o.photo) : `/products/${o.img}.webp`);
const ugxShort = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

const STORE: Offer[] = [
  { title: "Online Tech Festival", deal: "NEW ARRIVALS EVERY WEEK", note: "Phones, laptops, skins and more", href: "/shop", bg: "bg-brand-600", img: "hp-elitebook-840-g8" },
  { title: "Laptop Week", deal: "FROM UGX 900,000", note: "UK-used & brand new", href: "/shop?cat=Laptops", bg: "bg-brand-500", img: "hp-elitebook-840-g3" },
  { title: "Storage Deals", deal: "1TB SSD · UGX 580,000", note: "Genuine, warranted", href: "/shop?cat=Storage", bg: "bg-brand-700", img: "ssd-480gb-sata" },
  { title: "Repairs & Support", deal: "FROM UGX 30,000", note: "Onsite & remote", href: "/services", bg: "bg-brand-600", img: "ram-ddr4-8gb-sodimm" },
  { title: "MacBook Deals", deal: "APPLE IN STOCK", note: "Sealed & UK-used", href: "/shop?brand=Apple", bg: "bg-brand-500", img: "macbook-air-m1" },
  { title: "Gaming Zone", deal: "RTX LAPTOPS", note: "OMEN · Victus · Legion", href: "/shop?q=gaming", bg: "bg-brand-700", img: "lenovo-legion-5-15" },
  { title: "Upgrade Your PC", deal: "RAM FROM UGX 130,000", note: "Free fitting in shop", href: "/shop?cat=Components", bg: "bg-brand-600", img: "ram-ddr4-8gb-dimm" },
  { title: "Desktops In Stock", deal: "FROM UGX 750,000", note: "Office & home towers", href: "/shop?cat=Desktops", bg: "bg-brand-500", img: "hp-280-g6-desktop" },
  { title: "Power & Backup", deal: "POWER BANKS & UPS", note: "Keep working in outages", href: "/shop?cat=Power", bg: "bg-brand-700", img: "power-bank-20000" },
  { title: "Accessories Sale", deal: "FROM UGX 20,000", note: "Mice · keyboards · bags", href: "/shop?cat=Accessories", bg: "bg-brand-600", img: "logitech-mk270" },
  { title: "Carry It Safely", deal: "BAGS & SLEEVES", note: "Padded, water-resistant", href: "/shop?cat=Accessories", bg: "bg-brand-500", img: "laptop-sleeve-grey" },
  { title: "Networking Gear", deal: "ROUTERS & SWITCHES", note: "TP-Link · Netgear", href: "/shop?cat=Networking", bg: "bg-brand-700", img: "tp-link-archer-c6" },
  { title: "Charge Anywhere", deal: "65W USB-C", note: "Fast, universal chargers", href: "/shop?cat=Power", bg: "bg-brand-600", img: "usb-c-charger-65w" },
  { title: "Sell With Us", deal: "UGX 50,000 A MONTH", note: "0% commission on every sale", href: "/sell", bg: "bg-brand-500", img: "asus-zenbook-14" },
  // ── added so that no two days need show the same handful ──
  { title: "Phones Are Here", deal: "TECNO · INFINIX · IPHONE", note: "From our partner vendors", href: "/shop?cat=Phones", bg: "bg-brand-700", img: "iphone-13-128gb" },
  { title: "Laptop Skins", deal: "FULL BODY · UGX 70,000", note: "20 designs, fitted at our shop", href: "/stickers", bg: "bg-brand-600", photo: "/products/stickers/laptop-skin-black-greek-key.webp" },
  { title: "Same-Day Delivery", deal: "ORDER BEFORE 7PM", note: "Transport worked out from your distance", href: "/shop", bg: "bg-brand-500", img: "hp-elitebook-840-g6-wa0017-p41" },
  { title: "Lenovo ThinkPads", deal: "BUILT FOR WORK", note: "Tested, with warranty", href: "/shop?brand=Lenovo", bg: "bg-brand-700", img: "lenovo-thinkpad-t14" },
  { title: "HP EliteBooks", deal: "BUSINESS LAPTOPS", note: "UK-used and brand new", href: "/shop?brand=HP", bg: "bg-brand-600", img: "hp-elitebook-840-g8" },
  { title: "Dell Latitudes", deal: "IN STOCK NOW", note: "Slim, strong, long battery", href: "/shop?brand=Dell", bg: "bg-brand-500", img: "dell-latitude-7420" },
  { title: "Find My Laptop", deal: "TELL US YOUR BUDGET", note: "Honest advice, no pressure", href: "/find", bg: "bg-brand-700", img: "dell-xps-13-9310" },
  { title: "Websites & Systems", deal: "BUILT FOR YOUR BUSINESS", note: "Shops, schools, SACCOs, POS", href: "/development", bg: "bg-brand-600", photo: "/courses/web-development.webp" },
  { title: "Visit Ivory Plaza", deal: "SHOP B7 · GROUND FLOOR", note: "And Stagyon and E-Tower", href: "/stores", bg: "bg-brand-500", img: "hp-280-g6-desktop" },
  { title: "No Sale, No Loss", deal: "ONE MORE MONTH FREE", note: "For vendors who have not sold yet", href: "/sell#plans", bg: "bg-brand-700", img: "logitech-mk270" },
  { title: "Pay By Airtel Money", deal: "0756 839 270", note: "Merchant ID 7148212", href: "/pay", bg: "bg-brand-600", img: "power-bank-20000" },
  { title: "Speed Up Your Laptop", deal: "SSD + RAM FITTED", note: "Same day, in the shop", href: "/shop?cat=Storage", bg: "bg-brand-500", img: "ssd-480gb-sata" },
];

/** The academy's standing offers. Dated intakes are added in front of these
 *  from the intake list, so a date that has passed leaves on its own. */
const ACADEMY: Offer[] = [
  { title: "Learn & Earn", deal: "22 COURSES", note: "Physical or online · certificates", href: "/learn", bg: "bg-green-700", photo: "/courses/microsoft-office.webp" },
  { title: "Microsoft Excel", deal: "UGX 530,000", note: "2 months · certificate", href: "/learn/microsoft-excel", bg: "bg-ink-600", photo: "/courses/microsoft-excel.webp" },
  { title: "Graphic Design", deal: "PHOTOSHOP · CANVA", note: "The work Kampala businesses buy", href: "/learn/graphic-design", bg: "bg-brand-700", photo: "/courses/graphic-design.webp" },
  { title: "Web Development", deal: "BUILD REAL SITES", note: "HTML, CSS, JavaScript & WordPress", href: "/learn/web-development", bg: "bg-brand-600", photo: "/courses/web-development.webp" },
  { title: "Industrial Training", deal: "UGX 150,000 · 7 WEEKS", note: "Every university welcome", href: "/internship", bg: "bg-green-800", photo: "/courses/python-programming.webp" },
  { title: "Pay Per Lesson", deal: "FROM UGX 5,000", note: "Study at your own pace", href: "/learn", bg: "bg-ink-700", photo: "/courses/computer-basics.webp" },
  // ── added so that no two days need show the same handful ──
  { title: "Registration Now", deal: "ONLY UGX 50,000", note: "Paid once, when you join", href: "/learn", bg: "bg-green-700", photo: "/courses/microsoft-word.webp" },
  { title: "Every Course", deal: "2 MONTHS · CERTIFICATE", note: "In class or online", href: "/learn", bg: "bg-green-700", photo: "/courses/microsoft-365-teams.webp" },
  { title: "Python Programming", deal: "CODE FROM ZERO", note: "Your first real programs", href: "/learn/python-programming", bg: "bg-green-700", photo: "/courses/python-programming.webp" },
  { title: "Computer Networking", deal: "IT ESSENTIALS", note: "Cabling, Wi-Fi, IP addressing", href: "/learn/computer-networking", bg: "bg-green-700", photo: "/courses/computer-networking.webp" },
  { title: "Cybersecurity", deal: "STAY SAFE ONLINE", note: "Protect accounts and data", href: "/learn/cybersecurity-basics", bg: "bg-green-700", photo: "/courses/cybersecurity-basics.webp" },
  { title: "Digital Marketing", deal: "SELL ON SOCIAL MEDIA", note: "Pages, adverts and content", href: "/learn/digital-marketing", bg: "bg-green-700", photo: "/courses/digital-marketing.webp" },
  { title: "Video Editing", deal: "ADVERTS & REELS", note: "Shoot, cut and publish", href: "/learn/video-editing", bg: "bg-green-700", photo: "/courses/video-editing.webp" },
  { title: "AutoCAD", deal: "2D PLANS · 3D MODELS", note: "For engineering and building", href: "/learn/autocad", bg: "bg-green-700", photo: "/courses/autocad.webp" },
  { title: "QuickBooks", deal: "ACCOUNTS MADE SIMPLE", note: "Invoices, stock and payroll", href: "/learn/quickbooks-accounting", bg: "bg-green-700", photo: "/courses/quickbooks-accounting.webp" },
  { title: "Computer Basics", deal: "START HERE", note: "No experience needed", href: "/learn/computer-basics", bg: "bg-green-700", photo: "/courses/computer-basics.webp" },
  { title: "Mobile App Development", deal: "BUILD ANDROID APPS", note: "From idea to phone", href: "/learn/mobile-app-development", bg: "bg-green-700", photo: "/courses/mobile-app-development.webp" },
  { title: "Internship Fields", deal: "18 IT FIELDS", note: "And 10 for other courses", href: "/internship", bg: "bg-green-700", photo: "/courses/graphic-design.webp" },
];

/**
 * Today's hand from a pool: a different handful each day, the same for
 * everyone on that day. The pool is shuffled by the date, so a visitor who
 * comes back tomorrow is shown other things, and one who comes back next
 * week has seen most of the shop.
 */
function todays<T>(pool: T[], count: number, day: number, salt: number): T[] {
  let seed = (day * 9301 + salt * 49297 + 233280) % 233280;
  const next = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const list = [...pool];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, Math.min(count, list.length));
}

/** Days since 1970, in Kampala, so the hand changes at midnight there. */
const kampalaDay = () => Math.floor((Date.now() + 3 * 3600_000) / 86_400_000);

type Listed = { slug: string; name: string; category: string; price_ugx: number; image_url: string; in_stock: boolean; seller?: string | null };

/** How many of each are shown in a day. */
const STORE_TODAY = 8;
const ACADEMY_TODAY = 6;
const NEW_TODAY = 4;

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

/** One business emoji for where a message leads, so each strip says at a glance what it is about. */
function emojiFor(href: string, text = ""): string {
  const t = `${href} ${text}`.toLowerCase();
  if (t.includes("intern")) return "💼";
  if (t.includes("/learn") || t.includes("academy") || t.includes("course") || t.includes("intake")) return "🎓";
  if (t.includes("repair") || t.includes("services")) return "🛠️";
  if (t.includes("development") || t.includes("software") || t.includes("website")) return "💻";
  if (t.includes("phone")) return "📱";
  if (t.includes("laptop") || t.includes("ram") || t.includes("ssd")) return "💻";
  if (t.includes("deliver")) return "🚚";
  if (t.includes("network") || t.includes("router")) return "📶";
  if (t.includes("new")) return "✨";
  return "🛒";
}

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
    <Link href={offer.href} className={`flex min-w-0 items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Small, round and lit from behind, so it reads as a picture on a
          banner rather than a thumbnail in a list. */}
      <span className="strip-photo relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 sm:h-11 sm:w-11">
        {offer.photo?.startsWith("http") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={offer.photo} alt={offer.title} width={44} height={44} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Image
            src={picture(offer)}
            alt={offer.title}
            width={44}
            height={44}
            loading="lazy"
            className={offer.photo ? "h-full w-full object-cover" : "h-7 w-7 object-contain sm:h-9 sm:w-9"}
          />
        )}
      </span>
      <span className="strip-clip min-w-0">
        <span className="flex items-center gap-1 text-[9.5px] font-black uppercase leading-none tracking-[0.2em] text-white/70 sm:text-[10px]">
          {icon}
          {label}
        </span>
        <span className="strip-rise mt-0.5 truncate font-display text-[15px] font-black uppercase leading-tight tracking-tight drop-shadow-sm sm:text-lg">
          <span aria-hidden className="mr-1.5 normal-case">{offer.fresh ? "✨" : emojiFor(offer.href, offer.title)}</span>
          {offer.title}
        </span>
      </span>
      <span className="strip-spring shrink-0 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-extrabold text-ink-900 shadow-sm sm:px-3 sm:text-[13px]">
        {offer.deal}
      </span>
      <span className="strip-rise-late hidden truncate text-xs font-medium text-white/90 lg:inline">{offer.note}</span>
    </Link>
  );
}

/** How long before one half or the other changes its offer. */
const TURN = 3000;

export function PromoStrip() {
  const [tick, setTick] = useState(0);
  // The first paint is the same for everyone, so the server's copy and the
  // browser's agree. Today's hand, and what has just been listed, follow once
  // the page is running.
  const [storeList, setStoreList] = useState<Offer[]>(() => STORE.slice(0, STORE_TODAY));
  const [academy, setAcademy] = useState<Offer[]>(academyOffers);

  useEffect(() => {
    const day = kampalaDay();
    const hand = todays(STORE, STORE_TODAY, day, 1);
    setStoreList(hand);
    // Dated intakes always show; the standing offers are today's handful.
    const intakes = academyOffers().slice(0, academyOffers().length - ACADEMY.length);
    setAcademy([...intakes, ...todays(ACADEMY, ACADEMY_TODAY, day, 2)]);

    // What has just been listed: vendors' newest products, and the newest of
    // our own shelves. Fetched when the browser is idle; the strip does not wait.
    let alive = true;
    const load = () =>
      fetch("/api/browse")
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((d) => {
          if (!alive) return;
          const items = ((Array.isArray(d) ? d : (d.items ?? [])) as Listed[]).filter((p) => p.in_stock);
          const seen = new Set<string>();
          const distinct = (list: Listed[]) => list.filter((p) => !seen.has(p.name.trim().toLowerCase()) && seen.add(p.name.trim().toLowerCase()));
          // Vendors' listings arrive newest first; the newest shelf of our own is the skins.
          const fromVendors = distinct(items.filter((p) => p.seller)).slice(0, 6);
          const ours = distinct(items.filter((p) => !p.seller && p.category === "Stickers"));
          const pool = [...fromVendors, ...todays(ours, 3, day, 3)];
          const fresh: Offer[] = todays(pool, NEW_TODAY, day, 4).map((p) => ({
            title: p.name.trim(),
            deal: ugxShort(p.price_ugx),
            note: p.seller ? "Just listed in the shop" : "New in the shop",
            href: `/shop/${p.slug}`,
            bg: "bg-brand-500",
            photo: p.image_url,
            fresh: true,
          }));
          if (fresh.length === 0) return;
          // One new product after every two standing offers.
          const mixed: Offer[] = [];
          hand.forEach((o, k) => {
            mixed.push(o);
            if (k % 2 === 1 && fresh.length) mixed.push(fresh.shift() as Offer);
          });
          setStoreList([...mixed, ...fresh]);
        })
        .catch(() => {
          /* the standing offers carry on */
        });
    const idle = typeof requestIdleCallback === "function" ? requestIdleCallback(load, { timeout: 5000 }) : window.setTimeout(load, 2500);
    return () => {
      alive = false;
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle as number);
      else clearTimeout(idle as number);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), TURN);
    return () => clearInterval(t);
  }, []);

  // The store turns over on even ticks and the academy on odd ones, so on a
  // desktop the two halves never change together, and on a phone — where only
  // one is shown — each has a fresh offer when its turn comes.
  const store = storeList[Math.floor((tick + 1) / 2) % storeList.length];
  const course = academy[Math.floor(tick / 2) % academy.length];
  // The academy keeps one colour — the green of its button in the menu below —
  // and the store never borrows it, so the halves cannot land on the same
  // shade and lose the seam between them.
  const storeBg = store.bg.startsWith("bg-green") ? "bg-brand-600" : store.bg;
  // The academy takes a colour of its own each turn — crimson, gold, plum —
  // so it never melts into the green link row beneath it.
  const ACADEMY_BGS = ["bg-[#a50e27]", "bg-[#8a5a00]", "bg-[#7a1f5c]"];
  const academyBg = ACADEMY_BGS[Math.floor(tick / 2) % ACADEMY_BGS.length];
  const turn = tick % 2 === 0 ? "store" : "academy";

  return (
    <div className="relative flex overflow-hidden text-white">
      {/* ── Store ─────────────────────────────────────────────── */}
      <div
        className={`stripes relative z-10 min-w-0 flex-1 items-center transition-colors duration-500 ${storeBg} ${
          turn === "store" ? "flex" : "hidden"
        }`}
      >
        <div className="container-wide relative flex min-h-[46px] w-full min-w-0 items-center gap-3 overflow-hidden py-2 sm:min-h-[62px]">
          <span aria-hidden className="strip-shine" />
          <span aria-hidden key={`sc${store.title}`} className="strip-count" style={{ animationDuration: `${2 * TURN}ms` }} />
          <Side key={`s${store.title}`} offer={store} label={store.fresh ? "New in" : "Store"} icon={<ShoppingBag size={10} />} className="strip-float flex-1 lg:justify-center" />
          {/* Call to order belongs with the shop — a tablet has room for it
              here; a desktop moves it to the far end of the banner. */}
          <a
            href={telHref(site.phoneDisplay)}
            className="hidden shrink-0 items-center gap-2 rounded-full bg-black/15 px-3 py-1.5 text-[11px] font-bold leading-tight ring-1 ring-white/20 sm:flex"
          >
            <span className="text-white/80">Call</span>
            <span className="text-sm font-black tracking-tight">{site.phoneDisplay}</span>
          </a>
        </div>
      </div>

      {/* ── Academy ───────────────────────────────────────────── */}
      <div
        className={`stripes relative min-w-0 flex-1 items-center ${academyBg} ${
          turn === "academy" ? "flex" : "hidden"
        }`}
      >
        <div className="container-wide relative flex min-h-[46px] w-full min-w-0 items-center gap-3 overflow-hidden py-2 sm:min-h-[62px]">
          <span aria-hidden className="strip-shine" style={{ animationDelay: "1.7s" }} />
          <span aria-hidden key={`ac${course.title}`} className="strip-count" style={{ animationDuration: `${2 * TURN}ms` }} />
          <Side key={`a${course.title}`} offer={course} label="Academy" icon={<GraduationCap size={11} />} className="strip-float flex-1 lg:justify-center" />
          <a
            href={telHref(site.phoneDisplay)}
            className="hidden shrink-0 items-center gap-2 rounded-full bg-black/20 px-3 py-1.5 text-right text-[11px] font-bold leading-tight ring-1 ring-white/20 sm:flex"
          >
            <span className="text-white/80">Call to order</span>
            <span className="text-base font-black tracking-tight">{site.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
