"use client";

import { useState } from "react";
import { Upload, X, CheckCircle2 } from "lucide-react";

/** "Apply online" button + modal with CV upload for a job. */
export function JobApply({
  jobId,
  jobTitle,
  label = "Apply online",
  className = "press rounded-[3px] bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600",
}: {
  jobId?: number;
  jobTitle: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [fileName, setFileName] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("job_title", jobTitle);
      if (jobId != null) fd.set("job_id", String(jobId));
      const res = await fetch("/_api/careers/apply", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setErr(data.detail || "Couldn't submit. Please try again.");
      else setDone(true);
    } catch {
      setErr("Couldn't submit. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full min-w-0 rounded-[3px] border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";
  const lab = "mb-1 block text-[12px] font-bold text-ink-800";

  // An internship has a form of its own, which asks for the university, the
  // course and the registration number the acceptance letter needs.
  if (/intern|industrial training/i.test(jobTitle)) {
    return (
      <a href="/internship#apply-form" className={className}>
        {label}
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setDone(false); setErr(""); setFileName(""); }}
        className={className}
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-ink-900">Apply for this role</h3>
                <p className="text-sm text-ink-700/60">{jobTitle}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-600/50 hover:text-ink-900"><X size={20} /></button>
            </div>

            {done ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto text-green-600" size={44} />
                <p className="mt-3 font-bold text-ink-900">Application submitted!</p>
                <p className="mt-1 text-sm text-ink-700/60">Thank you. We&apos;ll review your application and get back to you.</p>
                <button onClick={() => setOpen(false)} className="mt-4 rounded-[3px] bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600">Done</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className={lab} htmlFor="ja-name">Your full name</label>
                  <input id="ja-name" required name="name" autoComplete="name" placeholder="e.g. Chandia Judith" className={input} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label className={lab} htmlFor="ja-phone">Phone number</label>
                    <input id="ja-phone" required name="phone" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" className={input} />
                  </div>
                  <div className="min-w-0">
                    <label className={lab} htmlFor="ja-email">Email</label>
                    <input id="ja-email" name="email" type="email" autoComplete="email" placeholder="you@gmail.com" className={input} />
                  </div>
                </div>
                <div>
                  <label className={lab} htmlFor="ja-msg">
                    About you <span className="font-normal text-ink-700/55">— optional, one or two lines</span>
                  </label>
                  <textarea id="ja-msg" name="message" rows={3} placeholder="What you studied, and any experience you have. You can leave this empty." className={input} />
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-[3px] border border-dashed border-ink-600/30 px-3 py-3 text-sm text-ink-700/70 hover:border-brand-400">
                  <Upload size={18} className="text-brand-500" />
                  <span className="truncate">{fileName || "Attach your CV (PDF, DOC, DOCX — max 5MB)"}</span>
                  <input type="file" name="cv" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
                </label>
                {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
                <button type="submit" disabled={busy} className="w-full rounded-[3px] bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                  {busy ? "Submitting…" : "Submit application"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
