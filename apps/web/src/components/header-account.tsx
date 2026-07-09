"use client";

import Link from "next/link";
import { useState } from "react";
import { User, Package, Mail, Heart, Ticket, Store, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function HeaderAccount() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Signed out (or still loading) — show the sign-in prompt.
  if (loading || !user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="flex items-center gap-1.5 rounded px-1.5 py-2 text-white hover:outline hover:outline-1 hover:outline-white/60"
      >
        <User size={24} strokeWidth={1.8} className="md:hidden" />
        <span className="hidden flex-col leading-tight md:flex">
          <span className="text-[11px] text-white/70">Hello, sign in</span>
          <span className="text-sm font-bold">Account &amp; Lists</span>
        </span>
      </Link>
    );
  }

  const first = user.name.split(" ")[0] || "there";
  const items = [
    { href: "/account", label: "My Account", icon: User },
    { href: "/account#orders", label: "Orders", icon: Package },
    { href: "/contact", label: "Inbox", icon: Mail },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account", label: "Vouchers", icon: Ticket },
    ...(user.role === "vendor" ? [{ href: "/vendor", label: "Vendor Dashboard", icon: Store }] : []),
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded px-1.5 py-2 text-white hover:outline hover:outline-1 hover:outline-white/60"
      >
        <User size={22} strokeWidth={1.8} className="md:hidden" />
        <span className="hidden flex-col leading-tight text-left md:flex">
          <span className="text-[11px] text-white/70">Hello,</span>
          <span className="text-sm font-bold">Hi, {first}</span>
        </span>
        <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <button aria-hidden className="fixed inset-0 z-[80] cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-[90] mt-1 w-56 overflow-hidden rounded-lg bg-white py-1 text-ink-800 shadow-2xl ring-1 ring-black/10">
            {items.map((it) => (
              <Link
                key={it.label}
                href={it.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-ink-50"
              >
                <it.icon size={18} className="text-ink-700/70" /> {it.label}
              </Link>
            ))}
            <div className="my-1 border-t border-ink-600/10" />
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-brand-600 hover:bg-brand-50"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
