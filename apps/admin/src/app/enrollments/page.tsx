"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUnlockCode } from "@/lib/api";

const prettyCourse = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const fmtDate = (iso: string) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default function EnrollmentsPage() {
  const [codes, setCodes] = useState<AdminUnlockCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/unlock-codes", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setCodes(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRevoke(c: AdminUnlockCode) {
    setBusy(c.id);
    try {
      const res = await fetch(`/api/unlock-codes/${c.id}/revoke?revoked=${!c.revoked}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setCodes((prev) => prev.map((x) => (x.id === c.id ? data : x)));
    } finally {
      setBusy(null);
    }
  }

  function copy(code: string) {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied((v) => (v === code ? null : v)), 1500);
    });
  }

  const active = codes.filter((c) => !c.revoked).length;

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? codes.filter((c) =>
        [c.note, c.code, prettyCourse(c.course_slug)].some((f) => f.toLowerCase().includes(needle)),
      )
    : codes;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Enrollments</h1>
        <p className="text-sm text-ink-600/60">
          Everyone who has enrolled in a course, with their unlock code. Copy a code and send it to the learner once
          you&apos;ve confirmed their Mobile Money payment.
        </p>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <p className="text-xl font-extrabold text-ink-600">{codes.length}</p>
              <p className="text-xs font-semibold text-ink-600/60">Total enrollments</p>
            </div>
            <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <p className="text-xl font-extrabold text-green-600">{active}</p>
              <p className="text-xs font-semibold text-ink-600/60">Active codes</p>
            </div>
            <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <p className="text-xl font-extrabold text-amber-600">{codes.length - active}</p>
              <p className="text-xs font-semibold text-ink-600/60">Revoked</p>
            </div>
          </div>

          <div className="mb-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="🔍 Search by name, phone, email, code or course…"
              className="w-full max-w-md rounded-lg border border-ink-600/15 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
            />
            {needle && (
              <p className="mt-1 text-xs text-ink-600/50">
                {filtered.length} match{filtered.length === 1 ? "" : "es"} for &ldquo;{q}&rdquo;
              </p>
            )}
          </div>

          {codes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-sm text-ink-600/60">
              No enrollments yet. When a learner registers for a course, they appear here with their unlock code.
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-sm text-ink-600/60">
              No enrollments match &ldquo;{q}&rdquo;.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-ink-600/10 bg-white shadow-sm">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-ink-600/10 bg-ink-50 text-[11px] uppercase tracking-wide text-ink-600/60">
                  <tr>
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold">Course</th>
                    <th className="p-3 font-semibold">Learner</th>
                    <th className="p-3 font-semibold">Code</th>
                    <th className="p-3 text-center font-semibold">Status</th>
                    <th className="p-3 text-center font-semibold">Uses</th>
                    <th className="p-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-ink-600/5 last:border-0 align-top hover:bg-ink-50/50">
                      <td className="whitespace-nowrap p-3 text-xs text-ink-600/60">{fmtDate(c.created_at)}</td>
                      <td className="p-3 font-semibold text-ink-600">{prettyCourse(c.course_slug)}</td>
                      <td className="p-3 text-ink-600/80">{c.note || "—"}</td>
                      <td className="p-3">
                        <button
                          onClick={() => copy(c.code)}
                          title="Copy code"
                          className={`font-mono font-extrabold tracking-wider ${c.revoked ? "text-ink-600/40 line-through" : "text-brand-700"}`}
                        >
                          {copied === c.code ? "Copied!" : c.code}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            c.revoked ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {c.revoked ? "Revoked" : "Active"}
                        </span>
                      </td>
                      <td className="p-3 text-center text-ink-600/60">{c.redeemed_count}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toggleRevoke(c)}
                          disabled={busy === c.id}
                          className={`rounded px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
                            c.revoked ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {busy === c.id ? "…" : c.revoked ? "Restore" : "Revoke"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
