"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, MapPin, User, ShoppingCart, Phone, Heart, Package, Star } from "lucide-react";
import { nav, navPrimary, navGroups, site, whatsappLink } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { SearchBar } from "@/components/search-bar";
import { HeaderAccount } from "@/components/header-account";
import { LanguageMenu } from "@/components/language-menu";
import { BrandLogoFull } from "@/components/brand-logo-full";
import { MegaMenu } from "@/components/mega-menu";
import { PromoStrip } from "@/components/promo-strip";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

function HeaderWishlist() {
  const { count } = useWishlist();
  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist, ${count} items`}
      className="relative hidden items-end gap-1 rounded px-2 py-2 text-white hover:outline hover:outline-1 hover:outline-white/60 md:flex"
    >
      <span className="relative">
        <Heart size={26} strokeWidth={1.8} />
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-extrabold leading-none text-white ring-2 ring-[#131921]">
            {count}
          </span>
        )}
      </span>
      <span className="hidden text-sm font-bold lg:inline">List</span>
    </Link>
  );
}

function HeaderCart() {
  const { count, open } = useCart();
  return (
    <button
      onClick={open}
      aria-label={`Cart, ${count} items`}
      className="relative flex items-end gap-1 rounded px-2 py-2 text-white hover:outline hover:outline-1 hover:outline-white/60"
    >
      <span className="relative">
        <ShoppingCart size={28} strokeWidth={1.8} />
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-extrabold leading-none text-white ring-2 ring-[#131921]">
            {count}
          </span>
        )}
      </span>
      <span className="hidden text-sm font-bold sm:inline">Cart</span>
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header id="top" className="sticky top-0 z-50">
      {/* Promo strip — rotating advert on mobile, both messages on desktop */}
      <PromoStrip />

      {/* Utility strip — "sell with us" on the left, quick service links centred.
          Desktop only; these routes all live in the main nav on mobile. */}
      <div className="border-b border-white/5 bg-[#1b2330] text-white">
        {/* Scrolls sideways on phones so every link stays reachable; centred on desktop. */}
        <div className="container-wide flex items-center gap-x-4 overflow-x-auto py-1.5 text-[11px] font-semibold no-scrollbar md:gap-x-5">
          <Link href="/sell" className="inline-flex shrink-0 items-center gap-1.5 text-brand-400 transition hover:text-brand-300">
            <Star size={12} className="fill-brand-400" /> Sell on {site.name}
          </Link>
          {/* The secondary pages live here rather than behind a "More" dropdown —
              the main nav below already carries everything else. */}
          <span className="flex shrink-0 items-center gap-x-4 text-white/55 md:mx-auto">
            {navGroups.flatMap((g) => g.items).map((it) => (
              <Link key={it.href} href={it.href} className="whitespace-nowrap transition hover:text-white">
                {it.label}
              </Link>
            ))}
          </span>
        </div>
      </div>

      {/* Bar 1 — main (near-black) */}
      <div className="bg-[#131921] text-white">
        <div className="container-wide flex h-auto flex-wrap items-center gap-x-2 gap-y-1 py-1.5 md:h-[68px] md:flex-nowrap md:gap-5 md:py-0">
          {/* Logo + brand — one combined lockup (mark + wordmark) */}
          <Link href="/" className="flex shrink-0 items-center rounded px-1 py-1 text-white hover:outline hover:outline-1 hover:outline-white/60">
            <BrandLogoFull size="md" />
          </Link>

          {/* Deliver to */}
          <Link href="/contact" className="hidden items-end gap-1 rounded px-2 py-1.5 hover:outline hover:outline-1 hover:outline-white/60 lg:flex">
            <MapPin size={18} className="mb-0.5 text-white/80" />
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] text-white/70">Deliver to</span>
              <span className="text-sm font-bold">Uganda</span>
            </span>
          </Link>

          {/* Search — full-width on its own row on mobile, inline on desktop */}
          <div className="order-last w-full md:order-none md:w-auto md:max-w-2xl md:flex-1">
            <SearchBar />
          </div>

          {/* Right-side actions: language, account, orders, wishlist, cart — anchored to the right */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:gap-3">
            {/* Country / language — Uganda flag first (Amazon-style), all screens */}
            <LanguageMenu />
            {/* Account — desktop only (mobile uses the bottom tab bar's Account) */}
            <div className="hidden md:block">
              <HeaderAccount />
            </div>

            {/* Orders — tablet icon, full label on desktop (in the menu on mobile) */}
            <Link href="/account#orders" aria-label="Returns & orders" className="hidden items-center gap-1.5 rounded px-1.5 py-2 hover:outline hover:outline-1 hover:outline-white/60 sm:flex">
              <Package size={24} strokeWidth={1.8} className="lg:hidden" />
              <span className="hidden flex-col leading-tight lg:flex">
                <span className="text-[11px] text-white/70">Returns</span>
                <span className="text-sm font-bold">&amp; Orders</span>
              </span>
            </Link>

            <HeaderWishlist />

            <HeaderCart />

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="rounded p-2 hover:outline hover:outline-1 hover:outline-white/60 md:hidden"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Bar 2 — sub nav (scrolls sideways on mobile for quick category access) */}
      <nav className="border-t border-white/5 bg-gradient-to-r from-[#1b2330] via-[#232f3e] to-[#1b2330] text-white shadow-md shadow-black/20">
        <div className="container-wide relative flex items-center gap-0.5 overflow-x-auto py-1.5 text-sm no-scrollbar md:overflow-visible">
          <MegaMenu />

          {/* Core links — animated underline */}
          {navPrimary.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group/nav relative shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition ${
                  active ? "text-brand-300" : "text-white/85 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
                <span
                  className={`pointer-events-none absolute inset-x-2.5 bottom-0.5 h-0.5 rounded-full bg-brand-400 transition-transform duration-200 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}

          {/* "More" dropdown removed — those pages now sit in the utility strip above. */}
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="border-t border-white/10 bg-white md:hidden">
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
            {/* Main nav, plus any utility-strip page not already listed (News,
                Pricing, Help) so nothing is desktop-only. */}
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
