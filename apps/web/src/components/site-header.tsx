"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, MapPin, User, ShoppingCart, Phone, Heart, Package } from "lucide-react";
import { nav, site, whatsappLink } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { SearchBar } from "@/components/search-bar";
import { HeaderAccount } from "@/components/header-account";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

function HeaderWishlist() {
  const { count } = useWishlist();
  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist, ${count} items`}
      className="relative flex items-end gap-1 rounded px-2 py-2 text-white hover:outline hover:outline-1 hover:outline-white/60"
    >
      <span className="relative">
        <Heart size={26} strokeWidth={1.8} />
        {count > 0 && (
          <span className="absolute -top-1 left-3 text-sm font-bold text-brand-400">{count}</span>
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
        <span className="absolute -top-1 left-3 text-sm font-bold text-brand-400">{count}</span>
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
      {/* Bar 1 — main (Amazon dark navy) */}
      <div className="bg-[#131921] text-white">
        <div className="container-wide flex h-auto flex-wrap items-center gap-2 py-2 md:h-16 md:flex-nowrap md:gap-3 md:py-0">
          {/* Logo + brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2 rounded px-1 py-1 hover:outline hover:outline-1 hover:outline-white/60">
            <Image src="/logo.jpeg" alt={site.name} width={36} height={36} className="h-9 w-9 rounded object-cover" priority />
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm font-extrabold tracking-tight sm:text-base">Online Tech</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-400 sm:text-[10px] sm:tracking-[0.25em]">Uganda</span>
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

          {/* Right-side actions: account, orders, wishlist, cart — anchored to the right */}
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            {/* Account — sign-in prompt or logged-in dropdown */}
            <HeaderAccount />

            {/* Orders — icon on mobile/tablet, full label on desktop */}
            <Link href="/account#orders" aria-label="Returns & orders" className="flex items-center gap-1.5 rounded px-1.5 py-2 hover:outline hover:outline-1 hover:outline-white/60">
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

      {/* Bar 2 — sub nav (Amazon #232f3e) */}
      <nav className="bg-[#232f3e] text-white shadow-sm">
        <div className="container-wide flex items-center gap-1 overflow-x-auto py-1.5 text-sm no-scrollbar">
          <Link
            href="/shop"
            className="mr-1 flex shrink-0 items-center gap-1.5 rounded-md bg-brand-500 px-3 py-1.5 font-bold text-white shadow-sm transition hover:bg-brand-600"
          >
            <Menu size={18} /> All
          </Link>
          {nav.filter((n) => n.href !== "/").map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition ${
                  active
                    ? "bg-white/10 font-bold text-brand-300"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-400" />
                )}
              </Link>
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
