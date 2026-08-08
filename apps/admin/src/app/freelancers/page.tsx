"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageUpload } from "@/components/image-upload";
import { SubscriptionControl } from "@/components/subscription-control";

type Freelancer = {
  id: number;
  name: string;
  title: string;
  skills: string[];
  bio: string;
  rate: string;
  location: string;
  phone: string;
  email: string;
  portfolio_url: string;
  image_url: string;
  approved: boolean;
  subscription_ends: string | null;
};

const emptyForm = { name: "", title: "", skills: "", bio: "", rate: "", location: "Uganda", phone: "", email: "", portfolio_url: "", image_url: "" };

export default function FreelancersAdminPage() {
  const [list, setList] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/freelancers", { cache: "no-store" });
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(f: Freelancer, approved: boolean) {
    setBusy(f.id);
    try {
      const res = await fetch(`/api/freelancers/${f.id}/approve?approved=${approved}`, { method: "POST" });
      if (res.ok) setList((p) => p.map((x) => (x.id === f.id ? { ...x, approved } : x)));
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this freelancer?")) return;
    const res = await fetch(`/api/freelancers/${id}`, { method: "DELETE" });
    if (res.ok) setList((p) => p.filter((x) => x.id !== id));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    let saved = false;
    try {
      const res = await fetch("/api/freelancers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        saved = true;
      } else {
        // Show what the server actually said, not a guess.
        const data = await res.json().catch(() => ({} as Record<string, unknown>));
        const detail = data.error || data.detail;
        setErr(
          typeof detail === "string" && detail
            ? detail
            : res.status === 401
              ? "Not authorised — check the admin key in Settings."
              : `Couldn't add (error ${res.status}). Please try again.`,
        );
      }
    } catch {
      setErr("Couldn't reach the server. Check your connection, then try again.");
    } finally {
      setSaving(false);
    }
    // Reload AFTER the try: a hiccup here must never make a successful save look failed.
    if (saved) {
      setShowForm(false);
      setForm(emptyForm);
      await load();
    }
  }

  const pending = list.filter((f) => !f.approved).length;
  const input = "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">Freelancers</h1>
          <p className="text-sm text-ink-600/60">{list.length} listed · {pending} awaiting approval. Approved freelancers show in the public directory.</p>
        </div>
        <button onClick={() => { setShowForm(true); setErr(""); setForm(emptyForm); }} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">+ Add freelancer</button>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">No freelancers yet.</div>
      ) : (
        <div className="space-y-3">
          {list.map((f) => (
            <div key={f.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-ink-600">{f.name}</p>
                  <span className="text-sm text-ink-600/60">{f.title}</span>
                  {f.approved ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Approved</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Pending</span>
                  )}
                </div>
                <p className="text-xs text-ink-600/50">{f.location} · {f.phone}{f.email ? ` · ${f.email}` : ""} · {f.skills.join(", ")}</p>
                <div className="mt-2">
                  <SubscriptionControl kind="freelancer" id={f.id} ends={f.subscription_ends} onChange={load} />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {f.approved ? (
                  <button onClick={() => approve(f, false)} disabled={busy === f.id} className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-50">Unlist</button>
                ) : (
                  <button onClick={() => approve(f, true)} disabled={busy === f.id} className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50">{busy === f.id ? "…" : "Approve"}</button>
                )}
                <button onClick={() => remove(f.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-extrabold text-ink-600">Add a freelancer</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Live preview — how it appears in the public directory */}
              <div className="order-1 lg:order-2">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-600/50">✨ Public profile preview</p>
                <FreelancerPreview f={form} />
                <p className="mt-2 text-xs text-ink-600/55">This is how the freelancer appears to interested clients. It updates as you type.</p>
              </div>

              <form onSubmit={add} className="order-2 space-y-3 lg:order-1">
                <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
                <input required placeholder="Title (e.g. Web Developer)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={input} />
                <input placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className={input} />
                <textarea placeholder="Bio" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={input} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Rate (e.g. From UGX 50k/day)" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className={input} />
                  <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={input} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
                  <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
                </div>
                <input placeholder="Portfolio link" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} className={input} />
                <input placeholder="Photo URL (or upload below)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={input} />
                <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
                {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="flex-1 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">{saving ? "Saving…" : "Add & publish"}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-ink-600/20 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Live preview — mirrors the public freelancers-directory card.
function FreelancerPreview({ f }: { f: typeof emptyForm }) {
  const skills = f.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6);
  const initials = (f.name || "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex flex-col rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-lg font-extrabold text-brand-600">
          {f.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initials || "FL"
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-extrabold text-ink-600">{f.name || "Freelancer name"}</p>
          <p className="truncate text-sm font-semibold text-brand-600">{f.title || "Their title"}</p>
          <p className="text-xs text-ink-600/50">📍 {f.location || "Uganda"}</p>
        </div>
      </div>
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span key={s} className="rounded-full bg-ink-50 px-2 py-0.5 text-[11px] font-semibold text-ink-600">{s}</span>
          ))}
        </div>
      )}
      {f.bio && <p className="mt-2 text-sm text-ink-600/70">{f.bio}</p>}
      {f.rate && <p className="mt-2 text-sm font-bold text-ink-600">{f.rate}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white">Hire</span>
        {f.phone && <span className="rounded-md border border-ink-600/20 px-2.5 py-1.5 text-xs text-ink-600">Call</span>}
        {f.email && <span className="rounded-md border border-ink-600/20 px-2.5 py-1.5 text-xs text-ink-600">Email</span>}
        {f.portfolio_url && <span className="rounded-md border border-ink-600/20 px-2.5 py-1.5 text-xs text-ink-600">Portfolio</span>}
      </div>
    </div>
  );
}
