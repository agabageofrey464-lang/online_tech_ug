"use client";

import { useEffect, useState } from "react";
import type { AdminUnlockCode } from "@/lib/api";

// Per-payment unlock codes for one course. Generate a fresh code to send a
// learner after they pay via Mobile Money, and revoke leaked/refunded codes.
export function CourseCodes({ slug }: { slug: string }) {
  const [codes, setCodes] = useState<AdminUnlockCode[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/unlock-codes?course=${encodeURIComponent(slug)}`, { cache: "no-store" });
      const data = await res.json();
      setCodes(Array.isArray(data) ? data : []);
    } catch {
      setErr("Couldn't load codes.");
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/unlock-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_slug: slug, note: note.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.detail || "Couldn't generate a code.");
      } else {
        setNote("");
        setCodes((prev) => [data, ...prev]);
      }
    } catch {
      setErr("Couldn't generate a code.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleRevoke(c: AdminUnlockCode) {
    try {
      const res = await fetch(`/api/unlock-codes/${c.id}/revoke?revoked=${!c.revoked}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setCodes((prev) => prev.map((x) => (x.id === c.id ? data : x)));
    } catch {
      /* ignore */
    }
  }

  function copy(code: string) {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied((v) => (v === code ? null : v)), 1500);
    });
  }

  return (
    <div className="mt-3 rounded-lg border border-ink-600/10 bg-ink-50/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Customer name / phone (optional)"
          className="min-w-0 flex-1 rounded-md border border-ink-600/15 px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={generate}
          disabled={busy}
          className="shrink-0 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {busy ? "Generating…" : "Generate code"}
        </button>
        {codes.length === 0 && !loading && (
          <button onClick={load} className="shrink-0 text-xs font-semibold text-brand-600 hover:underline">
            Show codes
          </button>
        )}
      </div>

      {err && <p className="mt-2 text-xs text-red-500">{err}</p>}

      {codes.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {codes.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 rounded-md bg-white px-2.5 py-1.5 text-xs">
              <button
                onClick={() => copy(c.code)}
                title="Copy code"
                className={`font-mono font-extrabold tracking-wider ${c.revoked ? "text-ink-600/40 line-through" : "text-brand-700"}`}
              >
                {copied === c.code ? "Copied!" : c.code}
              </button>
              <span className="min-w-0 flex-1 truncate text-ink-600/60">{c.note || "—"}</span>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 font-semibold ${
                  c.revoked ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                }`}
              >
                {c.revoked ? "Pending" : "Active"}
              </span>
              <span className="shrink-0 text-ink-600/50">{c.redeemed_count} use(s)</span>
              <button
                onClick={() => toggleRevoke(c)}
                className={`shrink-0 rounded px-2 py-0.5 font-semibold ${
                  c.revoked ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {c.revoked ? "Activate (paid)" : "Revoke"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
