"use client";

import { useCallback, useEffect, useState } from "react";
import { applicationMessage } from "@/lib/auto-message";
import { ReplyButton, APPLICANT_TEMPLATES } from "@/components/reply-button";

type App = {
  id: number;
  job_title: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  has_cv: boolean;
  status: string;
  created_at: string;
};

const STATUSES = ["new", "reviewed", "shortlisted", "rejected"];
const tone: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-amber-100 text-amber-700",
  shortlisted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications", { cache: "no-store" });
      const data = await res.json();
      setApps(Array.isArray(data) ? data : []);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: number, status: string) {
    setApps((p) => p.map((a) => (a.id === id ? { ...a, status } : a)));
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  const fmt = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Job Applications</h1>
        <p className="text-sm text-ink-600/60">{apps.length} application(s) from the careers page. Download CVs and update status.</p>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          No applications yet. They appear here when someone applies online with their CV.
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink-600">{a.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${tone[a.status] ?? "bg-ink-100 text-ink-600"}`}>{a.status}</span>
                  </div>
                  <p className="text-sm text-ink-600/60">
                    {a.job_title || "General application"} · {a.phone || "no phone"}{a.email ? ` · ${a.email}` : ""} · {fmt(a.created_at)}
                  </p>
                  {a.message && <p className="mt-2 max-w-2xl text-sm text-ink-600/75">{a.message}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {a.has_cv ? (
                    <a href={`/api/applications/${a.id}/cv`} target="_blank" rel="noreferrer" className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600">Download CV</a>
                  ) : (
                    <span className="text-xs text-ink-600/40">No CV attached</span>
                  )}
                  <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value)} className="rounded-md border border-ink-600/15 px-2 py-1 text-xs">
                    {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Tell them where they stand — most applicants never hear back
                  at all, and that is the whole complaint. */}
              <ReplyButton
                name={a.name}
                email={a.email}
                phone={a.phone}
                templates={APPLICANT_TEMPLATES}
                label="Edit"
                context={a.job_title || "General application"}
                auto={applicationMessage({ name: a.name, status: a.status, job_title: a.job_title })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
