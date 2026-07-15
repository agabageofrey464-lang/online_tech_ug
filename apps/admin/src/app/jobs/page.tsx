"use client";

import { useCallback, useEffect, useState } from "react";

type Job = {
  id: number;
  title: string;
  type: string;
  category: string;
  location: string;
  summary: string;
  requirements: string[];
  openings: number;
  is_open: boolean;
};

const TYPES = ["Full-time", "Internship", "Part-time", "Contract"];
const CATEGORIES = ["Software", "IT Support", "Sales", "Design", "Marketing"];

const emptyForm = {
  title: "",
  type: "Full-time",
  category: "Software",
  location: "Kampala",
  summary: "",
  requirements: "",
  openings: "1",
  is_open: true,
};

export default function JobsAdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", { cache: "no-store" });
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setErr("");
    setShowForm(true);
  }

  function openEdit(j: Job) {
    setEditing(j.id);
    setForm({
      title: j.title,
      type: j.type,
      category: j.category,
      location: j.location,
      summary: j.summary,
      requirements: (j.requirements ?? []).join("\n"),
      openings: String(j.openings),
      is_open: j.is_open,
    });
    setErr("");
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const payload = {
      title: form.title,
      type: form.type,
      category: form.category,
      location: form.location,
      summary: form.summary,
      requirements: form.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
      openings: Number(form.openings) || 1,
      is_open: form.is_open,
    };
    try {
      const res = editing
        ? await fetch(`/api/jobs/${editing}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        setErr("Couldn't save. Check the admin key in Settings.");
      } else {
        setShowForm(false);
        await load();
      }
    } catch {
      setErr("Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this posting?")) return;
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (res.ok) setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  async function toggleOpen(j: Job) {
    const res = await fetch(`/api/jobs/${j.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...j, is_open: !j.is_open, requirements: j.requirements ?? [] }),
    });
    if (res.ok) setJobs((prev) => prev.map((x) => (x.id === j.id ? { ...x, is_open: !x.is_open } : x)));
  }

  const input = "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";
  const open = jobs.filter((j) => j.is_open).length;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">Jobs &amp; Internships</h1>
          <p className="text-sm text-ink-600/60">
            {jobs.length} posting(s) · {open} open. These appear on the storefront careers page.
          </p>
        </div>
        <button onClick={openNew} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">
          + New posting
        </button>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          No postings yet. Click “New posting” to add your first job or internship.
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-ink-600">{j.title}</p>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">{j.type}</span>
                  {j.is_open ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Open</span>
                  ) : (
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600/60">Closed</span>
                  )}
                </div>
                <p className="text-sm text-ink-600/60">{j.category} · {j.location} · {j.openings} opening(s)</p>
                <p className="mt-1 max-w-2xl text-sm text-ink-600/70">{j.summary}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => toggleOpen(j)} className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50">
                  {j.is_open ? "Close" : "Reopen"}
                </button>
                <button onClick={() => openEdit(j)} className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50">
                  Edit
                </button>
                <button onClick={() => remove(j.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-lg font-extrabold text-ink-600">{editing ? "Edit posting" : "New posting"}</h3>
            <form onSubmit={save} className="space-y-3">
              <input required placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={input} />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={input}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={input} />
                <input type="number" min="1" placeholder="Openings" value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })} className={input} />
              </div>
              <textarea placeholder="Short summary" rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={input} />
              <textarea placeholder="Requirements — one per line" rows={4} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className={input} />
              <label className="flex items-center gap-2 text-sm text-ink-600">
                <input type="checkbox" checked={form.is_open} onChange={(e) => setForm({ ...form, is_open: e.target.checked })} />
                Open for applications
              </label>
              {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className="flex-1 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                  {busy ? "Saving…" : editing ? "Save changes" : "Create posting"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-ink-600/20 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
