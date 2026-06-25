"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  }

  return (
    <form onSubmit={submit} className={`flex w-full items-stretch ${className}`}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products, brands and categories"
        className="w-full rounded-l-md border border-r-0 border-ink-600/15 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-700/40 focus:border-brand-500"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="shrink-0 rounded-r-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600"
      >
        Search
      </button>
    </form>
  );
}
