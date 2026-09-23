"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu, User, ShoppingCart, Phone, Heart, Package, Star, HelpCircle, ChevronDown,
  LayoutGrid,
  ShoppingBag, Laptop, Monitor, Cpu, Headphones, Wifi, HardDrive, BatteryCharging,
  Store, GraduationCap, Code2,
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

// Jumia-style category strip — product-first, with a small icon per category.
const CATEGORIES = [
  { href: "/shop", label: "All Products", icon: LayoutGrid },
  { href: "/shop?cat=Laptops", label: "Laptops", icon: Laptop },
  { href: "/shop?cat=Desktops", label: "Desktops", icon: Monitor },
  { href: "/shop?cat=Components", label: "Components", icon: Cpu },
  { href: "/shop?cat=Accessories", label: "Accessories", icon: Headphones },
  { href: "/shop?cat=Networking", label: "Networking", icon: Wifi },
  { href: "/shop?cat=Storage", label: "Storage", icon: HardDrive },
  { href: "/shop?cat=Power", label: "Power", icon: BatteryCharging },
  { href: "/marketplace", label: "Marketplace", icon: Store },
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
        <ShoppingCart size={24} strokeWidth={1.9} />
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-extrabold leading-none text-white ring-2 ring-white">
            {count}
          </span>
        )}
      </span>
      <span className="hidden text-sm font-bold sm:inline">Cart</span>
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
        <Heart size={23} strokeWidth={1.9} />
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-extrabold leading-none text-white ring-2 ring-white">
            {count}
          </span>
        )}
      </span>
      <span className="hidden text-sm font-bold lg:inline">Saved</span>
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
      <div className="stripes hidden bg-teal-600 text-white md:block">
        <div className="container-wide flex items-center gap-x-4 py-2 text-[11.5px] font-semibold">
          <Link
            href="/sell"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1 text-white transition hover:bg-brand-600"
          >
            <Star size={11} className="fill-white" /> Sell on {site.name}
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-x-4 overflow-x-auto no-scrollbar">
            {/* What we do — these earn the emphasis */}
            {PRIMARY_LINKS.map((it) => (
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
            ))}

            <span className="h-3 w-px shrink-0 bg-white/25" aria-hidden />

            {/* Everything else */}
            {SECONDARY_LINKS.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="whitespace-nowrap font-medium text-white/60 transition hover:text-white"
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
      <div className="bg-white shadow-sm">
        <div className="container-wide flex items-center gap-3 py-2.5 md:gap-5">
          {/* Logo — compact on mobile (left), full on desktop */}
          <Link href="/" className="flex shrink-0 items-center text-ink-900">
            <span className="md:hidden"><BrandLogoFull size="sm" onLight /></span>
            <span className="hidden md:inline-flex"><BrandLogoFull size="md" onLight /></span>
          </Link>

          {/* Search — sits beside the logo on mobile (narrower), capped on desktop */}
          <div className="min-w-0 flex-1 md:max-w-2xl">
            <SearchBar className="border border-ink-600/20 shadow-sm" />
          </div>

          {/* Desktop actions */}
          <div className="ml-auto hidden items-center gap-5 md:flex">
            <HeaderAccount onLight />
            <Link
              href="/help"
              className="flex items-center gap-1.5 rounded-md px-2 py-2 text-ink-800 transition hover:text-brand-600"
            >
              <HelpCircle size={22} strokeWidth={1.9} />
              <span className="hidden text-sm font-bold lg:inline">Help</span>
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
            className={`press flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-bold text-white shadow-sm ${
              pathname.startsWith("/learn") ? "bg-green-700" : "bg-green-600"
            }`}
          >
            <GraduationCap size={17} strokeWidth={2.2} />
            <span className="leading-none">
              Learn
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-white/75">
                Academy
              </span>
            </span>
          </Link>
          <Link
            href="/development"
            className={`press flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-bold text-white shadow-sm ${
              pathname.startsWith("/development") ? "bg-ink-800" : "bg-ink-600"
            }`}
          >
            <Code2 size={17} strokeWidth={2.2} />
            <span className="leading-none">
              Develop
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-white/75">
                Software
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* Category strip — WHITE with icons (Jumia). Desktop only; mobile shows the
          circular category/services row on the home page instead. */}
      <nav className="hidden border-b border-ink-600/10 bg-white shadow-sm md:block">
        <div className="container-wide flex items-center gap-x-6 py-1.5 text-sm font-semibold">
          <MegaMenu />

          {/* Primary destinations — Shop and Learn lead the bar, ahead of the
              category list, because they're where most visitors are heading. */}
          <div className="flex shrink-0 items-center gap-2 border-r border-ink-600/10 pr-5">
            <Link
              href="/shop"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold text-white shadow-sm transition ${
                pathname === "/shop" ? "bg-brand-600" : "bg-brand-500 hover:bg-brand-600"
              }`}
            >
              <ShoppingBag size={17} strokeWidth={2.2} />
              <span className="leading-none">
                Shop
                <span className="ml-1 hidden text-[10px] font-semibold uppercase tracking-wide text-white/70 lg:inline">
                  Computers
                </span>
              </span>
            </Link>
            {/* Learn is the academy, not the shop — it carries its own green
                identity so it reads as a different kind of destination and is
                findable at a glance. */}
            <Link
              href="/learn"
              className={`group/learn flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold text-white shadow-sm transition ${
                pathname.startsWith("/learn")
                  ? "bg-green-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <GraduationCap size={17} strokeWidth={2.2} />
              <span className="leading-none">
                Learn
                <span className="ml-1 hidden text-[10px] font-semibold uppercase tracking-wide text-white/70 lg:inline">
                  Academy
                </span>
              </span>
            </Link>
            {/* Development is a third distinct business — indigo separates it
                from the orange shop and the green academy. */}
            <Link
              href="/development"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold text-white shadow-sm transition ${
                pathname.startsWith("/development")
                  ? "bg-ink-800"
                  : "bg-ink-600 hover:bg-ink-700"
              }`}
            >
              <Code2 size={17} strokeWidth={2.2} />
              <span className="leading-none">
                Develop
                <span className="ml-1 hidden text-[10px] font-semibold uppercase tracking-wide text-white/70 lg:inline">
                  Software
                </span>
              </span>
            </Link>
          </div>

          <div className="flex flex-1 items-center gap-x-6 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => {
            const active = pathname === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`group flex shrink-0 items-center gap-1.5 whitespace-nowrap transition ${
                  active ? "text-brand-600" : "text-ink-800 hover:text-brand-600"
                }`}
              >
                <c.icon size={17} strokeWidth={2} className="text-ink-700/60 transition group-hover:text-brand-500" />
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
            ].map((item) => (
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
            ))}
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
