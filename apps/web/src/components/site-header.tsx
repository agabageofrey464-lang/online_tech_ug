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
  { text: "Free Windows & Office setup on laptops over UGX 1M", cta: "Shop Laptops", href: "/shop?cat=Laptops" },
  { text: "We build websites, apps & business systems", cta: "Get A Quote", href: "/development" },
  { text: "Online internships for university students", cta: "Apply Now", href: "/internship" },
  { text: "22 computer courses, in class or online", cta: "Browse Courses", href: "/learn" },
  { text: "Free diagnosis, repairs from UGX 30,000", cta: "Book A Repair", href: "/services#repairs-support" },
];
// The row of plain capitals under the logo: the four businesses, each with its
// menu, and between them the parts of the shop people ask for by name.
const SHOP_ROW = [
  { href: "/shop?cat=Phones", label: "Phones" },
  { href: "/shop?cat=Laptops", label: "Laptops" },
  { href: "/shop?cat=Desktops", label: "Desktops" },
  { href: "/shop?cat=Accessories", label: "Accessories" },
];
const rowLink = "flex items-center gap-1 whitespace-nowrap border-b-2 py-4 font-sans text-[12.5px] font-medium uppercase tracking-[0.14em] transition xl:text-[14px]";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  // Known only in the browser — see the note in festival-strip.tsx.
  const [onInnerPage, setOnInnerPage] = useState(false);
  useEffect(() => setOnInnerPage(pathname !== "/"), [pathname]);
  // The top line shows three messages at a time and moves on by one, so all
  // five have their turn.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <header id="top" className="sticky top-0 z-50">
      {/* Phones and tablets: the same dark line, one message at a time. */}
      <div className="bg-ink-900 text-white lg:hidden">
        {(() => {
          const a = ANNOUNCEMENTS[tick % ANNOUNCEMENTS.length];
          return (
            <p key={tick} className="strip-rise container-wide flex items-center justify-center gap-2 py-2.5 text-[12.5px] font-semibold">
              <span className="truncate">{a.text} ›</span>
              <Link href={a.href} className="shrink-0 font-medium underline underline-offset-4">
                {a.cta}
              </Link>
            </p>
          );
        })()}
      </div>

      {/* Wide screens: one dark line of three messages, a rule between each. */}
      <div className="hidden bg-ink-900 text-white lg:block">
        <div className="container-wide grid grid-cols-2 divide-x divide-white/60 py-2.5 text-[13px] xl:grid-cols-3 xl:text-[14px]">
          {[0, 1, 2].map((i) => {
            const a = ANNOUNCEMENTS[(i + tick) % ANNOUNCEMENTS.length];
            return (
              <p key={i} className={`min-w-0 items-center justify-center gap-2 px-4 py-1 font-semibold ${i === 2 ? "hidden xl:flex" : "flex"}`}>
                <span className="truncate">{a.text} ›</span>
                <Link href={a.href} className="shrink-0 font-medium underline underline-offset-4 hover:text-brand-300">
                  {a.cta}
                </Link>
              </p>
            );
          })}
        </div>
      </div>

      {/* Main bar — white. A phone has the logo, the search box and the menu
          button; a wide screen has the logo, the serif links and the icons. */}
      <div className="bg-white">
        {/* Phone and tablet: logo, search, menu button. */}
        <div className="container-wide lg:hidden">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2">
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="-ml-2 justify-self-start rounded-md p-2 text-ink-800 hover:bg-ink-50"
            >
              <Menu size={25} strokeWidth={1.5} />
            </button>
            <Link href="/" className="flex shrink-0 items-center text-ink-900">
              <BrandLogoFull size="sm" onLight />
            </Link>
            <div className="-mr-2 flex items-center justify-end">
              <Link href="/account" aria-label="Your account" className="rounded-md px-2 py-2 text-ink-800 hover:text-brand-600">
                <User size={23} strokeWidth={1.4} />
              </Link>
              <HeaderCart />
            </div>
          </div>
          <div className="pb-2.5">
            <SearchBar className="border border-ink-600/25" />
          </div>
        </div>

        {/* Wide screens: a few plain links, the logo in the middle, then the
            search box and the icons. */}
        <div className="container-wide hidden grid-cols-[1fr_auto_1fr] items-center gap-6 py-4 lg:grid">
          <nav className="flex items-center gap-6 text-[15px] text-ink-800 xl:gap-9 xl:text-[16px]">
            {/* The way back to the front page, from anywhere. */}
            <Link href="/" className={`flex items-center gap-1.5 whitespace-nowrap font-semibold hover:text-brand-600 ${pathname === "/" ? "text-brand-600" : "text-ink-900"}`}>
              <Home size={17} strokeWidth={1.8} /> Home
            </Link>
            {[...TOP_LINKS, { href: "/sell", label: "Sell With Us" }].map((l, i) => (
              <Link key={l.href} href={l.href} className={`whitespace-nowrap hover:text-brand-600 hover:underline hover:underline-offset-4 ${i === 3 ? "hidden xl:inline" : ""}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="flex shrink-0 items-center justify-center text-ink-900">
            <BrandLogoFull size="md" onLight />
          </Link>

          <div className="flex items-center justify-end gap-1">
            {/* The search box, open and ready to type in, where there is room
                for it; a labelled button that drops it open where there is not. */}
            <div className="mr-2 hidden w-[250px] shrink-0 xl:block min-[1500px]:w-[300px]">
              <SearchBar className="border border-ink-600/25" />
            </div>
            <button
              type="button"
              aria-label="Search"
              aria-expanded={searching}
              onClick={() => setSearching((v) => !v)}
              className="rounded-md p-2 text-ink-900 transition hover:text-brand-600 xl:hidden"
            >
              <span className="flex items-center gap-2 rounded-full border border-ink-600/25 py-2 pl-3 pr-4 text-[13px] text-ink-700/70">
                <Search size={18} strokeWidth={1.6} /> Search
              </span>
            </button>
            <a href={telHref(site.phoneDisplay)} aria-label={`Call ${site.phoneDisplay}`} className="rounded-md px-2 py-2 text-ink-800 transition hover:text-brand-600">
              <Phone size={22} strokeWidth={1.4} />
            </a>
            <HeaderAccount onLight />
            <HeaderWishlist />
            <HeaderCart />
          </div>
        </div>

        {/* Wide screens: the row of capitals, spread from edge to edge. */}
        <div className="hidden border-t border-ink-600/10 lg:block">
          <nav className="container-wide relative flex items-center justify-between gap-x-4">
            {(() => {
              const menu = (m: Menu, accent = false) => {
                const on = m.match.some((x) => pathname.startsWith(x));
                return (
                  <div key={m.href} className="group/menu">
                    <Link
                      href={m.href}
                      className={`${rowLink} ${
                        on
                          ? "!border-brand-500 text-brand-600"
                          : `!border-transparent ${accent ? "text-brand-600" : "text-ink-900"} group-hover/menu:!border-brand-500 group-hover/menu:text-brand-600`
                      }`}
                    >
                      {m.label} <ChevronDown size={14} strokeWidth={1.5} />
                    </Link>
                    <div className="invisible absolute left-0 top-full z-50 w-[34rem] opacity-0 transition duration-150 group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100">
                      <div className="grid grid-cols-[13rem_1fr] bg-white shadow-2xl ring-1 ring-ink-600/10">
                        <div className="bg-brand-500 p-6 text-white">
                          <p className="font-display text-[26px] leading-tight">{m.label}</p>
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
                  {menu(MENUS[0])}
                  {SHOP_ROW.map((c) => (
                    <Link key={c.href} href={c.href} className={`${rowLink} !border-transparent text-ink-900 hover:!border-brand-500 hover:text-brand-600`}>
                      {c.label}
                    </Link>
                  ))}
                  {menu(MENUS[1])}
                  {menu(MENUS[2])}
                  {menu(MENUS[3], true)}
                </>
              );
            })()}
            <div className="group/more">
              <button type="button" className={`${rowLink} !border-transparent text-ink-900 group-hover/more:text-brand-600`}>
                More <ChevronDown size={14} strokeWidth={1.5} />
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

        {/* Wide screens: the search box drops open under the bar. */}
        {searching && (
          <div className="hidden border-t border-ink-600/10 lg:block xl:hidden">
            <div className="container-wide py-3">
              <div className="mx-auto max-w-2xl">
                <SearchBar className="border border-ink-600/20" />
              </div>
            </div>
          </div>
        )}

        {/* Phone: the two businesses that aren't the shop. They were reachable
            only through the desktop nav, which a phone never renders. The home
            page shows a larger pair of its own, so this stands down there. */}
        <div
          className={`container-wide gap-2 pb-2.5 lg:hidden ${
            onInnerPage ? "flex" : "hidden"
          }`}
        >
          <Link
            href="/learn"
            className={`press flex flex-1 items-center justify-center gap-1.5 rounded-full py-1 pl-1 pr-3 font-bold text-white shadow-md ring-1 ring-black/5 ${
              pathname.startsWith("/learn") ? "bg-green-700" : "bg-green-600"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-green-700">
              <GraduationCap size={13} strokeWidth={2.6} />
            </span>
            <span className="leading-[1.15]">
              <span className="block text-[11px] font-black tracking-tight">Learn</span>
              <span className="block text-[7.5px] font-bold uppercase tracking-[0.06em] text-white/80">
                Academy
              </span>
            </span>
          </Link>
          <Link
            href="/development"
            className={`press flex flex-1 items-center justify-center gap-1.5 rounded-full py-1 pl-1 pr-3 font-bold text-white shadow-md ring-1 ring-black/5 ${
              pathname.startsWith("/development") ? "bg-ink-800" : "bg-ink-600"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-ink-700">
              <Code2 size={13} strokeWidth={2.6} />
            </span>
            <span className="leading-[1.15]">
              <span className="block text-[11px] font-black tracking-tight">Develop</span>
              <span className="block text-[7.5px] font-bold uppercase tracking-[0.06em] text-white/80">
                Software
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* Phones and tablets: the categories as a row of quiet white pills
          that slides sideways. */}
      <nav className="border-y border-ink-600/10 bg-white lg:hidden">
        <div className="container-wide flex items-center gap-x-2 overflow-x-auto py-2 no-scrollbar">
          <Link
            href="/"
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
              pathname === "/" ? "border-ink-900 bg-ink-900 text-white" : "border-brand-500 bg-white text-brand-600"
            }`}
          >
            <Home size={13} strokeWidth={2.2} /> Home
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                pathname === c.href ? "border-ink-900 bg-ink-900 text-white" : "border-ink-700/25 bg-white text-ink-900 hover:border-ink-900"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="hidden border-b border-ink-600/10 lg:block" />

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
  );
}
