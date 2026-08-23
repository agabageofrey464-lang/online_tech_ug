"use client";

import { useEffect, useState } from "react";
import { Lock, Clock, Play, X, Check } from "lucide-react";
import { lessonPrice, type Course, type Lesson } from "@/lib/data";
import { ugx, whatsappLink, site } from "@/lib/site";
import { doneLessons, toggleLesson, isUnlocked, lessonUnlocks, applyCourseCode, markUnlocked } from "@/lib/learning";
import { verifyUnlockCode } from "@/lib/api";

export function LessonList({ course }: { course: Course }) {
  const { slug, title: courseTitle, syllabus } = course;
  const [playing, setPlaying] = useState<{ title: string; video?: string; youtube?: string } | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [full, setFull] = useState(false); // whole course unlocked
  const [openSet, setOpenSet] = useState<number[]>([]); // individually unlocked lesson idxs
  const [target, setTarget] = useState<number | null>(null); // lesson the unlock modal is for
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [checking, setChecking] = useState(false);

  function refresh() {
    setDone(doneLessons(slug));
    setFull(isUnlocked(slug));
    setOpenSet(lessonUnlocks(slug));
  }
  useEffect(refresh, [slug]);

  function mark(idx: number, value: boolean) {
    toggleLesson(slug, idx, value);
    setDone(doneLessons(slug));
  }

  const canWatch = (i: number, free: boolean) => free || full || openSet.includes(i);

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    const entered = code.trim();
    if (!entered) return;
    setChecking(true);
    setErr("");
    setOkMsg("");
    try {
      // Client-side, deterministic: base code unlocks the course, CODE-<n> unlocks lesson n.
      const result = applyCourseCode(slug, entered, course.unlockCode || "");
      if (result === "course") {
        setFull(true);
        setOkMsg("Whole course unlocked! Enjoy all lessons.");
        finishUnlock();
        return;
      }
      if (typeof result === "number") {
        setOpenSet(lessonUnlocks(slug));
        setOkMsg(`Lesson ${result + 1} unlocked!`);
        finishUnlock();
        return;
      }
      // Fallback: a per-payment course code issued by the backend (unlocks the course).
      let ok = false;
      try {
        ok = await verifyUnlockCode(slug, entered);
      } catch {
        /* API unreachable — treated as invalid below */
      }
      if (ok) {
        markUnlocked(slug);
        setFull(true);
        setOkMsg("Whole course unlocked! Enjoy all lessons.");
        finishUnlock();
        return;
      }
      setErr("That code isn't correct. Check the code we sent you on WhatsApp.");
    } finally {
      setChecking(false);
    }
  }

  function finishUnlock() {
    setCode("");
    setTimeout(() => {
      setTarget(null);
      setOkMsg("");
    }, 1200);
  }

  const targetLesson = target !== null ? syllabus[target] : null;
  const targetPrice = targetLesson ? lessonPrice(targetLesson.minutes) : 0;

  return (
    <>
      <ul className="mt-3 divide-y divide-ink-600/5 overflow-hidden rounded-card border border-ink-600/10 bg-white">
        {syllabus.map((lesson: Lesson, i) => {
          const price = lessonPrice(lesson.minutes);
          const free = !!lesson.free;
          const watchable = canWatch(i, free);
          const isDone = done.includes(i);
          return (
            <li key={lesson.title} className={`flex items-start gap-3 p-3.5 transition sm:items-center sm:p-4 ${isDone ? "bg-green-50/40" : "hover:bg-ink-50/50"}`}>
              <button
                onClick={() => mark(i, !isDone)}
                title={isDone ? "Mark as not done" : "Mark as completed"}
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition sm:mt-0 ${
                  isDone ? "bg-green-600 text-white" : free ? "bg-green-100 text-green-700" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                }`}
              >
                {isDone ? <Check size={16} /> : i + 1}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-ink-800">
                  {lesson.title}
                  {free && <span className="ml-2 align-middle rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-green-700">Free</span>}
                  {!free && watchable && <span className="ml-2 align-middle rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-700">Unlocked</span>}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-700/60">
                  <Clock size={12} /> {lesson.minutes} min
                </p>
              </div>

              {watchable ? (
                <button
                  onClick={() => {
                    setPlaying({ title: lesson.title, video: lesson.preview || course.sampleVideo, youtube: lesson.youtube });
                    mark(i, true);
                  }}
                  className="flex shrink-0 items-center gap-1.5 self-center rounded-md bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700"
                >
                  <Play size={13} /> Watch{free ? " free" : ""}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setTarget(i);
                    setErr("");
                    setOkMsg("");
                  }}
                  className="flex shrink-0 items-center gap-1.5 self-center rounded-md bg-brand-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-600"
                >
                  <Lock size={13} /> {ugx(price)}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Player */}
      {playing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setPlaying(null)}>
          <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25" onClick={() => setPlaying(null)} aria-label="Close">
            <X size={20} />
          </button>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {playing.youtube ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playing.youtube}?autoplay=1&rel=0`}
                  title={playing.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : playing.video ? (
              <video src={playing.video} controls autoPlay playsInline className="w-full rounded-lg bg-black" />
            ) : (
              <div className="rounded-lg bg-ink-800 p-10 text-center text-white">Lesson video coming soon.</div>
            )}
            <p className="mt-3 text-center text-sm font-semibold text-white">{playing.title}</p>
          </div>
        </div>
      )}

      {/* Unlock modal — pay per lesson (or the whole course), then enter the code */}
      {target !== null && targetLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-lg font-extrabold text-ink-600">Unlock this lesson</h3>
              <button onClick={() => setTarget(null)} aria-label="Close" className="text-ink-600/50 hover:text-ink-600">
                <X size={20} />
              </button>
            </div>

            <div className="rounded-lg bg-brand-50 p-3">
              <p className="text-sm font-bold text-ink-900">Lesson {target + 1}: {targetLesson.title}</p>
              <p className="mt-0.5 text-sm text-ink-700/70">Price: <b className="text-brand-600">{ugx(targetPrice)}</b> · or unlock the <b>whole course</b> for {ugx(course.price)}.</p>
            </div>

            <ol className="mt-3 space-y-2 text-sm text-ink-700/80">
              <li><b>1.</b> Pay via Mobile Money to <b className="text-ink-800">{site.phoneDisplay}</b> (Airtel) or {site.phoneAlt}.</li>
              <li><b>2.</b> Send the confirmation on WhatsApp — we&apos;ll reply with your <b>unlock code</b>.</li>
              <li><b>3.</b> Enter it below to unlock this lesson (or all lessons).</li>
            </ol>
            <a
              href={whatsappLink(`Hi, I'd like to pay for "${courseTitle}" — Lesson ${target + 1}: ${targetLesson.title} (${ugx(targetPrice)}). Please send my unlock code.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-md bg-green-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-green-700"
            >
              Pay &amp; get code on WhatsApp
            </a>
            <form onSubmit={submitCode} className="mt-4">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter unlock code"
                className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm uppercase focus:border-brand-500 focus:outline-none"
              />
              {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
              {okMsg && <p className="mt-1 text-xs font-semibold text-green-600">✓ {okMsg}</p>}
              <button type="submit" disabled={checking} className="mt-2 w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                {checking ? "Checking…" : "Unlock"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
