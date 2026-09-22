"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, ThumbsUp, Trash2, ShieldCheck, Users, CornerDownRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { courses } from "@/lib/data";
import { deviceToken } from "@/lib/api";
import { learnerName, setLearnerName } from "@/lib/learning";

type Post = {
  id: number;
  course_slug: string;
  parent_id: number | null;
  author_name: string;
  title: string;
  body: string;
  is_staff: boolean;
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

const courseTitle = (slug: string) =>
  courses.find((c) => c.slug === slug)?.title ?? (slug === "general" ? "General" : slug);

export default function CommunityPage() {
  const [threads, setThreads] = useState<Post[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // New question
  const [name, setName] = useState("");
  const [course, setCourse] = useState("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  // Open thread
  const [open, setOpen] = useState<number | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [reply, setReply] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/_api/discussion?course=${encodeURIComponent(filter)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data)) setThreads(data);
    } catch {
      /* offline — keep whatever we have */
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setName(learnerName());
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 3) return;
    setSending(true);
    setErr("");
    try {
      if (name.trim()) setLearnerName(name.trim());
      const res = await fetch("/_api/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_slug: course,
          title: title.trim(),
          body: body.trim(),
          author_name: name.trim() || "Student",
          device_token: deviceToken(),
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setTitle("");
        setBody("");
        load();
      } else {
        setErr(d?.detail || "Couldn't post that. Please try again.");
      }
    } catch {
      setErr("Network problem — please try again.");
    } finally {
      setSending(false);
    }
  }

  async function openThread(id: number) {
    if (open === id) {
      setOpen(null);
      return;
    }
    setOpen(id);
    setReplies([]);
    try {
      const res = await fetch(`/_api/discussion/${id}`, { cache: "no-store" });
      const d = await res.json();
      if (Array.isArray(d?.replies)) setReplies(d.replies);
    } catch {
      /* ignore */
    }
  }

  async function sendReply(parentId: number) {
    if (reply.trim().length < 3) return;
    try {
      await fetch("/_api/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_id: parentId,
          body: reply.trim(),
          author_name: name.trim() || "Student",
          device_token: deviceToken(),
        }),
      });
      setReply("");
      openThread(parentId);
      setOpen(parentId);
      load();
    } catch {
      /* ignore */
    }
  }

  async function like(id: number) {
    try {
      await fetch(`/_api/discussion/${id}/like`, { method: "POST" });
      load();
      if (open === id) openThread(id);
    } catch {
      /* ignore */
    }
  }

  async function removeOwn(id: number) {
    if (!confirm("Delete your post?")) return;
    try {
      await fetch(`/_api/discussion/${id}?device_token=${encodeURIComponent(deviceToken())}`, {
        method: "DELETE",
      });
      setOpen(null);
      load();
    } catch {
      /* ignore */
    }
  }

  const field =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="container-page py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Learn", href: "/learn" }, { label: "Community" }]} />
      </div>

      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Users size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Student Community</h1>
          <p className="text-sm text-ink-700/70">
            Stuck on something? Ask here — other students and our trainers answer.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        {/* ── Threads ── */}
        <section>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${field} max-w-xs`}>
              <option value="all">All courses</option>
              <option value="general">General</option>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
            <span className="text-sm text-ink-700/55">
              {loading ? "Loading…" : `${threads.length} discussion${threads.length === 1 ? "" : "s"}`}
            </span>
          </div>

          {!loading && threads.length === 0 ? (
            <div className="rounded-card border border-dashed border-ink-600/15 bg-white px-6 py-12 text-center">
              <MessageCircle className="mx-auto text-ink-600/25" size={40} />
              <p className="mt-3 font-bold text-ink-900">No questions here yet</p>
              <p className="mt-1 text-sm text-ink-700/60">
                Be the first to ask — our trainers check in every day.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {threads.map((t) => (
                <li key={t.id} className="overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm">
                  <button onClick={() => openThread(t.id)} className="block w-full p-4 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-ink-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-700/70">
                        {courseTitle(t.course_slug)}
                      </span>
                      <span className="text-[11px] text-ink-700/45">
                        {t.author_name} · {ago(t.created_at)}
                      </span>
                    </div>
                    {t.title && <p className="mt-1.5 font-bold text-ink-900">{t.title}</p>}
                    <p className="mt-1 line-clamp-2 text-sm text-ink-700/75">{t.body}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-ink-700/55">
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle size={13} /> {t.replies ?? 0}{" "}
                        {t.replies === 1 ? "reply" : "replies"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp size={13} /> {t.likes}
                      </span>
                    </div>
                  </button>

                  {open === t.id && (
                    <div className="border-t border-ink-600/10 bg-ink-50/40 p-4">
                      {replies.length > 0 && (
                        <ul className="mb-3 space-y-2.5">
                          {replies.map((r) => (
                            <li key={r.id} className="flex gap-2">
                              <CornerDownRight size={14} className="mt-1 shrink-0 text-ink-600/30" />
                              <div className="min-w-0 flex-1 rounded-md bg-white p-3 shadow-sm">
                                <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-700/55">
                                  <b className="text-ink-800">{r.author_name}</b>
                                  {r.is_staff && (
                                    <span className="inline-flex items-center gap-0.5 rounded bg-green-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-green-700">
                                      <ShieldCheck size={9} /> Trainer
                                    </span>
                                  )}
                                  · {ago(r.created_at)}
                                </p>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700/85">{r.body}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex gap-2">
                        <input
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Write a reply…"
                          className={field}
                        />
                        <button
                          onClick={() => sendReply(t.id)}
                          className="press shrink-0 rounded-md bg-brand-500 px-4 text-sm font-bold text-white hover:bg-brand-600"
                        >
                          <Send size={15} />
                        </button>
                      </div>

                      <div className="mt-2 flex gap-3 text-xs font-semibold">
                        <button onClick={() => like(t.id)} className="text-ink-700/60 hover:text-brand-600">
                          <ThumbsUp size={13} className="inline" /> Helpful
                        </button>
                        <button onClick={() => removeOwn(t.id)} className="text-ink-700/45 hover:text-red-600">
                          <Trash2 size={13} className="inline" /> Delete mine
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Ask ── */}
        <aside className="h-fit rounded-card border border-ink-600/10 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-extrabold text-ink-900">Ask a question</h2>
          <form onSubmit={ask} className="mt-3 space-y-2.5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={field}
            />
            <select value={course} onChange={(e) => setCourse(e.target.value)} className={field}>
              <option value="general">General question</option>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short title"
              className={field}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Describe what you're stuck on…"
              className={field}
            />
            {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
            <button
              type="submit"
              disabled={sending}
              className="press w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {sending ? "Posting…" : "Post question"}
            </button>
          </form>

          <p className="mt-3 border-t border-ink-600/10 pt-3 text-xs text-ink-700/55">
            Be kind and keep it about learning. Posts are moderated.
          </p>
          <Link href="/learn" className="mt-2 block text-xs font-bold text-brand-600 hover:underline">
            ← Back to courses
          </Link>
        </aside>
      </div>
    </div>
  );
}
