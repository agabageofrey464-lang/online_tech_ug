"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { portfolio, projectCategories, type ProjectCategory } from "@/lib/portfolio";

export function PortfolioGrid() {
  const [cat, setCat] = useState<ProjectCategory | "All">("All");
  const items = cat === "All" ? portfolio : portfolio.filter((p) => p.category === cat);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {projectCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              cat === c ? "bg-brand-500 text-white" : "bg-white text-ink-700 shadow-sm hover:bg-brand-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/portfolio/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-ink-50">
              <Image
                src={p.shots[0]}
                alt={p.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition group-hover:scale-[1.03]"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink-700">
                {p.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-extrabold text-ink-700">{p.title}</h3>
              <p className="mt-1 text-sm text-ink-700/70">{p.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-700/70">
                    {t}
                  </span>
                ))}
              </div>
              <span className="mt-4 text-sm font-bold text-brand-600 group-hover:underline">View project →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
