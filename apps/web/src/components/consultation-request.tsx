"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { academy } from "@/lib/academy";

/**
 * "I need a word with my lecturer" — a student asks for a private session.
 *
 * It is a room for the two of them: nobody else on the course sees it on the
 * timetable or may enter it. The student says what it is about and when
 * would suit; a lecturer confirms the time, or moves it.
 */

function soon(): string {
  const d = new Date(Date.now() + 24 * 3600 * 1000);
  d.setMinutes(0, 0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function ConsultationRequest({ courses, onDone }: { courses: { slug: string; title: string }[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState(courses[0]?.slug ?? "");
  const [topic, setTopic] = useState("");
  const [when, setWhen] = useState(soon);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (courses.length === 0) return null;
  const input = "mt-1 w-full min-w-0 rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await academy.askConsultation({ course_slug: course, topic: topic.trim(), preferred_at: new Date(when).toISOString() });
      setTopic("");
      setOpen(false);
      setMsg("✓ Request sent. It shows on your timetable as waiting until a lecturer confirms the time.");
      onDone();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Your request could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-800 text-white">
          <UserRound size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-ink-900">Private consultation</p>
          <p className="text-[12.5px] text-ink-700/65">Thirty minutes alone with a lecturer, in a room only the two of you can enter.</p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="press shrink-0 rounded-lg bg-brand-500 px-4 py-2.5 text-xs font-black text-white hover:bg-brand-600">
          {open ? "Close" : "Ask for one"}
        </button>
      </div>

      {open && (
        <form onSubmit={send} className="mt-3 grid gap-3 border-t border-ink-600/10 pt-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-ink-800">
            Course
            <select value={course} onChange={(e) => setCourse(e.target.value)} className={input}>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-800">
            When would suit you
            <input type="datetime-local" required value={when} onChange={(e) => setWhen(e.target.value)} className={input} />
          </label>
          <label className="text-xs font-bold text-ink-800 sm:col-span-2">
            What you would like help with
            <textarea required minLength={3} rows={2} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. I am stuck on my project's login page" className={input} />
          </label>
          <button type="submit" disabled={busy} className="press rounded-lg bg-brand-500 px-5 py-3 text-sm font-black text-white hover:bg-brand-600 disabled:opacity-60 sm:col-span-2 sm:w-fit">
            {busy ? "Sending…" : "Send my request"}
          </button>
        </form>
      )}
      {msg && <p className="mt-2 text-sm font-semibold text-ink-800">{msg}</p>}
    </div>
  );
}
