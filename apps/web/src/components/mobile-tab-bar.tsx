"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, GraduationCap, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
      {n > 9 ? "9+" : n}
    </span>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { count: cartCount, open } = useCart();
  const { user } = useAuth();

  const cls = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-semibold transition ${
      active ? "text-brand-600" : "text-ink-700/60"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-ink-600/10 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(0,0,0,0.08)] md:hidden">
      <Link href="/" className={cls(pathname === "/")}>
        <Home size={22} strokeWidth={1.8} /> Home
      </Link>
      <Link href="/shop" className={cls(pathname.startsWith("/categories") || pathname.startsWith("/shop"))}>
        <LayoutGrid size={22} strokeWidth={1.8} /> Shop
      </Link>
      <button onClick={open} className={cls(false)}>
        <span className="relative">
          <ShoppingCart size={22} strokeWidth={1.8} />
          <Badge n={cartCount} />
        </span>
        Cart
      </button>
      <Link href="/learn" className={cls(pathname.startsWith("/learn"))}>
        <GraduationCap size={22} strokeWidth={1.8} /> Learn
      </Link>
      <Link href={user ? "/account" : "/login"} className={cls(pathname === "/account" || pathname === "/login")}>
        <User size={22} strokeWidth={1.8} /> Account
      </Link>
    </nav>
  );
}
