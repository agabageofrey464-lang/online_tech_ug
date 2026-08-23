"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Check, Lock, Search, KeyRound } from "lucide-react";
import { courses, lessonPrice } from "@/lib/data";
import { ugx } from "@/lib/site";
import { useAuth } from "@/lib/auth";

// Owner-only reference of every unlock code. Deterministic:
//   BASECODE          -> unlocks the whole course
//   BASECODE-<n>      -> unlocks only lesson n
// After a customer pays, copy the matching code here and send it on WhatsApp.
export default function CourseCodesPage() {
  const { user, loading } = useAuth();
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string>("");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter(
      (c) => c.title.toLowerCase().includes(term) || (c.unlockCode || "").toLowerCase().includes(term),
    );
  }, [q]);

  function copy(code: string) {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(""), 1400);
    });
  }

  if (loading) {
    return <div className="container-page py-16 text-center text-ink-700/50">Loading…</div>;
  }
  if (user?.role !== "admin") {
    return (
      <div className="container-page py-20 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Lock size={26} />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-ink-900">Owner access only</h1>
        <p className="mt-1 text-sm text-ink-700/70">Sign in with the business admin account to view course unlock codes.</p>
        <Link href="/login?next=/learn/codes" className="mt-4 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
          Sign in
        </Link>
      </div>
    );
  }

  const CopyBtn = ({ code }: { code: string }) => (
    <button
      onClick={() => copy(code)}
      className="press inline-flex items-center gap-1.5 rounded-md border border-ink-600/20 px-2.5 py-1 font-mono text-xs font-bold text-ink-800 transition hover:border-brand-400 hover:bg-brand-50"
      title="Copy code"
    >
      {code}
      {copied === code ? <Check size={13} className="text-green-600" /> : <Copy size={13} className="text-ink-600/50" />}
    </button>
  );

  return (
    <div className="container-page py-8">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
          <KeyRound className="text-brand-500" /> Course Unlock Codes
        </h1>
        <p className="mt-1 text-sm text-ink-700/70">
          After a customer pays, copy the matching code and send it on WhatsApp. The <b>base code</b> unlocks the whole course; <b>code-number</b> unlocks a single lesson.
        </p>
      </header>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search course or code…"
          className="w-full rounded-md border border-ink-600/20 py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        {list.map((c) => {
          const base = c.unlockCode || "—";
          return (
            <section key={c.slug} className="overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-600/10 bg-ink-50/60 p-4">
                <div className="min-w-0">
                  <h2 className="truncate font-extrabold text-ink-900">{c.title}</h2>
                  <p className="text-xs text-ink-700/60">{c.lessons} lessons · full course {ugx(c.price)}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-700/50">Whole course:</span>
                  <CopyBtn code={base} />
                </div>
              </div>
              <div className="divide-y divide-ink-600/5">
                {c.syllabus.map((lesson, i) => {
                  const n = i + 1;
                  const free = !!lesson.free;
                  return (
                    <div key={lesson.title} className="flex items-center gap-3 p-3 text-sm">
                      <span className="w-6 shrink-0 text-center font-bold text-ink-600/50">{n}</span>
                      <span className="min-w-0 flex-1 truncate text-ink-800">{lesson.title}</span>
                      {free ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">Free</span>
                      ) : (
                        <>
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-brand-600">{ugx(lessonPrice(lesson.minutes))}</span>
                          <CopyBtn code={`${base}-${n}`} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
