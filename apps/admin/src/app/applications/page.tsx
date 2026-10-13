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

const isInternship = (a: App) => /intern|industrial training/i.test(a.job_title || "");
/** What each status means for an internship, where "shortlisted" is a confirmed place. */
const INTERN_LABEL: Record<string, string> = { new: "New", reviewed: "Details checked", shortlisted: "Place confirmed", rejected: "Declined" };

/** "University: KIU" lines from the form, as label and value. */
function details(message: string): [string, string][] {
  return message
    .split("\n")
    .map((line) => line.match(/^([^:]{2,40}):\s*(.+)$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => [m[1], m[2]]);
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState<"all" | "internships" | "jobs">("all");

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
        <h1 className="text-2xl font-extrabold text-ink-600">Applications</h1>
        <p className="text-sm text-ink-600/60">
          {apps.length} application(s): {apps.filter(isInternship).length} for internship, {apps.filter((a) => !isInternship(a)).length} for jobs. Check
          each student&apos;s details, set where they stand, and reply.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["internships", "Internships"],
              ["jobs", "Jobs"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setShow(v)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${show === v ? "bg-brand-500 text-white" : "border border-ink-600/20 bg-white text-ink-600"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      {/* How to handle an internship application, for whoever is at the desk. */}
      <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-ink-600">
        <p className="font-extrabold">How to verify a student and reply</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-600/80">
          <li>Read their details below and open the university letter if they attached one. Call or WhatsApp them if anything is unclear.</li>
          <li>Set the status: <b>Details checked</b> while you verify, <b>Place confirmed</b> to accept them, <b>Declined</b> if there is no place.</li>
          <li>Press <b>Edit</b> under the application. The message is already written for that status — change it if you wish and send it by WhatsApp or email.</li>
          <li>When they pay UGX 150,000, write their acceptance letter under <b>Internship letters</b> in the menu.</li>
        </ol>
      </div>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          No applications yet. They appear here when someone applies online with their CV.
        </div>
      ) : (
        <div className="space-y-3">
          {apps.filter((a) => show === "all" || (show === "internships") === isInternship(a)).map((a) => (
            <div key={a.id} className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink-600">{a.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${tone[a.status] ?? "bg-ink-100 text-ink-600"}`}>
                      {isInternship(a) ? (INTERN_LABEL[a.status] ?? a.status) : a.status}
                    </span>
                    <span className="text-[11px] font-semibold text-ink-600/45">OTU-A{String(a.id).padStart(5, "0")}</span>
                  </div>
                  <p className="text-sm text-ink-600/60">
                    {a.job_title || "General application"} · {a.phone || "no phone"}{a.email ? ` · ${a.email}` : ""} · {fmt(a.created_at)}
                  </p>
                  {a.message &&
                    (details(a.message).length >= 3 ? (
                      // The internship form, set out as it was filled in.
                      <dl className="mt-3 grid max-w-2xl gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                        {details(a.message).map(([k, v], i) => (
                          <div key={i} className="min-w-0">
                            <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-600/50">{k}</dt>
                            <dd className="break-words font-semibold text-ink-600">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="mt-2 max-w-2xl whitespace-pre-line text-sm text-ink-600/75">{a.message}</p>
                    ))}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {a.has_cv ? (
                    <a href={`/api/applications/${a.id}/cv`} target="_blank" rel="noreferrer" className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600">{isInternship(a) ? "Open university letter" : "Download CV"}</a>
                  ) : (
                    <span className="text-xs text-ink-600/40">No file attached</span>
                  )}
                  <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value)} className="rounded-md border border-ink-600/15 px-2 py-1 text-xs">
                    {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{isInternship(a) ? (INTERN_LABEL[s] ?? s) : s}</option>)}
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
