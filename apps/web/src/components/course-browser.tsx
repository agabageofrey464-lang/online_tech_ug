"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Clock, BookOpen, Award, FileText, ArrowRight, Building2, X } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { Badge } from "@/components/ui";
import { ugx } from "@/lib/site";
import { REGISTRATION_FEE, courseTotal, type Course } from "@/lib/data";

/**
 * Course browser for the Learn page.
 *
 * With 22 courses a flat grid is hard to shop, so this adds search, category
 * tabs and a level filter. Categories are derived from the slug — the Course
 * type has no category field and adding one would mean touching every entry.
 */

const CATEGORIES: { key: string; label: string; match: (slug: string) => boolean }[] = [
  { key: "all", label: "All courses", match: () => true },
  {
    key: "office",
    label: "Office & Admin",
    match: (s) =>
      s.startsWith("microsoft-") || s === "data-analysis-excel" || s === "quickbooks-accounting",
  },
  {
    key: "design",
    label: "Design & Media",
    match: (s) => ["graphic-design", "video-editing", "photography-editing"].includes(s),
  },
  {
    key: "code",
    label: "Programming & Web",
    match: (s) => ["web-development", "python-programming", "mobile-app-development"].includes(s),
  },
  {
    key: "it",
    label: "IT & Networking",
    match: (s) => ["computer-networking", "cybersecurity-basics", "computer-basics", "internet-email", "typing-skills"].includes(s),
  },
  {
    key: "business",
    label: "Business & Marketing",
    match: (s) => ["digital-marketing", "autocad"].includes(s),
  },
];

const LEVELS = ["All levels", "Beginner", "Intermediate", "Advanced"] as const;

export function CourseBrowser({
  courses,
  withNotes,
}: {
  courses: Course[];
  /** Slugs that have written notes, so we can show a "Notes" badge. */
  withNotes: string[];
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All levels");

  const notesSet = useMemo(() => new Set(withNotes), [withNotes]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const category = CATEGORIES.find((c) => c.key === cat) ?? CATEGORIES[0];
    return courses.filter((c) => {
      if (!category.match(c.slug)) return false;
      if (level !== "All levels" && c.level !== level) return false;
      if (!term) return true;
      return (
        c.title.toLowerCase().includes(term) ||
        c.blurb.toLowerCase().includes(term) ||
        c.syllabus.some((l) => l.title.toLowerCase().includes(term))
      );
    });
  }, [courses, q, cat, level]);

  // Counts per tab so empty categories are obvious before you click them.
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of CATEGORIES) m[c.key] = courses.filter((x) => c.match(x.slug)).length;
    return m;
  }, [courses]);

  return (
    <div>
      {/* Search + level */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses — e.g. Excel, design, Python…"
            className="w-full rounded-lg border border-ink-600/15 bg-white py-3 pl-10 pr-9 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-700/40 hover:text-ink-700"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}
          className="rounded-lg border border-ink-600/15 bg-white px-3 py-3 text-sm font-semibold text-ink-700 shadow-sm focus:border-brand-500 focus:outline-none"
        >
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Category tabs */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              cat === c.key
                ? "bg-brand-500 text-white shadow-sm"
                : "border border-ink-600/15 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-600"
            }`}
          >
            {c.label}
            <span className={cat === c.key ? "ml-1.5 text-white/70" : "ml-1.5 text-ink-700/40"}>
              {counts[c.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-ink-700/60">
        Showing <b className="text-ink-900">{filtered.length}</b> of {courses.length} courses
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-4 rounded-card border border-dashed border-ink-600/15 bg-white px-6 py-14 text-center">
          <p className="font-bold text-ink-900">No course matches that</p>
          <p className="mt-1 text-sm text-ink-700/60">Try another word, or clear the filters.</p>
          <button
            onClick={() => {
              setQ("");
              setCat("all");
              setLevel("All levels");
            }}
            className="mt-4 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            Show all courses
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.slug}
              href={`/learn/${c.slug}`}
              className="group flex flex-col overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <SafeImage
                  src={c.cover ?? `/courses/${c.slug}.webp`}
                  alt={c.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
                <span className="absolute right-3 top-3 flex flex-col items-end gap-1">
                  <Badge tone="ink">{c.level}</Badge>
                  {c.durationMonths && (
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-ink-800">
                      {c.durationMonths} Month{c.durationMonths > 1 ? "s" : ""}
                    </span>
                  )}
                </span>
                {notesSet.has(c.slug) && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-ink-800">
                    <FileText size={11} /> Notes
                  </span>
                )}
                <h3 className="absolute inset-x-3 bottom-2 text-[15px] font-extrabold leading-tight text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
                  {c.title}
                </h3>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="line-clamp-2 text-sm text-ink-700/70">{c.blurb}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-ink-700/60">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen size={12} /> {c.lessons} lessons
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> {c.hours}h
                  </span>
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Award size={12} /> Certificate
                  </span>
                  <span className="inline-flex items-center gap-1 text-ink-700/60">
                    <Building2 size={12} /> Physical &amp; online
                  </span>
                </div>

                {/* Fee breakdown — registration is one-time and non-refundable */}
                <dl className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-700/60">Registration Fee</dt>
                    <dd className="font-semibold tabular-nums text-ink-800">{ugx(REGISTRATION_FEE)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-700/60">Training Fee</dt>
                    <dd className="font-semibold tabular-nums text-ink-800">{ugx(c.trainingFee ?? 0)}</dd>
                  </div>
                </dl>

                <div className="mt-2.5 rounded-lg bg-brand-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700/70">
                    Total Investment
                  </p>
                  <p className="text-lg font-extrabold leading-tight text-brand-600">
                    {ugx(courseTotal(c))}
                  </p>
                </div>

                <p className="mt-2 text-[11px] text-ink-700/55">
                  Or study lesson by lesson from <b className="text-ink-800">{ugx(5000)}</b>
                </p>

                <span className="press mt-auto flex items-center justify-center gap-1.5 rounded-md bg-brand-500 px-4 py-2.5 pt-2.5 text-sm font-bold text-white transition group-hover:bg-brand-600">
                  Apply Now <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
