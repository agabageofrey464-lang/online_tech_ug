"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  Megaphone,
  Paperclip,
  PlayCircle,
  Radio,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/page-header";
import { FilePicker } from "@/components/file-picker";
import { courses } from "@/lib/data";
import { academy, countdown, whenLabel, type MyAcademy } from "@/lib/academy";

/**
 * The student's academy.
 *
 * Built around the one thing a student opens it for: is there a class, and
 * can I get in? That sits at the top, big enough to hit with a thumb. The
 * rest — courses, coursework, notes, attendance — is underneath.
 */

const courseTitle = (slug: string) =>
  courses.find((c) => c.slug === slug)?.title ?? slug.replace(/-/g, " ");

const lessonCount = (slug: string) => courses.find((c) => c.slug === slug)?.lessons ?? 0;

type Tab = "overview" | "courses" | "timetable" | "work" | "notes";

const TABS: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "timetable", label: "Timetable", icon: CalendarDays },
  { id: "work", label: "Coursework", icon: ClipboardList },
  { id: "notes", label: "Notes", icon: FileText },
];

export default function AcademyPage() {
  const [data, setData] = useState<MyAcademy | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  const load = useCallback(async () => {
    try {
      setData(await academy.me());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your academy.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // A class that becomes joinable while the page is open should say so without
  // the student reloading to find out.
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) {
    return (
      <div className="container-page py-14 text-center text-sm text-ink-700/60">
        Loading your academy…
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-14">
        <div className="mx-auto max-w-md rounded-card border border-ink-600/10 bg-white p-7 text-center shadow-sm">
          <GraduationCap className="mx-auto text-brand-500" size={34} />
          <h1 className="mt-3 text-lg font-extrabold text-ink-900">Sign in to your academy</h1>
          <p className="mt-1.5 text-sm text-ink-700/65">{error}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/login?next=/academy"
              className="press rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
            >
              Sign in
            </Link>
            <Link
              href="/learn"
              className="press rounded-lg border border-ink-600/20 px-5 py-2.5 text-sm font-bold text-ink-700 hover:bg-ink-50"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const live = data.timetable.filter((c) => c.joinable);
  const next = data.timetable.find((c) => !c.joinable);
  const pendingWork = data.assignments.filter(
    (a) => !data.submissions.some((s) => s.assignment_id === a.id),
  );
  const recordings = data.materials.filter((m) => m.kind === "recording");
  const notes = data.materials.filter((m) => m.kind !== "recording");

  return (
    <>
    <PageHeader
      eyebrow="My Academy"
      title={`Hello, ${data.user.name.split(" ")[0] || "there"}`}
      subtitle={`${data.courses.length} course${data.courses.length === 1 ? "" : "s"} · ${data.user.role}`}
      image="/web/photo-1516321318423-f06f85e504b3.webp"
      crumbs={[{ label: "My Academy" }]}
    >
      <Link href="/learn" className="press bg-white px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-white/90">
        Browse courses
      </Link>
      {(data.user.role === "lecturer" || data.user.role === "admin") && (
        <Link
          href="/academy/teach"
          className="press inline-flex items-center gap-2 border border-white px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-ink-900"
        >
          <Users size={15} /> Lecturer dashboard
        </Link>
      )}
    </PageHeader>
    <div className="container-page py-6">

      {/* ── The reason this page exists ── */}
      {live.length > 0 ? (
        <section className="space-y-2.5">
          {live.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-xl bg-green-600 p-4 text-white shadow-md ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide">
                  <Radio size={12} className="animate-pulse" />
                  {c.status === "live" ? "Live now" : "Room open"}
                </span>
                <span className="text-[12px] text-white/85">{courseTitle(c.course_slug)}</span>
              </div>
              <p className="mt-2 text-lg font-black leading-tight">{c.title}</p>
              <p className="text-[13px] text-white/85">
                {c.lecturer_name ? `${c.lecturer_name} · ` : ""}
                {whenLabel(c.starts_at)} · {c.duration_mins} min
              </p>
              <Link
                href={`/academy/class/${c.id}`}
                className="press mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3.5 text-base font-black text-green-700 shadow-sm"
              >
                <Video size={19} /> JOIN LIVE CLASS
              </Link>
            </div>
          ))}
        </section>
      ) : next ? (
        <section className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-700/50">
            Your next class
          </p>
          <p className="mt-1 text-base font-extrabold text-ink-900">{next.title}</p>
          <p className="text-[13px] text-ink-700/65">
            {courseTitle(next.course_slug)} · {whenLabel(next.starts_at)}
          </p>
          <p className="mt-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-[12px] font-bold text-brand-700">
            Starts {countdown(next.starts_at)} · {next.join_note}
          </p>
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-ink-600/20 bg-white p-6 text-center shadow-sm">
          <CalendarDays className="mx-auto text-ink-600/25" size={30} />
          <p className="mt-2 font-bold text-ink-900">No classes scheduled</p>
          <p className="mt-1 text-sm text-ink-700/60">
            Your lecturer will schedule one and it appears here.
          </p>
        </section>
      )}

      {/* Announcements worth interrupting for */}
      {data.announcements.slice(0, 2).map((a) => (
        <div
          key={a.id}
          className={`mt-2.5 rounded-lg border p-3.5 ${
            a.kind === "urgent"
              ? "border-gold-200 bg-gold-50"
              : "border-ink-600/10 bg-white shadow-sm"
          }`}
        >
          <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink-900">
            <Megaphone size={14} className="text-brand-500" /> {a.title}
          </p>
          {a.body && <p className="mt-1 text-[13px] text-ink-700/75">{a.body}</p>}
        </div>
      ))}

      {/* Nobody arrives here by accident, so say plainly why it is empty. */}
      {data.courses.length === 0 && (
        <div className="mt-3 rounded-card border border-brand-200 bg-white p-6 text-center shadow-sm">
          <GraduationCap className="mx-auto text-brand-500" size={34} />
          <p className="mt-2 text-base font-extrabold text-ink-900">
            You&apos;re not on a course yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-700/70">
            Once you register for a course and we confirm your payment, your classes,
            timetable, notes and assignments all appear here.
          </p>
          <Link
            href="/learn"
            className="press mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            <BookOpen size={15} /> Browse our courses
          </Link>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="sticky top-0 z-20 -mx-1 mt-4 flex gap-2 overflow-x-auto bg-[#f9f7f2]/95 px-1 py-2 no-scrollbar backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`press flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold shadow-sm transition ${
              tab === t.id ? "bg-brand-500 text-white" : "bg-white text-ink-700"
            }`}
          >
            <t.icon size={14} /> {t.label}
            {t.id === "work" && pendingWork.length > 0 && (
              <span
                className={`rounded-full px-1.5 text-[10px] ${
                  tab === t.id ? "bg-white/25" : "bg-brand-50 text-brand-600"
                }`}
              >
                {pendingWork.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {tab === "overview" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={BookOpen} label="Courses" value={String(data.courses.length)} />
            <Stat
              icon={TrendingUp}
              label="Average progress"
              value={`${
                data.courses.length
                  ? Math.round(
                      data.courses.reduce(
                        (n, c) =>
                          n + pct(c.progress.length, lessonCount(c.course_slug)),
                        0,
                      ) / data.courses.length,
                    )
                  : 0
              }%`}
            />
            <Stat
              icon={Users}
              label="Attendance"
              value={`${
                data.courses.length
                  ? Math.round(
                      data.courses.reduce((n, c) => n + c.attendance.percent, 0) /
                        data.courses.length,
                    )
                  : 0
              }%`}
            />
            <Stat icon={ClipboardList} label="Work due" value={String(pendingWork.length)} />
          </div>
        )}

        {tab === "courses" && (
          <ul className="space-y-2.5">
            {data.courses.length === 0 && <Empty text="You aren't enrolled on a course yet." />}
            {data.courses.map((c) => {
              const total = lessonCount(c.course_slug);
              const p = pct(c.progress.length, total);
              return (
                <li key={c.id} className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-extrabold text-ink-900">{courseTitle(c.course_slug)}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                        c.status === "active"
                          ? "bg-green-100 text-green-700"
                          : c.status === "completed"
                            ? "bg-brand-50 text-brand-700"
                            : "bg-gold-100 text-gold-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-ink-50">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[12px] text-ink-700/60">
                    {c.progress.length} of {total || "—"} lessons · attendance{" "}
                    {c.attendance.attended}/{c.attendance.held} ({c.attendance.percent}%)
                    {c.quiz ? ` · quiz ${c.quiz.score}/${c.quiz.total}` : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/learn/${c.course_slug}`}
                      className="press rounded-md bg-brand-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-600"
                    >
                      Open course
                    </Link>
                    {c.status === "completed" && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                        <Award size={13} /> Certificate ready — ask us to print it
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {tab === "timetable" && (
          <ul className="space-y-2.5">
            {data.timetable.length === 0 && <Empty text="Nothing scheduled yet." />}
            {data.timetable.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-600/10 bg-white p-3.5 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-700/50">
                    {courseTitle(c.course_slug)}
                  </p>
                  <p className="truncate font-bold text-ink-900">{c.title}</p>
                  <p className="text-[12px] text-ink-700/60">
                    {whenLabel(c.starts_at)} · {c.duration_mins} min
                    {c.lecturer_name ? ` · ${c.lecturer_name}` : ""}
                  </p>
                </div>
                {c.joinable ? (
                  <Link
                    href={`/academy/class/${c.id}`}
                    className="press shrink-0 rounded-lg bg-green-600 px-4 py-2.5 text-xs font-black text-white"
                  >
                    JOIN
                  </Link>
                ) : (
                  <span className="shrink-0 text-[11px] font-semibold text-ink-700/50">
                    {c.join_note}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {tab === "work" && (
          <ul className="space-y-2.5">
            {data.assignments.length === 0 && <Empty text="No assignments set." />}
            {data.assignments.map((a) => {
              const mine = data.submissions.find((s) => s.assignment_id === a.id);
              return (
                <li key={a.id} className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-extrabold text-ink-900">{a.title}</p>
                    {mine?.marked ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                        {mine.score}/{a.max_score}
                      </span>
                    ) : mine ? (
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                        Submitted
                      </span>
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          a.overdue ? "bg-red-100 text-red-700" : "bg-gold-100 text-gold-700"
                        }`}
                      >
                        {a.overdue ? "Overdue" : "To do"}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-ink-700/60">
                    {courseTitle(a.course_slug)}
                    {a.due_at ? ` · due ${whenLabel(a.due_at)}` : ""}
                  </p>
                  {a.brief && <p className="mt-2 text-sm text-ink-700/75">{a.brief}</p>}
                  {a.attachment && <Attachment url={a.attachment} label="Assignment brief" />}
                  {mine?.attachment && <Attachment url={mine.attachment} label="Your submitted file" />}
                  {mine?.feedback && (
                    <p className="mt-2 rounded-lg bg-ink-50 px-3 py-2 text-[13px] text-ink-700/80">
                      <b>Feedback:</b> {mine.feedback}
                    </p>
                  )}
                  {!mine && <SubmitBox assignmentId={a.id} onDone={load} />}
                </li>
              );
            })}
          </ul>
        )}

        {tab === "notes" && (
          <div className="space-y-4">
            <Materials title="Lesson notes" icon={FileText} items={notes} />
            <Materials title="Recorded lessons" icon={PlayCircle} items={recordings} />
          </div>
        )}
      </div>
    </div>
    </>
  );
}

const pct = (done: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon size={17} />
      </span>
      <p className="mt-2 text-2xl font-black text-ink-900">{value}</p>
      <p className="text-[12px] font-semibold text-ink-700/60">{label}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <li className="rounded-xl border border-dashed border-ink-600/20 bg-white p-8 text-center text-sm text-ink-700/55 shadow-sm">
      {text}
    </li>
  );
}

function Materials({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof FileText;
  items: { id: number; title: string; url: string; course_slug: string }[];
}) {
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-ink-900">
        <Icon size={15} className="text-brand-500" /> {title}
      </h2>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-600/20 bg-white p-6 text-center text-sm text-ink-700/55">
          Nothing here yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((m) => (
            <li key={m.id}>
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="press flex items-center justify-between gap-3 rounded-lg border border-ink-600/10 bg-white px-3.5 py-3 text-sm shadow-sm hover:border-brand-400"
              >
                <span className="min-w-0">
                  <span className="block truncate font-bold text-ink-900">{m.title}</span>
                  <span className="block text-[11px] text-ink-700/55">{m.course_slug}</span>
                </span>
                <span className="shrink-0 text-xs font-bold text-brand-600">Open →</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Attachment({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-[13px] font-semibold text-ink-800 hover:text-brand-600"
    >
      <Paperclip size={13} className="shrink-0 text-brand-500" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="shrink-0 text-xs font-bold text-brand-600">Open</span>
    </a>
  );
}

function SubmitBox({ assignmentId, onDone }: { assignmentId: number; onDone: () => void }) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send() {
    // A file on its own is a perfectly good answer — don't demand prose too.
    if (text.trim().length < 2 && !attachment) return setErr("Write your answer or attach a file.");
    setBusy(true);
    setErr("");
    try {
      await academy.submit(assignmentId, text, attachment);
      setText("");
      setAttachment("");
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't submit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Type your answer, or attach your work below…"
        className="w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
      />
      <FilePicker onDone={(url) => setAttachment(url)} label="Attach your work" />
      {err && <p className="mt-1 text-xs font-semibold text-red-600">{err}</p>}
      <button
        onClick={send}
        disabled={busy}
        className="press mt-2 rounded-lg bg-brand-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {busy ? "Sending…" : "Submit work"}
      </button>
    </div>
  );
}
