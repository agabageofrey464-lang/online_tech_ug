"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  }

  return (
    /* Pill-shaped search: magnifier sits inside the field, action button rides
       flush inside the right edge. */
    <form
      onSubmit={submit}
      className={`flex w-full items-center gap-2 rounded-full bg-white p-1 pl-4 ${className}`}
    >
      <Search size={18} strokeWidth={2.2} className="shrink-0 text-ink-700/40" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products, brands and categories"
        className="w-full min-w-0 bg-transparent py-1.5 text-sm text-ink-900 outline-none placeholder:text-ink-700/40"
        aria-label="Search products"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-600 sm:px-7"
      >
        <Search size={17} strokeWidth={2.5} className="sm:hidden" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}
