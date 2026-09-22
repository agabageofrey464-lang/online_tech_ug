"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Community moderation.
 *
 * Shows every post including hidden ones, lets the owner answer as a trainer
 * (replies sent from here are flagged official), and hide or restore anything.
 */

type Post = {
  id: number;
  course_slug: string;
  parent_id: number | null;
  author_name: string;
  author_email?: string;
  title: string;
  body: string;
  is_staff: boolean;
  hidden?: boolean;
  likes: number;
  replies?: number;
  created_at: string;
};

const ago = (iso: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export default function CommunityAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<{ total: number; hidden: number; threads: number } | null>(null);
  const [view, setView] = useState<"all" | "threads" | "hidden">("all");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([
        fetch("/api/community", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/community/stats", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (Array.isArray(p)) setPosts(p);
      if (s && typeof s.total === "number") setStats(s);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleHide(id: number, hidden: boolean) {
    setBusy(true);
    try {
      await fetch(`/api/community/${id}/hide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden }),
      });
      setMsg(hidden ? "Post hidden from the site." : "Post restored.");
      load();
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(""), 2500);
    }
  }

  async function sendReply(parentId: number) {
    if (reply.trim().length < 3) return;
    setBusy(true);
    try {
      const res = await fetch("/api/community/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: parentId, body: reply.trim() }),
      });
      if (res.ok) {
        setReply("");
        setReplyTo(null);
        setMsg("Answer posted — it shows as an official trainer reply.");
        load();
      } else {
        const d = await res.json().catch(() => ({}));
        setMsg(d?.detail || "Couldn't post that reply.");
      }
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(""), 3000);
    }
  }

  const shown = posts.filter((p) => {
    if (view === "threads") return p.parent_id === null && !p.hidden;
    if (view === "hidden") return p.hidden;
    return true;
  });

  // Threads with no reply yet — the ones actually waiting on you.
  const answered = new Set(posts.filter((p) => p.parent_id !== null && !p.hidden).map((p) => p.parent_id));
  const waiting = posts.filter((p) => p.parent_id === null && !p.hidden && !answered.has(p.id)).length;

  const cards = [
    { label: "Total posts", value: stats?.total ?? 0, icon: "💬" },
    { label: "Discussions", value: stats?.threads ?? 0, icon: "🧵" },
    { label: "Awaiting an answer", value: waiting, icon: "⏳" },
    { label: "Hidden", value: stats?.hidden ?? 0, icon: "🚫" },
  ];

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Student Community</h1>
        <p className="text-sm text-ink-600/60">
          Answer questions as a trainer, and hide anything that doesn&apos;t belong.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="min-w-0 rounded-2xl border border-ink-600/10 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs text-ink-600/60">
              <span>{c.icon}</span> {c.label}
            </p>
            <p
              className={`mt-1.5 text-2xl font-extrabold tabular-nums ${
                c.label === "Awaiting an answer" && c.value > 0 ? "text-brand-600" : "text-ink-600"
              }`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["all", "threads", "hidden"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
              view === v
                ? "bg-brand-500 text-white"
                : "border border-ink-600/15 bg-white text-ink-600 hover:border-brand-400"
            }`}
          >
            {v === "all" ? "Everything" : v === "threads" ? "Questions" : "Hidden"}
          </button>
        ))}
        <button onClick={load} className="ml-auto text-xs font-bold text-brand-600 hover:underline">
          Refresh
        </button>
      </div>

      {msg && (
        <p className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">{msg}</p>
      )}

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/15 bg-white p-10 text-center">
          <p className="font-bold text-ink-600">Nothing here</p>
          <p className="mt-1 text-sm text-ink-600/60">
            Student questions from the website appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((p) => (
            <li
              key={p.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm ${
                p.hidden ? "border-red-200 opacity-70" : "border-ink-600/10"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded bg-ink-50 px-2 py-0.5 font-bold uppercase tracking-wide text-ink-600/70">
                  {p.course_slug}
                </span>
                {p.parent_id === null ? (
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700">Question</span>
                ) : (
                  <span className="rounded bg-ink-50 px-2 py-0.5 font-bold text-ink-600/70">Reply</span>
                )}
                {p.is_staff && (
                  <span className="rounded bg-green-100 px-2 py-0.5 font-bold text-green-700">Trainer</span>
                )}
                {p.hidden && (
                  <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-700">Hidden</span>
                )}
                <span className="text-ink-600/45">
                  {p.author_name}
                  {p.author_email ? ` · ${p.author_email}` : ""} · {ago(p.created_at)}
                </span>
              </div>

              {p.title && <p className="mt-1.5 font-bold text-ink-800">{p.title}</p>}
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-600/85">{p.body}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {p.parent_id === null && !p.hidden && (
                  <button
                    onClick={() => {
                      setReplyTo(replyTo === p.id ? null : p.id);
                      setReply("");
                    }}
                    className="rounded-md bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600"
                  >
                    ✍️ Answer as trainer
                  </button>
                )}
                <button
                  onClick={() => toggleHide(p.id, !p.hidden)}
                  disabled={busy}
                  className="rounded-md border border-ink-600/20 px-4 py-2 text-xs font-bold text-ink-600 hover:bg-ink-50 disabled:opacity-50"
                >
                  {p.hidden ? "↩️ Restore" : "🚫 Hide"}
                </button>
              </div>

              {replyTo === p.id && (
                <div className="mt-3 border-t border-ink-600/10 pt-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder="Write the official answer…"
                    className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    onClick={() => sendReply(p.id)}
                    disabled={busy || reply.trim().length < 3}
                    className="mt-2 rounded-md bg-brand-500 px-5 py-2 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {busy ? "Posting…" : "Post answer"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
