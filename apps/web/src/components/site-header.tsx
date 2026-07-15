"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, MapPin, User, ShoppingCart, Phone, Heart, Package, ChevronDown } from "lucide-react";
import { nav, navPrimary, navGroups, site, whatsappLink } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { SearchBar } from "@/components/search-bar";
import { HeaderAccount } from "@/components/header-account";
import { LanguageMenu } from "@/components/language-menu";
import { BrandLogo } from "@/components/brand-logo";
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

      {/* Bar 1 — main (near-black) */}
      <div className="bg-[#131921] text-white">
        <div className="container-wide flex h-auto flex-wrap items-center gap-x-2 gap-y-1 py-1.5 md:h-16 md:flex-nowrap md:gap-3 md:py-0">
          {/* Logo + brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2 rounded px-1 py-1 hover:outline hover:outline-1 hover:outline-white/60">
            <BrandLogo className="h-12 w-12 shrink-0 drop-shadow-sm" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-black tracking-tight text-white drop-shadow-sm sm:text-xl">
                Online Tech
              </span>
              {/* UGANDA in flag colours (black band → white for visibility on the dark bar) */}
              <span className="mt-0.5 text-xs font-black uppercase tracking-[0.3em] sm:text-sm sm:tracking-[0.35em]">
                {[
                  ["U", "#ffffff"],
                  ["G", "#FCDC04"],
                  ["A", "#D90000"],
                  ["N", "#ffffff"],
                  ["D", "#FCDC04"],
                  ["A", "#D90000"],
                ].map(([ch, color], i) => (
                  <span key={i} style={{ color }}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
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
          <div className="order-last w-full md:order-none md:w-auto md:flex-1">
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

          {/* Grouped dropdown (desktop) */}
          {navGroups.map((group) => {
            const active = group.items.some((it) => pathname === it.href);
            return (
              <div key={group.label} className="group relative hidden shrink-0 md:block">
                <button
                  className={`flex items-center gap-1 rounded-md px-3 py-1.5 font-medium transition ${
                    active ? "text-brand-300" : "text-white/85 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {group.label} <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                </button>
                <div className="invisible absolute left-0 top-full z-50 w-56 origin-top translate-y-1 overflow-hidden rounded-b-xl border-t-2 border-brand-500 bg-white py-1 opacity-0 shadow-2xl ring-1 ring-black/10 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {group.items.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className="block border-l-2 border-transparent px-4 py-2.5 text-sm font-medium text-ink-800 transition hover:border-brand-500 hover:bg-brand-50 hover:pl-5 hover:text-brand-600"
                    >
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
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
            {nav.map((item) => (
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
