"use client";

import { useCallback, useEffect, useState } from "react";

type Post = {
  id: number;
  slug: string;
  title: string;
  type: string;
  category: string;
  excerpt: string;
  body: string;
  image_url: string;
  author: string;
  published: boolean;
  created_at: string;
};

const CATEGORIES = ["Technology", "Uganda", "Africa", "World", "Business", "Sports", "Buying Guides", "Tips", "Security"];
const emptyForm = {
  title: "",
  type: "news",
  category: "Technology",
  excerpt: "",
  body: "",
  image_url: "",
  author: "Online Tech Uganda",
  published: true,
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
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

  function openEdit(p: Post) {
    setEditing(p.id);
    setForm({
      title: p.title,
      type: p.type || "news",
      category: p.category,
      excerpt: p.excerpt,
      body: p.body,
      image_url: p.image_url,
      author: p.author,
      published: p.published,
    });
    setErr("");
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    let saved = false;
    try {
      const res = editing
        ? await fetch(`/api/posts/${editing}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        saved = true;
      } else {
        const data = await res.json().catch(() => ({} as Record<string, unknown>));
        const detail = data.error || data.detail;
        setErr(
          typeof detail === "string" && detail
            ? detail
            : res.status === 401
              ? "Not authorised — check the admin key in Settings."
              : `Couldn't save (error ${res.status}). Please try again.`,
        );
      }
    } catch {
      setErr("Couldn't reach the server. Check your connection, then try again.");
    } finally {
      setBusy(false);
    }
    // Reload AFTER the try: a hiccup here must never make a successful save look failed.
    if (saved) {
      setShowForm(false);
      await load();
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const input = "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">Blog &amp; Technology News</h1>
          <p className="text-sm text-ink-600/60">{posts.length} post(s). These appear on the storefront blog.</p>
        </div>
        <button onClick={openNew} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">
          + New post
        </button>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          No posts yet. Click “New post” to publish your first article.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-ink-600">{p.title}</p>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">{p.category}</span>
                  {p.published ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Published</span>
                  ) : (
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600/60">Draft</span>
                  )}
                </div>
                <p className="mt-1 max-w-2xl text-sm text-ink-600/70">{p.excerpt}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => openEdit(p)} className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50">Edit</button>
                <button onClick={() => remove(p.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-lg font-extrabold text-ink-600">{editing ? "Edit post" : "New post"}</h3>
            <form onSubmit={save} className="space-y-3">
              <input required placeholder="Title / headline" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={input} />
              <div className="grid grid-cols-3 gap-3">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={input}>
                  <option value="news">📰 News</option>
                  <option value="blog">✍️ Blog</option>
                </select>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={input} />
              </div>
              <input placeholder="Short excerpt / summary (shown on cards)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={input} />
              <textarea placeholder="Body — separate paragraphs with a blank line" rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={input} />
              <input placeholder="Image URL (recommended — shows on the card & headline)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={input} />
              <label className="flex items-center gap-2 text-sm text-ink-600">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published
              </label>
              {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className="flex-1 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                  {busy ? "Saving…" : editing ? "Save changes" : "Publish post"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-ink-600/20 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
