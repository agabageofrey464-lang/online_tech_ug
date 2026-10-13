"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { applicationMessage } from "@/lib/auto-message";
import { ReplyButton } from "@/components/reply-button";
import { INTERN_TEMPLATES } from "@/lib/intern-templates";
import { loadImg, todayISO } from "@/lib/doc-kit";
import { buildInternList } from "@/lib/intern-list-pdf";

/**
 * Internship applicants, on a page of their own.
 *
 * They used to sit among the job applications, where a student asking for a
 * seven-week placement and a candidate for a paid post were one list with one
 * set of words. Here is every student who applied: their details as they gave
 * them, where each stands, the reply to send for that stage, and the list as
 * a sheet to share with the students and their supervisors.
 */

type App = { id: number; job_title: string; name: string; email: string; phone: string; message: string; has_cv: boolean; status: string; created_at: string };

const WINDOW = "1 November – 18 December 2026";
const STATUSES = ["new", "reviewed", "shortlisted", "rejected"] as const;
const LABEL: Record<string, string> = { new: "New", reviewed: "Details checked", shortlisted: "Place confirmed", rejected: "Declined" };
const TONE: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-amber-100 text-amber-700",
  shortlisted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const isInternship = (a: App) => /intern|industrial training/i.test(a.job_title || "");
const isTest = (a: App) => /^test\b/i.test(a.name.trim());

/** The form's "University: KIU" lines, by label. */
function fields(a: App): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of (a.message || "").split("\n")) {
    const m = line.match(/^([^:]{2,40}):\s*(.+)$/);
    if (m) out[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return out;
}
const fieldOf = (a: App, f: Record<string, string>) => f["field wanted"] || a.job_title.split("—")[1]?.trim() || "";
const ref = (a: App) => `OTU-A${String(a.id).padStart(5, "0")}`;
const fmt = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");

export default function InternshipApplicantsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await (await fetch("/api/applications", { cache: "no-store" })).json();
      setApps(Array.isArray(data) ? data.filter(isInternship) : []);
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
    await fetch(`/api/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  const real = useMemo(() => apps.filter((a) => !isTest(a)), [apps]);
  const count = (s: string) => real.filter((a) => a.status === s).length;
  const listed = apps.filter((a) => show === "all" || a.status === show);

  // The sheet and the message carry names, schools and fields — never phone
  // numbers or registration numbers.
  const shareRows = (only?: string) =>
    real
      .filter((a) => a.status !== "rejected" && (!only || a.status === only))
      .map((a) => {
        const f = fields(a);
        return { name: a.name.trim(), university: f["university"] ?? "", course: f["course"] ?? "", field: fieldOf(a, f), status: LABEL[a.status] ?? a.status };
      });

  async function downloadList(only?: string) {
    const logo = await loadImg("/logo-lockup-dark.png");
    const title = only === "shortlisted" ? "CONFIRMED INTERNS" : "INTERNSHIP APPLICANTS";
    buildInternList(shareRows(only), { title, window: WINDOW, logo }).save(`Online-Tech-Uganda-${only === "shortlisted" ? "Confirmed-Interns" : "Internship-Applicants"}-${todayISO()}.pdf`);
  }

  function listText() {
    const rows = shareRows("shortlisted");
    return [
      `ONLINE TECH UGANDA — INTERNSHIP ${WINDOW}`,
      `Confirmed students (${rows.length}):`,
      "",
      ...rows.map((r, i) => `${i + 1}. ${r.name}${r.university ? ` — ${r.university}` : ""}${r.field ? ` · ${r.field}` : ""}`),
      "",
      "If your name is missing, message us on 0756 839 270.",
    ].join("\n");
  }

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Internship applicants</h1>
        <p className="text-sm text-ink-600/60">
          Intake {WINDOW} · online. Every student who applied on the site, kept apart from job applications.
        </p>
      </header>

      {/* Where the intake stands; each tile narrows the list to its own. */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { k: "all", n: real.length, l: "Applied", c: "border-ink-600/15 text-ink-600" },
          { k: "new", n: count("new"), l: "New — to check", c: "border-blue-200 text-blue-700" },
          { k: "reviewed", n: count("reviewed"), l: "Details checked", c: "border-amber-200 text-amber-700" },
          { k: "shortlisted", n: count("shortlisted"), l: "Place confirmed", c: "border-green-200 text-green-700" },
          { k: "rejected", n: count("rejected"), l: "Declined", c: "border-red-200 text-red-700" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setShow(t.k)}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${t.c} ${show === t.k ? "ring-2 ring-brand-500" : "hover:shadow-md"}`}
          >
            <span className="block text-3xl font-extrabold leading-none">{t.n}</span>
            <span className="mt-1.5 block text-xs font-semibold">{t.l}</span>
          </button>
        ))}
      </div>

      {/* The list, to share. */}
      <div className="mb-5 rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-ink-600">Share the list</h2>
        <p className="mt-1 text-sm text-ink-600/65">
          On your letterhead, with each student&apos;s name, university, course, field and status. Phone numbers, emails and registration
          numbers are left out, so it is safe to post in a group.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => downloadList()} disabled={real.length === 0} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50">
            ⬇ All applicants (PDF)
          </button>
          <button onClick={() => downloadList("shortlisted")} disabled={count("shortlisted") === 0} className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50">
            ⬇ Confirmed students only (PDF)
          </button>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(listText());
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            disabled={count("shortlisted") === 0}
            className="rounded-lg border border-ink-600/20 px-5 py-2.5 text-sm font-bold text-ink-600 hover:bg-ink-50 disabled:opacity-50"
          >
            {copied ? "✓ Copied — paste it in WhatsApp" : "Copy confirmed list as a message"}
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-ink-600">
        <p className="font-extrabold">To approve a student and tell them</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-600/80">
          <li>Find the student below and press <b>View details</b> to check what they filled in. Open their university letter if there is one.</li>
          <li>Change the box on the right from <b>New</b> to <b>Place confirmed</b>.</li>
          <li>Press <b>Reply</b> under their name and pick a ready message: Place approved, Training times, Send your details, How to pay, Payment received, Before the first day. Send it by WhatsApp or email.</li>
          <li>When they have paid, write their letter under <b>Internship letters</b> in the menu.</li>
        </ol>
      </div>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : listed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          {apps.length === 0 ? "No student has applied yet. Applications from onlinetechug.com/apply appear here." : "No student in this group."}
        </div>
      ) : (
        <div className="space-y-3">
          {listed.map((a, i) => {
            const f = fields(a);
            const rows = Object.entries(f);
            return (
              <div key={a.id} className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-50 text-xs font-extrabold text-ink-600">{i + 1}</span>
                      <p className="text-base font-extrabold text-ink-600">{a.name}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${TONE[a.status] ?? "bg-ink-100 text-ink-600"}`}>{LABEL[a.status] ?? a.status}</span>
                      {isTest(a) && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-bold text-ink-600/60">Test — not counted</span>}
                    </div>
                    <p className="mt-1.5 text-sm text-ink-600">
                      <b>{f["university"] || "University not given"}</b>
                      {f["course"] ? ` · ${f["course"]}` : ""}
                    </p>
                    <p className="text-sm text-ink-600/70">
                      {fieldOf(a, f) || "Field not chosen"} · {a.phone || "no phone"}
                      {a.email ? ` · ${a.email}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-600/45">
                      {ref(a)} · applied {fmt(a.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <select
                      value={a.status}
                      onChange={(e) => setStatus(a.id, e.target.value)}
                      aria-label={`Status of ${a.name}`}
                      className="rounded-lg border border-ink-600/20 px-3 py-2 text-sm font-bold text-ink-600"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {LABEL[s]}
                        </option>
                      ))}
                    </select>
                    {a.has_cv ? (
                      <a href={`/api/applications/${a.id}/cv`} target="_blank" rel="noreferrer" className="rounded-md bg-ink-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-ink-600">
                        Open university letter
                      </a>
                    ) : (
                      <span className="text-xs text-ink-600/40">No letter attached</span>
                    )}
                    <button onClick={() => setOpen(open === a.id ? null : a.id)} className="text-xs font-bold text-brand-600 hover:underline">
                      {open === a.id ? "Hide details" : "View details"}
                    </button>
                  </div>
                </div>

                {open === a.id &&
                  (rows.length >= 3 ? (
                    <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-ink-600/10 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      {rows.map(([k, v]) => (
                        <div key={k} className="min-w-0">
                          <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-600/50">{k}</dt>
                          <dd className="break-words font-semibold text-ink-600">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="mt-4 whitespace-pre-line border-t border-ink-600/10 pt-4 text-sm text-ink-600/80">
                      {a.message || "This student applied through the short form, before the full one was added. Ask them for their university, course and registration number."}
                    </p>
                  ))}

                <ReplyButton
                  name={a.name}
                  email={a.email}
                  phone={a.phone}
                  templates={INTERN_TEMPLATES}
                  label="Reply"
                  context={`Internship — ${LABEL[a.status] ?? a.status}`}
                  auto={applicationMessage({ name: a.name, status: a.status, job_title: a.job_title })}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
