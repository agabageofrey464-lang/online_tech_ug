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
import { PromoStrip } from "@/components/promo-strip";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

// The category strip — product-first.
const CATEGORIES = [
  { href: "/shop", label: "All Products" },
  { href: "/shop?cat=Laptops", label: "Laptops" },
  { href: "/shop?cat=Desktops", label: "Desktops" },
  { href: "/shop?cat=Phones", label: "Phones" },
  { href: "/shop?cat=Components", label: "Components" },
  { href: "/shop?cat=Accessories", label: "Accessories" },
  { href: "/shop?cat=Networking", label: "Networking" },
  { href: "/shop?cat=Storage", label: "Storage" },
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
const MAIN_LINKS = [
  // In order of who is looking: the first four stay on a small laptop screen.
  { href: "/shop?cat=Laptops", label: "Laptops" },
  { href: "/shop?cat=Phones", label: "Phones" },
  { href: "/learn", label: "Learn" },
  { href: "/internship", label: "Internships" },
  { href: "/shop?cat=Desktops", label: "Desktops" },
  { href: "/shop?cat=Accessories", label: "Accessories" },
  { href: "/development", label: "Software" },
  { href: "/services", label: "Services" },
];
const TOP_LINKS = [
  { href: "/track", label: "Track Order" },
  { href: "/about", label: "About Us" },
  { href: "/stores", label: "Branches" },
];
const MORE_LINKS = [
  { href: "/shop", label: "All Products" },
  { href: "/shop?cat=Desktops", label: "Desktops" },
  { href: "/shop?cat=Accessories", label: "Accessories" },
  { href: "/shop?cat=Components", label: "Components" },
  { href: "/shop?cat=Storage", label: "Storage" },
  { href: "/shop?cat=Networking", label: "Networking" },
  { href: "/shop?cat=Power", label: "Power" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/sell", label: "Sell With Us" },
  ...navGroups.flatMap((g) => g.items).filter((it) => !TOP_LINKS.some((t) => t.href === it.href)),
];
const ANNOUNCEMENTS = [
  { text: "Free Windows, Office & antivirus setup on laptops over UGX 1M.", cta: "Shop Laptops", href: "/shop?cat=Laptops" },
  { text: "Online industrial training for university and college students.", cta: "Apply Now", href: "/internship" },
  { text: "22 computer courses, in class or online, with a certificate.", cta: "Browse Courses", href: "/learn" },
  { text: "Laptop trouble? Free diagnosis, repairs from UGX 30,000.", cta: "Book A Repair", href: "/services#repairs-support" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [note, setNote] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setNote((n) => (n + 1) % ANNOUNCEMENTS.length), 6000);
    return () => clearInterval(t);
  }, []);
  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    return query ? false : pathname.startsWith(path);
  };

  return (
    <header id="top" className="sticky top-0 z-50">
      {/* Phones and tablets: the rotating offer strip. */}
      <div className="lg:hidden">
        <PromoStrip />
      </div>

      {/* Wide screens: one brown line — a message in the middle, three links
          at the end. */}
      <div className="hidden bg-ink-900 text-white lg:block">
        <div className="container-wide grid grid-cols-[auto_1fr_auto] items-center gap-6 py-2.5 text-[14px] xl:grid-cols-[1fr_auto_1fr]">
          <span />
          <p key={note} className="ad-fade text-center">
            {ANNOUNCEMENTS[note].text}{" "}
            <Link href={ANNOUNCEMENTS[note].href} className="ml-2 font-semibold text-brand-300 underline underline-offset-4 hover:text-brand-200">
              {ANNOUNCEMENTS[note].cta}
            </Link>
          </p>
          <nav className="flex items-center justify-end gap-8 font-medium">
            {TOP_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="whitespace-nowrap hover:underline hover:underline-offset-4">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main bar — white. A phone has the logo, the search box and the menu
          button; a wide screen has the logo, the serif links and the icons. */}
      <div className="bg-white">
        <div className="container-wide flex items-center gap-3 py-2.5 lg:gap-8 lg:py-4">
          <Link href="/" className="flex shrink-0 items-center text-ink-900">
            <span className="lg:hidden"><BrandLogoFull size="sm" onLight /></span>
            <span className="hidden lg:inline-flex"><BrandLogoFull size="md" onLight /></span>
          </Link>

          {/* Phone and tablet: search beside the logo */}
          <div className="min-w-0 flex-1 lg:hidden">
            <SearchBar className="border border-ink-600/20" />
          </div>

          {/* Wide screens: the serif links */}
          <nav className="hidden min-w-0 flex-1 items-center gap-x-7 lg:flex xl:gap-x-9">
            {MAIN_LINKS.map((l, n) => (
              <Link
                key={l.href}
                href={l.href}
                // A laptop screen has room for five; the rest are under "More".
                className={`${n > 4 ? "hidden xl:block" : n > 3 ? "hidden min-[1150px]:block" : ""} whitespace-nowrap border-b py-1 font-display text-[19px] transition ${
                  isActive(l.href) ? "!border-brand-500 text-brand-600" : "!border-transparent text-ink-900 hover:!border-brand-500 hover:text-brand-600"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="group/more relative">
              <button type="button" className="flex items-center gap-1 whitespace-nowrap py-1 font-display text-[19px] text-ink-900">
                More <ChevronDown size={15} strokeWidth={1.5} />
              </button>
              <div className="invisible absolute right-0 top-full z-50 w-[30rem] pt-3 opacity-0 transition duration-150 group-hover/more:visible group-hover/more:opacity-100 group-focus-within/more:visible group-focus-within/more:opacity-100">
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

          {/* Wide screens: the icons */}
          <div className="ml-auto hidden items-center gap-1 lg:flex">
            <button
              type="button"
              aria-label="Search"
              aria-expanded={searching}
              onClick={() => setSearching((v) => !v)}
              className="rounded-md p-2 text-ink-900 transition hover:text-brand-600"
            >
              <Search size={24} strokeWidth={1.4} />
            </button>
            <HeaderAccount onLight />
            <HeaderWishlist />
            <HeaderCart />
          </div>

          {/* Phone and tablet: menu button */}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-md p-2 text-ink-800 hover:bg-ink-50 lg:hidden"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Wide screens: the search box drops open under the bar. */}
        {searching && (
          <div className="hidden border-t border-ink-600/10 lg:block">
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
            pathname === "/" ? "hidden" : "flex"
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

      {/* Phones and tablets: the categories as a row of brown chips that
          slides sideways. */}
      <nav className="border-y border-ink-600/10 bg-white lg:hidden">
        <div className="container-wide flex items-center gap-x-2 overflow-x-auto py-2 no-scrollbar">
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`shrink-0 whitespace-nowrap rounded-[3px] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition ${
                pathname === c.href ? "bg-brand-700" : "bg-brand-500 hover:bg-brand-600"
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
