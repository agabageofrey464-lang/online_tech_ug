"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  ChevronDown,
  Code2,
  GraduationCap,
  Heart,
  HelpCircle,
  Home,
  Menu,
  Truck,
  MapPin,
  Package,
  Phone,
  Search,
  ShoppingBag,
  ShoppingCart,
  Star,
  User,
} from "lucide-react";
import { nav, navGroups, site, whatsappLink } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { SearchBar } from "@/components/search-bar";
import { HeaderAccount } from "@/components/header-account";
import { BrandLogoFull } from "@/components/brand-logo-full";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

// The category strip — product-first.
const CATEGORIES = [
  { href: "/shop", label: "All Products" },
  { href: "/shop?cat=Phones", label: "Phones" },
  { href: "/shop?cat=Laptops", label: "Laptops" },
  { href: "/shop?cat=Desktops", label: "Desktops" },
  { href: "/shop?cat=Components", label: "Components" },
  { href: "/shop?cat=Accessories", label: "Accessories" },
  { href: "/shop?cat=Networking", label: "Networking" },
  { href: "/shop?cat=Storage", label: "Storage" },
  { href: "/stickers", label: "Laptop Skins" },
  { href: "/shop?cat=Power", label: "Power" },
  { href: "/marketplace", label: "Marketplace" },
];

function HeaderCart() {
  const { count, open } = useCart();
  return (
    <button
      onClick={open}
      aria-label={`Cart, ${count} items`}
      className="relative flex items-center gap-1.5 rounded-md px-2 py-2 text-ink-800 transition hover:text-brand-600"
    >
      <span className="relative">
        <ShoppingCart size={24} strokeWidth={1.4} />
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-extrabold leading-none text-white ring-2 ring-white">
            {count}
          </span>
        )}
      </span>
      <span className="sr-only">Cart</span>
    </button>
  );
}

function HeaderWishlist() {
  const { count } = useWishlist();
  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist, ${count} items`}
      className="relative hidden items-center gap-1.5 rounded-md px-2 py-2 text-ink-800 transition hover:text-brand-600 lg:flex"
    >
      <span className="relative">
        <Heart size={23} strokeWidth={1.4} />
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-extrabold leading-none text-white ring-2 ring-white">
            {count}
          </span>
        )}
      </span>
      <span className="sr-only">Saved</span>
    </Link>
  );
}

// A wide screen has two slim rows, as a quiet shop does: a brown line with one
// message and three links, then the logo, a handful of serif links and the
// icons. Everything else is one hover away, under "More".
// The four things we do, each with a menu of its own. Hovering (or tabbing to)
// one opens its pages; the name itself goes to the front page of that business.
type Menu = { label: string; href: string; match: string[]; blurb: string; links: { href: string; label: string }[] };
const MENUS: Menu[] = [
  {
    label: "Shop",
    href: "/shop",
    match: ["/shop", "/marketplace", "/find", "/cart", "/checkout", "/wishlist"],
    blurb: "Phones, computers and accessories — tested, warranted, delivered countrywide.",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/shop?cat=Phones", label: "Phones" },
      { href: "/shop?cat=Laptops", label: "Laptops" },
      { href: "/shop?cat=Desktops", label: "Desktops" },
      { href: "/shop?cat=Components", label: "Components" },
      { href: "/shop?cat=Accessories", label: "Accessories" },
      { href: "/shop?cat=Storage", label: "Storage" },
      { href: "/shop?cat=Networking", label: "Networking" },
      { href: "/shop?cat=Power", label: "Power" },
      { href: "/stickers", label: "Laptop Skins & Stickers" },
      { href: "/shop?deals=1", label: "Price Drops" },
      { href: "/find", label: "Find My Laptop" },
      { href: "/marketplace", label: "Marketplace" },
    ],
  },
  {
    label: "Learn Academy",
    href: "/learn",
    match: ["/learn", "/academy"],
    blurb: "22 computer courses in short lessons, in class or online, with a certificate.",
    links: [
      { href: "/learn", label: "All Courses" },
      { href: "/academy", label: "My Academy" },
      { href: "/learn/computer-basics", label: "Computer Basics" },
      { href: "/learn/microsoft-office", label: "Microsoft Office" },
      { href: "/learn/microsoft-excel", label: "Microsoft Excel" },
      { href: "/learn/graphic-design", label: "Graphic Design" },
      { href: "/learn/web-development", label: "Web Development" },
      { href: "/learn/python-programming", label: "Python Programming" },
    ],
  },
  {
    label: "Software",
    href: "/development",
    match: ["/development", "/request", "/portfolio", "/pricing", "/services", "/freelancers"],
    blurb: "Websites, mobile apps and business systems, built and looked after for you.",
    links: [
      { href: "/development", label: "Software Development" },
      { href: "/request", label: "Request Software" },
      { href: "/services", label: "All Services" },
      { href: "/portfolio", label: "Our Work" },
      { href: "/pricing", label: "Pricing & Plans" },
      { href: "/track", label: "Track Your Project" },
      { href: "/freelancers", label: "Freelancers" },
    ],
  },
  {
    label: "Internships",
    href: "/internship",
    match: ["/internship", "/jobs"],
    blurb: "Online industrial training for university and college students, on real client work.",
    links: [
      { href: "/internship", label: "Industrial Training" },
      { href: "/internship#apply", label: "Apply For A Place" },
      { href: "/jobs", label: "Jobs" },
    ],
  },
];
const TOP_LINKS = [
  { href: "/track", label: "Track Order" },
  { href: "/about", label: "About Us" },
  { href: "/stores", label: "Branches" },
];
const IN_MENUS = new Set([...MENUS.flatMap((m) => m.links.map((l) => l.href)), ...TOP_LINKS.map((l) => l.href)]);
const MORE_LINKS = [
  { href: "/sell", label: "Sell With Us" },
  ...navGroups.flatMap((g) => g.items).filter((it) => !IN_MENUS.has(it.href)),
];
const ANNOUNCEMENTS = [
  { text: "Same-day delivery when you order before 7pm", cta: "Details", href: "/help" },
  { text: "Free setup on laptops over UGX 1M", cta: "Shop Laptops", href: "/shop?cat=Laptops" },
  { text: "We build websites, apps & business systems", cta: "Get A Quote", href: "/development" },
  { text: "Online internships for university students", cta: "Apply Now", href: "/internship" },
  { text: "22 computer courses, in class or online", cta: "Browse Courses", href: "/learn" },
  { text: "Free diagnosis, repairs from UGX 30,000", cta: "Book A Repair", href: "/services#repairs-support" },
];
// The thin line at the very top: the businesses under one roof, side by side,
// the way a family of stores names its sisters.
const FAMILY = [
  { href: "/shop", label: "Online Tech Shop", match: ["/shop", "/marketplace", "/stickers", "/find"] },
  { href: "/learn", label: "Learn Academy", match: ["/learn", "/academy"] },
  { href: "/development", label: "Software & Websites", match: ["/development", "/portfolio", "/request", "/pricing"] },
  { href: "/internship", label: "Internships", match: ["/internship", "/jobs"] },
];
// The row of departments under the search box.
const DEPARTMENTS = [
  { href: "/shop?cat=Phones", label: "Phones" },
  { href: "/shop?cat=Laptops", label: "Laptops" },
  { href: "/shop?cat=Desktops", label: "Desktops" },
  { href: "/shop?cat=Components", label: "Components" },
  { href: "/shop?cat=Accessories", label: "Accessories" },
  { href: "/shop?cat=Storage", label: "Storage", wide: true },
  { href: "/shop?cat=Networking", label: "Networking", wide: true },
  { href: "/stickers", label: "Laptop Skins", wide: true },
];
// The link row of the wide header: what we do first, the rest muted after.
const UTILITY = navGroups.flatMap((g) => g.items);
const UTILITY_PRIMARY = UTILITY.slice(0, 5);
const UTILITY_SECONDARY = UTILITY.slice(5);
// The three businesses, each in its own colour.
const PILLS = [
  { href: "/shop", label: "Shop", sub: "Computers", icon: ShoppingBag, bg: "bg-brand-500 hover:bg-brand-600", ink: "text-brand-600" },
  { href: "/learn", label: "Learn", sub: "Academy", icon: GraduationCap, bg: "bg-green-600 hover:bg-green-700", ink: "text-green-700" },
  { href: "/development", label: "Develop", sub: "Software", icon: Code2, bg: "bg-ink-700 hover:bg-ink-800", ink: "text-ink-700" },
];
const deptLink = "flex items-center gap-1 whitespace-nowrap border-b-[3px] py-3 text-[14.5px] transition xl:text-[15.5px]";

/** An icon with its name beneath it, as the header's right-hand buttons are drawn. */
function IconLabel({ href, icon: I, label, badge = 0 }: { href: string; icon: typeof User; label: string; badge?: number }) {
  return (
    <Link href={href} className="group flex flex-col items-center gap-0.5 px-2 text-ink-800 transition hover:text-brand-600">
      <span className="relative">
        <I size={25} strokeWidth={1.4} />
        {badge > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[12px] leading-none">{label}</span>
    </Link>
  );
}

function WishlistIcon() {
  const { count } = useWishlist();
  return (
    <span className="relative">
      <Heart size={23} strokeWidth={1.6} />
      {count > 0 && (
        <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">{count}</span>
      )}
    </span>
  );
}

function CartInline() {
  const { count, open } = useCart();
  return (
    <button type="button" onClick={open} aria-label={`Cart, ${count} items`} className="flex items-center gap-1.5 text-ink-800 transition hover:text-brand-600">
      <span className="relative">
        <ShoppingCart size={24} strokeWidth={1.6} />
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">{count}</span>
        )}
      </span>
      <span className="text-[15px] font-semibold">Cart</span>
    </button>
  );
}

function WishlistLabel() {
  const { count } = useWishlist();
  return <IconLabel href="/wishlist" icon={Heart} label="Lists" badge={count} />;
}

function CartLabel() {
  const { count, open } = useCart();
  return (
    <button type="button" onClick={open} aria-label={`Cart, ${count} items`} className="flex flex-col items-center gap-0.5 px-2 text-ink-800 transition hover:text-brand-600">
      <span className="relative">
        <ShoppingCart size={25} strokeWidth={1.4} />
        <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">
          {count}
        </span>
      </span>
      <span className="text-[12px] leading-none">Cart</span>
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // The message line moves on to the next message every few seconds.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 6000);
    return () => clearInterval(t);
  }, []);
  const a = ANNOUNCEMENTS[tick % ANNOUNCEMENTS.length];

  const menu = (m: Menu, accent = false) => {
    const on = m.match.some((x) => pathname.startsWith(x));
    return (
      <div key={m.href} className="group/menu">
        <Link
          href={m.href}
          className={`${deptLink} ${
            on
              ? "!border-brand-500 text-brand-600"
              : `!border-transparent ${accent ? "font-semibold text-brand-600" : "text-ink-900"} group-hover/menu:!border-brand-500 group-hover/menu:text-brand-600`
          }`}
        >
          {m.label} <ChevronDown size={14} strokeWidth={1.75} />
        </Link>
        <div className="invisible absolute left-0 top-full z-50 w-[34rem] opacity-0 transition duration-150 group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100">
          <div className="grid grid-cols-[13rem_1fr] bg-white shadow-2xl ring-1 ring-ink-600/10">
            <div className="bg-brand-500 p-6 text-white">
              <p className="text-[24px] font-semibold leading-tight">{m.label}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/90">{m.blurb}</p>
              <Link href={m.href} className="mt-4 inline-block border-b border-white pb-0.5 text-[11px] font-bold uppercase tracking-[0.16em]">
                Go to {m.label}
              </Link>
            </div>
            <div className="grid grid-cols-2 content-start gap-x-6 gap-y-1 p-6">
              {m.links.map((l) => (
                <Link key={l.href} href={l.href} className="py-1.5 text-[14.5px] text-ink-800 hover:text-brand-600 hover:underline hover:underline-offset-4">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Phones: the family of businesses, in one thin dark line. */}
      <div className="bg-ink-900 text-white lg:hidden">
        <nav className="container-wide flex items-center overflow-x-auto py-2 text-[12px] no-scrollbar sm:justify-center sm:text-[13px]">
          {FAMILY.map((f, i) => {
            const on = f.match.some((x) => pathname.startsWith(x));
            return (
              <span key={f.href} className="flex shrink-0 items-center">
                {i > 0 && <span aria-hidden className="mx-3 h-3.5 w-px bg-white/45 sm:mx-4" />}
                <Link href={f.href} className={`whitespace-nowrap hover:underline hover:underline-offset-4 ${on ? "font-bold" : "text-white/90"}`}>
                  {f.label}
                </Link>
              </span>
            );
          })}
        </nav>
      </div>

      {/* Phones: one message at a time, with its link. */}
      <div className="bg-ink-700 text-white lg:hidden">
        <div key={tick} className="strip-rise">
        <p className="container-wide flex items-center justify-center gap-2 py-2 text-[13px] font-semibold sm:text-[14px]">
          <Truck size={17} strokeWidth={1.8} className="hidden shrink-0 sm:block" />
          <span className="truncate">{a.text}</span>
          <Link href={a.href} className="shrink-0 whitespace-nowrap font-medium underline underline-offset-4 hover:text-brand-200">
            {a.cta}
          </Link>
        </p>
        </div>
      </div>

      <header id="top" className="sticky top-0 z-50 border-b border-ink-600/15 bg-white">
        {/* Phone and tablet: menu, logo, account and cart; the search beneath. */}
        <div className="container-wide lg:hidden">
          <div className="flex items-center gap-2 py-2">
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="-ml-2 rounded-md p-2 text-ink-800 hover:bg-ink-50"
            >
              <Menu size={26} strokeWidth={1.5} />
            </button>
            <Link href="/" className="flex shrink-0 items-center text-ink-900">
              <BrandLogoFull size="sm" onLight />
            </Link>
            <div className="-mr-2 ml-auto flex items-center">
              <Link href="/account" aria-label="Your account" className="rounded-md px-2 py-2 text-ink-800 hover:text-brand-600">
                <User size={24} strokeWidth={1.4} />
              </Link>
              <HeaderCart />
            </div>
          </div>
          <div className="pb-2.5">
            <SearchBar variant="store" />
          </div>
        </div>

        {/* Wide screens: a dark row of links — selling, what we do with the
            internships as a yellow badge, the rest muted, and the phone. */}
        <div className="hidden bg-ink-800 text-white lg:block">
          <div className="container-wide flex items-center gap-x-4 py-2 text-[13px] font-medium">
            <Link href="/sell" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1 text-white transition hover:bg-brand-600">
              <Star size={12} className="fill-white" /> Sell on {site.name}
            </Link>
            <nav className="flex min-w-0 flex-1 items-center gap-x-4 overflow-x-auto no-scrollbar">
              {UTILITY_PRIMARY.map((it) =>
                it.href === "/internship" ? (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#FCDC04] px-3 py-1 font-bold text-ink-900 shadow-sm transition hover:brightness-105 ${pathname.startsWith(it.href) ? "ring-2 ring-white" : ""}`}
                  >
                    <Briefcase size={13} strokeWidth={2.4} />
                    {it.label}
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75 motion-reduce:hidden" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
                    </span>
                  </Link>
                ) : (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={`whitespace-nowrap border-b-2 pb-0.5 transition ${pathname.startsWith(it.href) ? "border-brand-500" : "border-transparent hover:border-brand-400"}`}
                  >
                    {it.label}
                  </Link>
                ),
              )}
              <span className="h-3.5 w-px shrink-0 bg-white/25" aria-hidden />
              {UTILITY_SECONDARY.map((it) => (
                <Link key={it.href} href={it.href} className="whitespace-nowrap text-white/60 transition hover:text-white">
                  {it.label}
                </Link>
              ))}
            </nav>
            <a href={telHref(site.phoneDisplay)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 transition hover:bg-white/20">
              <Phone size={12} /> {site.phoneDisplay}
            </a>
          </div>
        </div>

        {/* Wide screens: the logo, the round search with its orange button,
            and Account, Help, Saved and Cart with their names. */}
        <div className="container-wide hidden items-center gap-6 py-3 lg:flex">
          <Link href="/" className="flex shrink-0 items-center text-ink-900">
            <BrandLogoFull size="md" onLight />
          </Link>
          <div className="min-w-0 flex-1 xl:max-w-3xl">
            <SearchBar className="border border-ink-600/20 shadow-sm" />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-4 xl:gap-6">
            <HeaderAccount onLight />
            <Link href="/help" className="flex items-center gap-1.5 text-ink-800 transition hover:text-brand-600">
              <HelpCircle size={23} strokeWidth={1.7} />
              <span className="text-[15px] font-semibold">Help</span>
            </Link>
            <Link href="/wishlist" className="flex items-center gap-1.5 text-ink-800 transition hover:text-brand-600">
              <WishlistIcon />
              <span className="text-[15px] font-semibold">Saved</span>
            </Link>
            <CartInline />
          </div>
        </div>

        {/* Wide screens: the departments, spread from edge to edge. */}
        <div className="hidden border-t border-ink-600/10 lg:block">
          <nav className="container-wide relative flex items-center justify-between gap-x-3">
            <Link
              href="/"
              className={`${deptLink} gap-1.5 ${pathname === "/" ? "!border-brand-500 font-semibold text-brand-600" : "!border-transparent text-ink-900 hover:!border-brand-500 hover:text-brand-600"}`}
            >
              <Home size={16} strokeWidth={1.8} /> Home
            </Link>
            {/* The three businesses as coloured pills, as before. */}
            <span className="flex shrink-0 items-center gap-2 border-r border-ink-600/10 pr-4">
              {PILLS.map((b) => {
                // Each business opens a menu of its own pages, so every page
                // of the academy and the software side is in the top bar.
                const m = MENUS.find((x) => x.href === b.href);
                return (
                  <span key={b.href} className="group/menu py-2">
                    <Link
                      href={b.href}
                      className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[14px] font-semibold text-white shadow-sm ring-1 ring-black/5 transition ${b.bg}`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white ${b.ink}`}>
                        <b.icon size={14} strokeWidth={2.4} />
                      </span>
                      <span className="leading-none">
                        {b.label}
                        <span className="ml-1 hidden text-[10px] font-bold uppercase tracking-[0.08em] text-white/80 2xl:inline">{b.sub}</span>
                      </span>
                      {m && <ChevronDown size={13} strokeWidth={2.2} className="transition group-hover/menu:rotate-180" />}
                    </Link>
                    {m && (
                      <span className="invisible absolute left-0 top-full z-50 block w-[38rem] opacity-0 transition duration-150 group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100">
                        <span className="grid grid-cols-[14rem_1fr] bg-white shadow-2xl ring-1 ring-ink-600/10">
                          <span className={`block p-6 text-white ${b.bg.split(" ")[0]}`}>
                            <span className="block font-display text-[28px] leading-tight">{m.label}</span>
                            <span className="mt-2 block text-[13.5px] leading-relaxed text-white/90">{m.blurb}</span>
                            <Link href={m.href} className="mt-4 inline-block border-b border-white pb-0.5 text-[11px] font-bold uppercase tracking-[0.16em]">
                              Go to {m.label}
                            </Link>
                          </span>
                          <span className="grid grid-cols-2 content-start gap-x-6 gap-y-1 p-6">
                            {m.links.map((l) => (
                              <Link key={l.href} href={l.href} className="py-1.5 text-[14.5px] text-ink-800 hover:text-brand-600 hover:underline hover:underline-offset-4">
                                {l.label}
                              </Link>
                            ))}
                          </span>
                        </span>
                      </span>
                    )}
                  </span>
                );
              })}
            </span>
            {DEPARTMENTS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className={`${deptLink} !border-transparent text-ink-900 hover:!border-brand-500 hover:text-brand-600 ${d.wide ? "hidden xl:flex" : ""}`}
              >
                {d.label}
              </Link>
            ))}
            <div className="group/more">
              <button type="button" className={`${deptLink} !border-transparent text-ink-900 group-hover/more:text-brand-600`}>
                More <ChevronDown size={14} strokeWidth={1.75} />
              </button>
              <div className="invisible absolute right-0 top-full z-50 w-[26rem] opacity-0 transition duration-150 group-hover/more:visible group-hover/more:opacity-100 group-focus-within/more:visible group-focus-within/more:opacity-100">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 bg-white p-6 shadow-2xl ring-1 ring-ink-600/10">
                  {MORE_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="py-1.5 text-[14.5px] text-ink-800 hover:text-brand-600 hover:underline hover:underline-offset-4">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Phones and tablets: the departments as a row of quiet white pills
            that slides sideways. */}
        <nav className="border-t border-ink-600/10 bg-white lg:hidden">
          <div className="container-wide flex items-center gap-x-2 overflow-x-auto py-2 no-scrollbar">
            <Link
              href="/"
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] transition ${
                pathname === "/" ? "border-ink-900 bg-ink-900 text-white" : "border-brand-500 bg-white text-brand-600"
              }`}
            >
              <Home size={13} strokeWidth={2.2} /> Home
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] transition ${
                  pathname === c.href ? "border-ink-900 bg-ink-900 text-white" : "border-ink-700/25 bg-white text-ink-900 hover:border-ink-900"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </nav>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="max-h-[70vh] overflow-y-auto border-t border-ink-600/10 bg-white lg:hidden">
          <nav className="container-wide flex flex-col py-2">
            <div className="flex items-center gap-3 px-3 pb-2 text-sm text-ink-700/70">
              <User size={18} /> <Link href="/account" onClick={() => setOpen(false)} className="font-semibold">Your account</Link>
            </div>
            <div className="flex items-center gap-3 px-3 pb-2 text-sm text-ink-700/70">
              <Package size={18} /> <Link href="/account#orders" onClick={() => setOpen(false)} className="font-semibold">Your orders</Link>
            </div>
            <div className="flex items-center gap-3 px-3 pb-2 text-sm text-ink-700/70">
              <Heart size={18} /> <Link href="/wishlist" onClick={() => setOpen(false)} className="font-semibold">Your list</Link>
            </div>
            {[
              ...nav,
              ...navGroups
                .flatMap((g) => g.items)
                .filter((it) => !nav.some((n) => n.href === it.href)),
            ].map((item) =>
              item.href === "/internship" ? (
                // The same yellow badge as the desktop bar, as a full row.
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="my-1 flex items-center gap-2.5 rounded-md bg-[#FCDC04] px-3 py-3 text-base font-extrabold text-ink-900 shadow-sm"
                >
                  <Briefcase size={18} strokeWidth={2.4} />
                  {item.label}
                  <span className="ml-auto rounded-full bg-ink-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                    Apply now →
                  </span>
                </Link>
              ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-3 text-base font-medium ${
                  pathname === item.href ? "bg-brand-50 text-brand-700" : "text-ink-700"
                }`}
              >
                {item.label}
              </Link>
              ),
            )}
            <a href={telHref(site.phoneDisplay)} className="flex items-center gap-2 rounded-md px-3 py-3 text-base font-medium text-ink-700">
              <Phone size={16} /> {site.phoneDisplay}
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="mt-1 rounded-md bg-brand-500 px-3 py-3 text-center text-base font-semibold text-white"
            >
              Chat on WhatsApp
            </a>
          </nav>
        </div>
      )}
      </header>
    </>
  );
}
