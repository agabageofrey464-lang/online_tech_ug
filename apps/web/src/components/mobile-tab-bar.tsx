"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Briefcase, GraduationCap, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function MobileTabBar() {
  const pathname = usePathname();
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
      {/* The internship, in the middle of the bar and in yellow: it is what
          most students reach the site for this season. The cart stays in the
          header, beside the logo. */}
      <Link href="/internship" className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-bold text-ink-900">
        <span className={`flex h-7 w-11 items-center justify-center rounded-full bg-[#FCDC04] ${pathname.startsWith("/internship") || pathname.startsWith("/apply") ? "ring-2 ring-ink-900" : ""}`}>
          <Briefcase size={17} strokeWidth={2.2} />
        </span>
        Internship
      </Link>
      {/* Learn keeps the academy's green on mobile too, so it is the one tab
          that stands out from the shopping ones. */}
      <Link
        href="/learn"
        className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-semibold transition ${
          pathname.startsWith("/learn") ? "text-green-700" : "text-green-600"
        }`}
      >
        <GraduationCap size={22} strokeWidth={2} /> Learn
      </Link>
      <Link href={user ? "/account" : "/login"} className={cls(pathname === "/account" || pathname === "/login")}>
        <User size={22} strokeWidth={1.8} /> Account
      </Link>
    </nav>
  );
}
