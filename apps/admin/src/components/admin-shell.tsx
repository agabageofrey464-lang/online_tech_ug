"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const sections = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/products", label: "Products", icon: "🛒" },
  { href: "/orders", label: "Orders", icon: "📦" },
  { href: "/courses", label: "Courses", icon: "🎓" },
  { href: "/vendors", label: "Vendors", icon: "🏪" },
  { href: "/leads", label: "Leads", icon: "💬" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // The login page renders standalone (no sidebar).
  if (pathname === "/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col bg-ink-700 p-4 text-white md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2">
          <Image src="/logo.jpeg" alt="Logo" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
          <span className="text-sm font-extrabold leading-tight">
            Online Tech
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-500">
              Admin
            </span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/10 hover:text-white ${
                pathname === s.href ? "bg-white/10 text-white" : "text-white/80"
              }`}
            >
              <span>{s.icon}</span> {s.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <span>🔒</span> Sign out
        </button>
        <p className="mt-2 px-3 text-xs text-white/40">v0.1 · Phase 1</p>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
