"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Counts = Record<string, number>;

// `count` maps a nav item to a key in /api/counts. Items without a key
// (Dashboard, Sales report, Settings) show no badge.
// `attention: true` → the badge pulses with a red dot when its count > 0,
// so incoming items (orders, vendors, applications…) grab your attention.
const sections = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/products", label: "Products", icon: "🛒", count: "products" },
  { href: "/inventory", label: "Inventory", icon: "📊", count: "inventory" },
  { href: "/orders", label: "Orders", icon: "📦", count: "orders", attention: true },
  { href: "/reports", label: "Sales report", icon: "📈" },
  { href: "/coupons", label: "Coupons", icon: "🏷️", count: "coupons" },
  { href: "/courses", label: "Courses", icon: "🎓", count: "courses" },
  { href: "/enrollments", label: "Enrollments", icon: "🎟️", count: "enrollments", attention: true },
  { href: "/certificates", label: "Certificates", icon: "🏅" },
  { href: "/enrolment-forms", label: "Enrolment Forms", icon: "📝" },
  { href: "/internship-letters", label: "Internship Letters", icon: "📄" },
  { href: "/receipts", label: "Receipts", icon: "🧾" },
  { href: "/vendors", label: "Vendors", icon: "🏪", count: "vendors", attention: true },
  { href: "/community", label: "Community", icon: "💬", attention: true },
  { href: "/newsletter", label: "Notifications", icon: "📣" },
  { href: "/campaigns", label: "Campaigns", icon: "🎯" },
  { href: "/commissions", label: "Commissions", icon: "💰" },
  { href: "/referrals", label: "Referrals", icon: "🎁", count: "referrals", attention: true },
  { href: "/jobs", label: "Jobs", icon: "💼", count: "jobs" },
  { href: "/applications", label: "Applications", icon: "📄", count: "applications", attention: true },
  { href: "/freelancers", label: "Freelancers", icon: "🧑‍💻", count: "freelancers", attention: true },
  { href: "/blog", label: "Blog & News", icon: "📰", count: "posts" },
  { href: "/adverts", label: "Adverts", icon: "📢", count: "adverts" },
  { href: "/payments", label: "Payments", icon: "💵", count: "payments", attention: true },
  { href: "/leads", label: "Leads", icon: "💬", count: "leads", attention: true },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/login") return;
    let alive = true;
    fetch("/api/counts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setCounts(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // The login page renders standalone (no sidebar).
  if (pathname === "/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
      {sections.map((s) => {
        const n = s.count && counts ? counts[s.count] ?? 0 : undefined;
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/10 hover:text-white ${
              pathname === s.href ? "bg-white/10 text-white" : "text-white/80"
            }`}
          >
            <span>{s.icon}</span>
            <span className="flex-1">{s.label}</span>
            {n !== undefined && (
              <span className="relative flex items-center">
                {s.attention && n > 0 && (
                  <>
                    <span className="absolute -right-1 -top-1 z-10 h-2 w-2 animate-ping rounded-full bg-red-500" />
                    <span className="absolute -right-1 -top-1 z-10 h-2 w-2 rounded-full bg-red-500" />
                  </>
                )}
                <span
                  className={`min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${
                    n > 0
                      ? s.attention
                        ? "bg-brand-500 text-white ring-2 ring-brand-400/40"
                        : "bg-brand-500 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {n}
                </span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link href="/" className="flex items-center gap-2 px-2">
      <BrandLogo className="shrink-0" size={40} />
      <span className="text-sm font-extrabold leading-tight">
        Online Tech
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-500">Admin</span>
      </span>
    </Link>
  );

  const signOut = (
    <button
      onClick={logout}
      className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      <span>🔒</span> Sign out
    </button>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ink-700 p-4 text-white md:flex">
        <div className="mb-6">{brand}</div>
        {nav}
        {signOut}
        <p className="mt-2 px-3 text-xs text-white/40">v0.1 · Phase 1</p>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between bg-ink-700 px-4 text-white md:hidden">
        {brand}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl hover:bg-white/10"
        >
          ☰
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-ink-700 p-4 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              {brand}
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            {nav}
            {signOut}
          </aside>
        </div>
      )}

      <main className="flex-1 p-6 pt-20 md:p-10 md:pt-10">{children}</main>
    </div>
  );
}
