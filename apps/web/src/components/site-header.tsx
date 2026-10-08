"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
import { MegaMenu } from "@/components/mega-menu";

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
      <span className="hidden text-sm font-medium sm:inline">Cart</span>
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
      <span className="hidden text-sm font-medium lg:inline">Saved</span>
    </Link>
  );
}

/** The strip is split so what we sell is scannable ahead of the info pages. */
const ALL_UTILITY = navGroups.flatMap((g) => g.items);
const PRIMARY_COUNT = 5;
const PRIMARY_LINKS = ALL_UTILITY.slice(0, PRIMARY_COUNT);
const SECONDARY_LINKS = ALL_UTILITY.slice(PRIMARY_COUNT);

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header id="top" className="sticky top-0 z-50">
      {/* Promo strip — rotating advert on mobile, both messages on desktop */}
      <PromoStrip />

      {/* Utility bar. Dark, so it separates cleanly from the white bar below,
          and split into what we SELL (bold, up front) and the informational
          pages (muted) — fifteen identical links were impossible to scan. */}
      <div className="hidden bg-ink-600 text-white md:block">
        <div className="container-wide flex items-center gap-x-5 py-2.5 text-[12.5px] font-medium">
          <Link
            href="/sell"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1 text-white transition hover:bg-brand-600"
          >
            <Star size={11} className="fill-white" /> Sell on {site.name}
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-x-4 overflow-x-auto no-scrollbar">
            {/* What we do — these earn the emphasis */}
            {PRIMARY_LINKS.map((it) =>
              it.href === "/internship" ? (
                // Internships get a badge of their own. In a row of plain
                // white links a student scanning for the placement page read
                // straight past it; yellow is used for nothing else up here,
                // and the live dot says the intake is open.
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={pathname.startsWith(it.href) ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f3efe9] px-3 py-1 font-extrabold text-ink-900 shadow-sm transition hover:brightness-105 ${
                    pathname.startsWith(it.href) ? "ring-2 ring-white" : "ring-1 ring-black/10"
                  }`}
                >
                  <Briefcase size={12} strokeWidth={2.6} />
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
                className={`whitespace-nowrap border-b-2 pb-0.5 transition ${
                  pathname.startsWith(it.href)
                    ? "border-brand-500 text-white"
                    : "border-transparent text-white hover:border-brand-400"
                }`}
              >
                {it.label}
              </Link>
              ),
            )}

            <span className="h-3 w-px shrink-0 bg-white/25" aria-hidden />

            {/* Everything else */}
            {SECONDARY_LINKS.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="whitespace-nowrap text-white/70 transition hover:text-white"
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <a
            href={telHref(site.phoneDisplay)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 transition hover:bg-white/20"
          >
            <Phone size={11} /> {site.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Main bar — WHITE (Jumia). Mobile leads with the search bar; nav lives
          in the bottom tab bar, so the top stays clean (no boxes). */}
      <div className="bg-white">
        <div className="container-wide flex items-center gap-3 py-2.5 md:gap-6 md:py-3.5">
          {/* Logo — compact on mobile (left), full on desktop */}
          <Link href="/" className="flex shrink-0 items-center text-ink-900">
            <span className="md:hidden"><BrandLogoFull size="sm" onLight /></span>
            <span className="hidden md:inline-flex"><BrandLogoFull size="md" onLight /></span>
          </Link>

          {/* Search — sits beside the logo on mobile (narrower), capped on desktop */}
          <div className="min-w-0 flex-1 md:max-w-2xl">
            <SearchBar className="border border-ink-600/20" />
          </div>

          {/* Desktop actions */}
          <div className="ml-auto hidden items-center gap-5 md:flex">
            <HeaderAccount onLight />
            <Link
              href="/help"
              className="flex items-center gap-1.5 rounded-md px-2 py-2 text-ink-800 transition hover:text-brand-600"
            >
              <HelpCircle size={22} strokeWidth={1.4} />
              <span className="hidden text-sm font-medium lg:inline">Help</span>
              <ChevronDown size={14} className="hidden lg:inline" />
            </Link>
            <HeaderWishlist />
            <HeaderCart />
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-md p-2 text-ink-800 hover:bg-ink-50 md:hidden"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Phone: the two businesses that aren't the shop. They were reachable
            only through the desktop nav, which a phone never renders. The home
            page shows a larger pair of its own, so this stands down there. */}
        <div
          className={`container-wide gap-2 pb-2.5 md:hidden ${
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

      {/* Category strip — white, the categories as plain serif links. Desktop
          only; mobile shows the circular category/services row on the home
          page instead. */}
      <nav className="hidden border-y border-ink-600/10 bg-white md:block">
        <div className="container-wide flex items-center gap-x-6 py-2 text-sm font-semibold">
          <MegaMenu />

          {/* Primary destinations — Shop and Learn lead the bar, ahead of the
              category list, because they're where most visitors are heading. */}
          <div className="flex shrink-0 items-center gap-2 border-r border-ink-600/10 pr-5">
            <Link
              href="/shop"
              className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3.5 font-bold text-white shadow-sm ring-1 ring-black/5 transition ${
                pathname === "/shop" ? "bg-brand-600" : "bg-brand-500 hover:bg-brand-600"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-brand-600">
                <ShoppingBag size={14} strokeWidth={2.6} />
              </span>
              <span className="leading-none">
                Shop
                <span className="ml-1 hidden text-[10px] font-bold uppercase tracking-[0.08em] text-white/75 lg:inline">
                  Computers
                </span>
              </span>
            </Link>
            {/* Learn is the academy, not the shop — it carries its own green
                identity so it reads as a different kind of destination and is
                findable at a glance. */}
            <Link
              href="/learn"
              className={`group/learn flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3.5 font-bold text-white shadow-sm ring-1 ring-black/5 transition ${
                pathname.startsWith("/learn")
                  ? "bg-green-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-green-700">
                <GraduationCap size={14} strokeWidth={2.6} />
              </span>
              <span className="leading-none">
                Learn
                <span className="ml-1 hidden text-[10px] font-bold uppercase tracking-[0.08em] text-white/75 lg:inline">
                  Academy
                </span>
              </span>
            </Link>
            {/* Development is a third distinct business — indigo separates it
                from the orange shop and the green academy. */}
            <Link
              href="/development"
              className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3.5 font-bold text-white shadow-sm ring-1 ring-black/5 transition ${
                pathname.startsWith("/development")
                  ? "bg-ink-800"
                  : "bg-ink-600 hover:bg-ink-700"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-ink-700">
                <Code2 size={14} strokeWidth={2.6} />
              </span>
              <span className="leading-none">
                Develop
                <span className="ml-1 hidden text-[10px] font-bold uppercase tracking-[0.08em] text-white/75 lg:inline">
                  Software
                </span>
              </span>
            </Link>
          </div>

          <div className="flex flex-1 items-center gap-x-8 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => {
            const active = pathname === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`shrink-0 whitespace-nowrap border-b py-1 font-display text-[18px] font-medium transition ${
                  active ? "border-brand-500 text-brand-600" : "border-transparent text-ink-900 hover:border-ink-900"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="border-t border-ink-600/10 bg-white md:hidden">
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
                  className="my-1 flex items-center gap-2.5 rounded-md bg-[#f3efe9] px-3 py-3 text-base font-extrabold text-ink-900 shadow-sm"
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
