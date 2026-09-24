"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ClipboardList, Radio, Users, Video } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TeachCoursework } from "@/components/teach-coursework";
import { courses } from "@/lib/data";
import { academy, whenLabel, type LiveClass } from "@/lib/academy";

/**
 * The lecturer's dashboard.
 *
 * Scheduling a class and getting into it are the two things that have to be
 * quick — everything else can wait a tap. The register is read from the room
 * itself, so a lecturer never marks attendance by hand unless they want to
 * correct it.
 */

const courseTitle = (slug: string) =>
  courses.find((c) => c.slug === slug)?.title ?? slug.replace(/-/g, " ");

/** A datetime-local value for an hour from now, rounded to the next half hour. */
function defaultStart(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() > 30 ? 60 : 30, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TeachPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [who, setWho] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [course, setCourse] = useState(courses[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [startsAt, setStartsAt] = useState(defaultStart);
  const [mins, setMins] = useState(60);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [tab, setTab] = useState<"classes" | "coursework">("classes");

  const [openRegister, setOpenRegister] = useState<number | null>(null);
  const [register, setRegister] = useState<
    { id: number; name: string; minutes: number; status: string; in_room: boolean }[]
  >([]);

  const load = useCallback(async () => {
    try {
      const d = await academy.teaching();
      setClasses(d.classes);
      setWho(d.user.name);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your classes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function schedule(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setMsg("Give the class a title.");
    setBusy(true);
    setMsg("");
    try {
      await academy.scheduleClass({
        course_slug: course,
        title: title.trim(),
        topic: topic.trim(),
        // The picker gives local time; the server keeps everything in UTC.
        starts_at: new Date(startsAt).toISOString(),
        duration_mins: mins,
      });
      setTitle("");
      setTopic("");
      setMsg("✓ Class scheduled — your students can see it now.");
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Couldn't schedule that.");
    } finally {
      setBusy(false);
    }
  }

  async function showRegister(id: number) {
    setOpenRegister(openRegister === id ? null : id);
    if (openRegister !== id) {
      try {
        setRegister(await academy.register(id));
      } catch {
        setRegister([]);
      }
    }
  }

  if (loading) {
    return <div className="container-page py-14 text-center text-sm text-ink-700/60">Loading…</div>;
  }

  if (error) {
    return (
      <div className="container-page py-14">
        <div className="mx-auto max-w-md rounded-card border border-ink-600/10 bg-white p-7 text-center shadow-sm">
          <Users className="mx-auto text-brand-500" size={32} />
          <h1 className="mt-3 text-lg font-extrabold text-ink-900">Lecturers only</h1>
          <p className="mt-1.5 text-sm text-ink-700/65">{error}</p>
          <Link
            href="/academy"
            className="press mt-5 inline-block rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            Back to my academy
          </Link>
        </div>
      </div>
    );
  }

  const input =
    "mt-1 w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="container-page py-4">
      <div className="mb-3">
        <Breadcrumbs items={[{ label: "My Academy", href: "/academy" }, { label: "Teaching" }]} />
      </div>

      <header className="mb-4">
        <h1 className="text-2xl font-black text-ink-900">Teaching</h1>
        <p className="text-sm text-ink-700/65">{who} · classes, the register and coursework</p>
      </header>

      <div className="mb-4 flex gap-1.5 overflow-x-auto border-b border-ink-600/10 pb-px">
        {([
          ["classes", "Classes"],
          ["coursework", "Coursework"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              tab === k
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-ink-700/55 hover:text-ink-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "coursework" && <TeachCoursework />}

      <div className={`grid gap-4 lg:grid-cols-[1fr_340px] ${tab === "classes" ? "" : "hidden"}`}>
        {/* Classes */}
        <section className="space-y-2.5">
          {classes.length === 0 && (
            <p className="rounded-xl border border-dashed border-ink-600/20 bg-white p-8 text-center text-sm text-ink-700/55">
              No classes yet. Schedule your first one.
            </p>
          )}
          {classes.map((c) => (
            <div key={c.id} className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                    c.status === "live"
                      ? "bg-green-100 text-green-700"
                      : c.status === "ended"
                        ? "bg-ink-100 text-ink-600/70"
                        : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {c.status === "live" ? "● Live" : c.status}
                </span>
                <span className="text-[12px] text-ink-700/60">{courseTitle(c.course_slug)}</span>
              </div>
              <p className="mt-1.5 font-extrabold text-ink-900">{c.title}</p>
              <p className="text-[12.5px] text-ink-700/60">
                {whenLabel(c.starts_at)} · {c.duration_mins} min · {c.attendees} attended
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/academy/class/${c.id}`}
                  className="press inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2.5 text-xs font-black text-white"
                >
                  <Video size={14} /> {c.status === "live" ? "REJOIN" : "START CLASS"}
                </Link>
                <button
                  onClick={() => showRegister(c.id)}
                  className="press rounded-lg border border-ink-600/20 px-3.5 py-2.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
                >
                  {openRegister === c.id ? "Hide register" : "Register"}
                </button>
                {c.status === "live" && (
                  <button
                    onClick={async () => {
                      await academy.endClass(c.id);
                      load();
                    }}
                    className="press rounded-lg border border-red-200 px-3.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    End class
                  </button>
                )}
              </div>

              {openRegister === c.id && (
                <div className="mt-3 border-t border-ink-600/10 pt-3">
                  {register.length === 0 ? (
                    <p className="text-sm text-ink-700/55">Nobody has joined yet.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {register.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate text-ink-800">
                            {r.in_room && (
                              <Radio size={11} className="mr-1 inline animate-pulse text-green-600" />
                            )}
                            {r.name}
                          </span>
                          <span className="shrink-0 text-[12px] text-ink-700/55">
                            {r.minutes > 0 ? `${r.minutes} min · ` : ""}
                            <span className="capitalize">{r.status}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Schedule */}
        <section className="h-fit rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm lg:sticky lg:top-4">
          <h2 className="flex items-center gap-2 font-extrabold text-ink-900">
            <CalendarPlus size={17} className="text-brand-500" /> Schedule a class
          </h2>

          <form onSubmit={schedule} className="mt-3">
            <label className="block text-sm font-semibold text-ink-700">Course</label>
            <select value={course} onChange={(e) => setCourse(e.target.value)} className={input}>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>

            <label className="mt-3 block text-sm font-semibold text-ink-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Layout basics"
              className={input}
            />

            <label className="mt-3 block text-sm font-semibold text-ink-700">What you'll cover</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
              placeholder="Optional"
              className={input}
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold text-ink-700">Starts</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className={input}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700">Minutes</label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={mins}
                  onChange={(e) => setMins(Number(e.target.value) || 60)}
                  className={input}
                />
              </div>
            </div>

            <button
              disabled={busy}
              className="press mt-4 w-full rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Scheduling…" : "Schedule class"}
            </button>
            {msg && <p className="mt-2 text-xs font-semibold text-ink-700">{msg}</p>}
          </form>

          <p className="mt-4 border-t border-ink-600/10 pt-3 text-[11.5px] leading-relaxed text-ink-600/60">
            <ClipboardList size={12} className="mr-1 inline" />
            The room opens 15 minutes before the start. Students on the course see it on their
            academy page, and attendance is taken from who actually joins.
          </p>
        </section>
      </div>
    </div>
  );
}
