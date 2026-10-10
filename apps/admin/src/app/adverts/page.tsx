"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageUpload } from "@/components/image-upload";
import { SubscriptionControl } from "@/components/subscription-control";

type Advert = {
  id: number;
  title: string;
  advertiser: string;
  description: string;
  image_url: string;
  link_url: string;
  placement: string;
  category: string;
  active: boolean;
  subscription_ends: string | null;
};

const PLACEMENTS = [
  { v: "advertise", label: "Advertisers page" },
  { v: "hero", label: "Hero — top of the homepage, rotating with our slides" },
  { v: "home", label: "Homepage banner" },
  { v: "sidebar", label: "Sidebar" },
];
const CATEGORIES = ["Business", "School", "Institution", "Company", "NGO / Event", "Other"];

const emptyForm = {
  title: "",
  advertiser: "",
  description: "",
  image_url: "",
  link_url: "",
  placement: "advertise",
  category: "Business",
  active: true,
};

export default function AdvertsPage() {
  const [ads, setAds] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/adverts", { cache: "no-store" });
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch {
      setAds([]);
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
  function openEdit(a: Advert) {
    setEditing(a.id);
    setForm({
      title: a.title,
      advertiser: a.advertiser,
      description: a.description,
      image_url: a.image_url,
      link_url: a.link_url,
      placement: a.placement,
      category: a.category,
      active: a.active,
    });
    setErr("");
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = editing
        ? await fetch(`/api/adverts/${editing}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await fetch("/api/adverts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = typeof data?.detail === "string"
          ? data.detail
          : Array.isArray(data?.detail)
            ? data.detail[0]?.msg
            : "";
        setErr(detail || (res.status === 401 ? "Unauthorized — check the admin key in Settings." : "Couldn't save. Keep the title short (max 200 characters) and try again."));
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
    if (!confirm("Delete this advert?")) return;
    const res = await fetch(`/api/adverts/${id}`, { method: "DELETE" });
    if (res.ok) setAds((p) => p.filter((a) => a.id !== id));
  }

  const input = "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">Adverts</h1>
          <p className="text-sm text-ink-600/60">{ads.length} advert(s). These display on the storefront Advertise page / homepage.</p>
        </div>
        <button onClick={openNew} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">+ New advert</button>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : ads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          No adverts yet. Click “New advert” to add a business, school or company ad.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {ads.map((a) => (
            <div key={a.id} className="flex gap-3 rounded-2xl border border-ink-600/10 bg-white p-4 shadow-sm">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink-600/10 bg-ink-50">
                {a.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_url} alt={a.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl">📢</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold text-ink-600">{a.title}</p>
                  {a.active ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Live</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>
                  )}
                </div>
                <p className="truncate text-xs text-ink-600/60">{a.advertiser} · {a.category} · {a.placement}</p>
                <div className="mt-1.5">
                  <SubscriptionControl kind="advert" id={a.id} ends={a.subscription_ends} onChange={load} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={async () => {
                      await fetch(`/api/adverts/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...a, active: !a.active }) });
                      await load();
                    }}
                    className={a.active
                      ? "rounded-md border border-ink-600/20 px-3 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-50"
                      : "rounded-md bg-green-600 px-3 py-1 text-xs font-bold text-white hover:bg-green-700"}
                  >
                    {a.active ? "Unpublish" : "Approve — go live"}
                  </button>
                  <button onClick={() => openEdit(a)} className="rounded-md border border-ink-600/20 px-3 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-50">Edit</button>
                  <button onClick={() => remove(a.id)} className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-extrabold text-ink-600">{editing ? "Edit advert" : "Design a new advert"}</h3>

            <div className="grid gap-5 lg:grid-cols-2">
              {/* Live preview — exactly how it appears on the homepage */}
              <div className="order-1 lg:order-2">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-600/50">✨ Live preview</p>
                <AdvertPreview f={form} />
                <p className="mt-2 text-xs text-ink-600/55">This is how it will look on the site. It updates as you type. Add an image URL for a background photo.</p>
              </div>

              {/* Form fields */}
              <form onSubmit={save} className="order-2 space-y-3 lg:order-1">
                <div>
                  <input required maxLength={200} placeholder="Headline (advert title) — keep it short" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={input} />
                  <p className={`mt-0.5 text-right text-[11px] ${form.title.length > 180 ? "text-red-500" : "text-ink-600/40"}`}>{form.title.length}/200</p>
                </div>
                <input placeholder="Advertiser (business/school/company name)" value={form.advertiser} onChange={(e) => setForm({ ...form, advertiser: e.target.value })} className={input} />
                <textarea placeholder="Short description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} />
                <input placeholder="Background image URL (or upload below)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={input} />
                <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
                <input placeholder="Advertiser's website — where 'Learn more' goes (e.g. https://their-site.com)" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className={input} />
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })} className={input}>
                    {PLACEMENTS.map((p) => <option key={p.v} value={p.v}>{p.label}</option>)}
                  </select>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-ink-600">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Live (visible on site now)
                </label>
                {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={busy} className="flex-1 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                    {busy ? "Saving…" : editing ? "Save changes" : "Create advert"}
                  </button>
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

// Live advert banner preview — mirrors the homepage HomeAdverts rendering, so
// what the admin sees here is exactly what appears on the site.
function AdvertPreview({ f }: { f: typeof emptyForm }) {
  return (
    <div
      className="relative h-[130px] overflow-hidden rounded-xl text-white shadow sm:h-[160px]"
      style={{ background: "linear-gradient(120deg, #211d52, #3c3a87)" }}
    >
      {f.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={f.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      {/* illustrations */}
      <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 16px)" }}
      />
      {f.image_url ? <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85), rgba(0,0,0,0.5), rgba(0,0,0,0.1))" }} /> : null}
      <div className="relative flex h-full flex-col justify-center px-5">
        <span className="text-[10px] font-bold uppercase tracking-wider sm:text-[11px]" style={{ color: "#ff9670" }}>
          Sponsored{f.advertiser ? ` · ${f.advertiser}` : ""}
        </span>
        <h3 className="mt-0.5 line-clamp-2 max-w-[82%] text-base font-extrabold leading-tight drop-shadow sm:text-2xl">
          {f.title || "Your advert headline"}
        </h3>
        {f.description ? (
          <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-white/85 sm:text-sm">{f.description}</p>
        ) : null}
        {f.link_url ? (
          <span className="mt-2 inline-flex w-fit rounded-md bg-white px-3 py-1.5 text-xs font-bold sm:text-sm" style={{ color: "#12102e" }}>
            Learn more →
          </span>
        ) : null}
      </div>
    </div>
  );
}
