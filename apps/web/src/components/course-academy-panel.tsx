"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, FileText, PlayCircle, Radio, Video } from "lucide-react";
import { academy, whenLabel, type MyAcademy } from "@/lib/academy";

/**
 * The academy, shown on the course page a student is already reading.
 *
 * Someone on a course page wants to know one thing before anything else: is
 * there a class, and can I get in? Making them navigate to a dashboard to
 * find that out is a step that exists for the site's convenience, not theirs.
 *
 * Renders nothing at all for a visitor who isn't signed in or isn't enrolled,
 * so the public course page stays exactly as it was.
 */
export function CourseAcademyPanel({ slug }: { slug: string }) {
  const [data, setData] = useState<MyAcademy | null>(null);

  useEffect(() => {
    let alive = true;
    academy
      .me()
      .then((d) => alive && setData(d))
      .catch(() => {
        /* not signed in — this panel simply isn't for them */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return null;

  const enrolment = data.courses.find((c) => c.course_slug === slug);
  if (!enrolment) return null;

  const classes = data.timetable.filter((c) => c.course_slug === slug);
  const live = classes.filter((c) => c.joinable);
  const next = classes.find((c) => !c.joinable);
  const notes = data.materials.filter((m) => m.course_slug === slug && m.kind !== "recording");
  const recordings = data.materials.filter((m) => m.course_slug === slug && m.kind === "recording");
  const work = data.assignments.filter((a) => a.course_slug === slug);

  return (
    <section className="rounded-card border border-brand-200 bg-brand-50/40 p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-extrabold text-ink-900">Your class</h2>
        <Link href="/academy" className="text-xs font-bold text-brand-600 hover:underline">
          My academy →
        </Link>
      </div>

      {/* The question they came with */}
      {live.length > 0 ? (
        <div className="mt-3 space-y-2">
          {live.map((c) => (
            <div key={c.id} className="rounded-xl bg-green-600 p-3.5 text-white shadow-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide">
                <Radio size={12} className="animate-pulse" />
                {c.status === "live" ? "Live now" : "Room open"}
              </p>
              <p className="mt-1 font-black leading-tight">{c.title}</p>
              <p className="text-[12px] text-white/85">
                {whenLabel(c.starts_at)} · {c.duration_mins} min
              </p>
              <Link
                href={`/academy/class/${c.id}`}
                className="press mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-black text-green-700"
              >
                <Video size={17} /> JOIN LIVE CLASS
              </Link>
            </div>
          ))}
        </div>
      ) : next ? (
        <div className="mt-3 rounded-xl border border-ink-600/10 bg-white p-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-700/50">
            <CalendarDays size={12} /> Next class
          </p>
          <p className="mt-1 font-bold text-ink-900">{next.title}</p>
          <p className="text-[12px] text-ink-700/65">
            {whenLabel(next.starts_at)} · {next.join_note}
          </p>
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-ink-600/15 bg-white p-4 text-center text-sm text-ink-700/55">
          No class scheduled yet.
        </p>
      )}

      {/* Where they've got to */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Fact label="Attendance" value={`${enrolment.attendance.percent}%`} />
        <Fact label="Lessons done" value={String(enrolment.progress.length)} />
        <Fact
          label="Work due"
          value={String(
            work.filter((a) => !data.submissions.some((s) => s.assignment_id === a.id)).length,
          )}
        />
      </div>

      {(notes.length > 0 || recordings.length > 0) && (
        <div className="mt-3 space-y-1.5">
          {notes.slice(0, 3).map((m) => (
            <Resource key={m.id} icon={FileText} title={m.title} url={m.url} />
          ))}
          {recordings.slice(0, 3).map((m) => (
            <Resource key={m.id} icon={PlayCircle} title={m.title} url={m.url} />
          ))}
        </div>
      )}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white px-2 py-2.5 shadow-sm">
      <p className="text-lg font-black text-ink-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-700/55">{label}</p>
    </div>
  );
}

function Resource({
  icon: Icon,
  title,
  url,
}: {
  icon: typeof FileText;
  title: string;
  url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="press flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm shadow-sm hover:text-brand-600"
    >
      <Icon size={14} className="shrink-0 text-brand-500" />
      <span className="min-w-0 flex-1 truncate font-semibold text-ink-800">{title}</span>
      <span className="shrink-0 text-xs font-bold text-brand-600">Open</span>
    </a>
  );
}
