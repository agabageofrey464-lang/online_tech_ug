"use client";

import { useCallback, useEffect, useState } from "react";

type Campaign = {
  id: number;
  slug: string;
  program: string;
  badge: string;
  badge_sub: string;
  title: string;
  pill: string;
  note: string;
  small: string;
  cta_label: string;
  link_url: string;
  image_url: string;
  bg_color: string;
  panel_color: string;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  priority: number;
  placement: string;
  discount_pct: number;
  clicks: number;
  live: boolean;
};

const BLANK = {
  title: "",
  program: "",
  badge: "",
  badge_sub: "",
  pill: "",
  note: "",
  small: "T&Cs Apply",
  cta_label: "Shop now",
  link_url: "/shop",
  image_url: "/hero/hero-1.jpg",
  bg_color: "#0e7490",
  panel_color: "#FCDC04",
  starts_at: "",
  ends_at: "",
  priority: 0,
  placement: "home",
  discount_pct: 0,
};

// Colour pairs that read well on the storefront banner.
const THEMES = [
  { name: "Teal", bg: "#0e7490", panel: "#FCDC04" },
  { name: "Deep Teal", bg: "#0d4b5e", panel: "#22d3ee" },
  { name: "Red", bg: "#c41c2e", panel: "#fb7185" },
  { name: "Orange", bg: "#f15a29", panel: "#282363" },
  { name: "Green", bg: "#00a651", panel: "#FCDC04" },
  { name: "Indigo", bg: "#282363", panel: "#f15a29" },
];

export default function CampaignsPage() {
  const [list, setList] = useState<Campaign[]>([]);
  const [form, setForm] = useState({ ...BLANK });
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const rows = await fetch("/api/campaigns", { cache: "no-store" }).then((r) => r.json());
      if (Array.isArray(rows)) setList(rows);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!form.title.trim()) {
      setErr("Give the campaign a title.");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    const payload = {
      ...form,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      priority: Number(form.priority) || 0,
      discount_pct: Number(form.discount_pct) || 0,
    };
    try {
      const res = await fetch(editing ? `/api/campaigns/${editing}` : "/api/campaigns", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg(editing ? "Campaign updated." : "Campaign created.");
        setForm({ ...BLANK });
        setEditing(null);
        load();
      } else {
        setErr(d?.detail || "Couldn't save the campaign.");
      }
    } catch {
      setErr("Network problem — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: Campaign) {
    await fetch(`/api/campaigns/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    load();
  }

  async function remove(c: Campaign) {
    if (!confirm(`Delete "${c.title}" permanently?`)) return;
    await fetch(`/api/campaigns/${c.id}`, { method: "DELETE" });
    load();
  }

  function edit(c: Campaign) {
    setEditing(c.id);
    setForm({
      title: c.title,
      program: c.program,
      badge: c.badge,
      badge_sub: c.badge_sub,
      pill: c.pill,
      note: c.note,
      small: c.small,
      cta_label: c.cta_label,
      link_url: c.link_url,
      image_url: c.image_url,
      bg_color: c.bg_color,
      panel_color: c.panel_color,
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : "",
      ends_at: c.ends_at ? c.ends_at.slice(0, 16) : "",
      priority: c.priority,
      placement: c.placement,
      discount_pct: c.discount_pct,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const input = "mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";
  const liveCount = list.filter((c) => c.live).length;

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Campaigns</h1>
        <p className="text-sm text-ink-600/60">
          Your own promotions on the storefront banner — {liveCount} live of {list.length}.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Editor */}
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-ink-600">
            {editing ? "Edit campaign" : "New campaign"}
          </h2>

          {/* Live preview — what shoppers will see */}
          <div className="mt-3 overflow-hidden rounded-xl" style={{ backgroundColor: form.bg_color }}>
            <div className="flex min-h-[120px]">
              <div className="flex-1 p-4 text-white">
                {form.program && <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{form.program}</p>}
                {(form.badge || form.badge_sub) && (
                  <p className="mt-0.5 text-sm font-black">
                    {form.badge} <span className="opacity-80">{form.badge_sub}</span>
                  </p>
                )}
                <p className="mt-1 text-lg font-black leading-tight">{form.title || "Your headline"}</p>
                {form.pill && (
                  <span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-ink-900">
                    {form.pill}
                  </span>
                )}
                {form.note && <p className="mt-1.5 text-[11px] opacity-85">{form.note}</p>}
              </div>
              <div className="hidden w-[35%] shrink-0 sm:block" style={{ backgroundColor: form.panel_color }} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-ink-700">
              Headline *
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Enjoy FREE Setup" className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700">
              Programme label
              <input value={form.program} onChange={(e) => set("program", e.target.value)} placeholder="Online Tech Festival" className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700">
              Badge
              <input value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Super Saver" className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700">
              Badge line 2
              <input value={form.badge_sub} onChange={(e) => set("badge_sub", e.target.value)} placeholder="Sale" className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700 sm:col-span-2">
              Offer pill
              <input value={form.pill} onChange={(e) => set("pill", e.target.value)} placeholder="ON LAPTOPS OVER UGX 1M" className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700 sm:col-span-2">
              Supporting line
              <input value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Windows, Office & antivirus installed free" className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700">
              Button text
              <input value={form.cta_label} onChange={(e) => set("cta_label", e.target.value)} className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700">
              Links to
              <input value={form.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="/shop?cat=Laptops" className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700 sm:col-span-2">
              Image URL
              <input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="/hero/hero-1.jpg" className={input} />
            </label>
          </div>

          <p className="mt-4 text-sm font-semibold text-ink-700">Colour theme</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  set("bg_color", t.bg);
                  set("panel_color", t.panel);
                }}
                title={t.name}
                className={`h-8 w-14 overflow-hidden rounded-md ring-2 transition ${
                  form.bg_color === t.bg ? "ring-brand-500" : "ring-transparent hover:ring-ink-300"
                }`}
              >
                <span className="flex h-full">
                  <span className="flex-1" style={{ backgroundColor: t.bg }} />
                  <span className="w-1/3" style={{ backgroundColor: t.panel }} />
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-ink-700">
              Starts <span className="font-normal text-ink-600/50">(blank = now)</span>
              <input type="datetime-local" value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700">
              Ends <span className="font-normal text-ink-600/50">(blank = no end)</span>
              <input type="datetime-local" value={form.ends_at} onChange={(e) => set("ends_at", e.target.value)} className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700">
              Priority <span className="font-normal text-ink-600/50">(higher shows first)</span>
              <input type="number" value={form.priority} onChange={(e) => set("priority", Number(e.target.value))} className={input} />
            </label>
            <label className="text-sm font-semibold text-ink-700">
              Discount % <span className="font-normal text-ink-600/50">(0 = hide)</span>
              <input type="number" value={form.discount_pct} onChange={(e) => set("discount_pct", Number(e.target.value))} className={input} />
            </label>
          </div>

          {err && <p className="mt-3 text-sm font-semibold text-red-600">{err}</p>}
          {msg && <p className="mt-3 text-sm font-semibold text-green-600">✓ {msg}</p>}

          <div className="mt-4 flex gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Create campaign"}
            </button>
            {editing && (
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({ ...BLANK });
                }}
                className="rounded-md border border-ink-600/20 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        {/* List */}
        <section className="h-fit rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-ink-600">All campaigns</h2>
          {list.length === 0 ? (
            <p className="mt-3 text-sm text-ink-600/60">
              None yet. Create one and it appears on the storefront banner straight away.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {list.map((c) => (
                <li key={c.id} className="rounded-xl border border-ink-600/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-700">{c.title}</p>
                      <p className="text-[11px] text-ink-600/50">
                        {c.program || c.placement} · {c.clicks} click{c.clicks === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.live ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-600/60"
                      }`}
                    >
                      {c.live ? "Live" : c.active ? "Scheduled" : "Off"}
                    </span>
                  </div>
                  {(c.starts_at || c.ends_at) && (
                    <p className="mt-1 text-[11px] text-ink-600/50">
                      {c.starts_at ? `From ${c.starts_at.slice(0, 10)}` : "From now"}
                      {c.ends_at ? ` → ${c.ends_at.slice(0, 10)}` : " → no end"}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button onClick={() => edit(c)} className="rounded-md border border-ink-600/20 px-2.5 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-50">
                      Edit
                    </button>
                    <button onClick={() => toggle(c)} className="rounded-md border border-ink-600/20 px-2.5 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-50">
                      {c.active ? "Turn off" : "Turn on"}
                    </button>
                    <button onClick={() => remove(c)} className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
