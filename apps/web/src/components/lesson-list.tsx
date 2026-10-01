"use client";

import { useEffect, useState } from "react";
import { Lock, Clock, Play, X, Check } from "lucide-react";
import { lessonPrice, type Course, type Lesson } from "@/lib/data";
import { ugx, whatsappLink, site } from "@/lib/site";
import { doneLessons, toggleLesson, isUnlocked, lessonUnlocks, applyCourseCode, markUnlocked, unlockLesson } from "@/lib/learning";
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
  /**
   * Which lessons the owner has cleared for sale.
   *
   * Every lesson used to carry a price whether or not there was anything
   * behind it: 269 lessons were on sale and eleven had a video, so a learner
   * could pay for a lesson and be shown a notice saying the video was coming.
   * A lesson is only offered once it has been checked and published in the
   * admin. `null` means we have not heard back yet, and nothing is offered
   * until we have — the safe way round.
   */
  const [publishedIdx, setPublishedIdx] = useState<number[] | null>(null);

  function refresh() {
    setDone(doneLessons(slug));
    setFull(isUnlocked(slug));
    setOpenSet(lessonUnlocks(slug));
  }
  useEffect(refresh, [slug]);

  useEffect(() => {
    let alive = true;
    fetch(`/_api/courses/${slug}/lessons/status`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { published: [] }))
      .then((d) => alive && setPublishedIdx(Array.isArray(d.published) ? d.published : []))
      .catch(() => alive && setPublishedIdx([]));
    return () => {
      alive = false;
    };
  }, [slug]);

  function mark(idx: number, value: boolean) {
    toggleLesson(slug, idx, value);
    setDone(doneLessons(slug));
  }

  // Every lesson is paid — it opens only via a full-course or per-lesson code.
  const canWatch = (i: number) => full || openSet.includes(i);

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    const entered = code.trim();
    if (!entered) return;
    setChecking(true);
    setErr("");
    setOkMsg("");
    try {
      // Preferred: a personal, single-device code issued to this buyer. The server
      // binds it to their device, so a shared code fails for everyone else.
      try {
        const r = await verifyUnlockCode(slug, entered);
        if (r.valid) {
          if (r.lesson && r.lesson >= 1) {
            unlockLesson(slug, r.lesson - 1);
            setOpenSet(lessonUnlocks(slug));
            setOkMsg(`Lesson ${r.lesson} unlocked!`);
          } else {
            markUnlocked(slug);
            setFull(true);
            setOkMsg("Whole course unlocked! Enjoy all lessons.");
          }
          finishUnlock();
          return;
        }
        if (r.reason === "used_on_another_device") {
          setErr("This code has already been used on another device. Codes are personal — contact us for your own code.");
          return;
        }
        if (r.reason === "revoked") {
          setErr("This code is no longer active. Please contact us on WhatsApp.");
          return;
        }
      } catch {
        /* API unreachable — fall through to the offline course code below */
      }
      // Fallback (offline / legacy): base course code, or CODE-<n> for one lesson.
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
          const watchable = canWatch(i);
          // Not yet checked by the owner, so not for sale. Shown as coming,
          // without a price, rather than quietly hidden — the course outline
          // is still worth reading before you enrol.
          const forSale = publishedIdx !== null && publishedIdx.includes(i);
          const isDone = done.includes(i);
          return (
            <li key={lesson.title} className={`flex items-start gap-3 p-3.5 transition sm:items-center sm:p-4 ${isDone ? "bg-green-50/40" : "hover:bg-ink-50/50"}`}>
              <button
                onClick={() => mark(i, !isDone)}
                title={isDone ? "Mark as not done" : "Mark as completed"}
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition sm:mt-0 ${
                  isDone ? "bg-green-600 text-white" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                }`}
              >
                {isDone ? <Check size={16} /> : i + 1}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-ink-800">
                  {lesson.title}
                  {watchable && <span className="ml-2 align-middle rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-700">Unlocked</span>}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-700/60">
                  <Clock size={12} /> {lesson.minutes} min
                </p>
              </div>

              {watchable ? (
                <button
                  onClick={() => {
                    // Only ever play THIS lesson's own video. We deliberately do not fall
                    // back to a generic course clip — a paid learner must never be
                    // shown an unrelated video in place of the lesson they bought.
                    setPlaying({ title: lesson.title, video: lesson.preview, youtube: lesson.youtube });
                    mark(i, true);
                  }}
                  className="flex shrink-0 items-center gap-1.5 self-center rounded-md bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700"
                >
                  <Play size={13} /> Watch
                </button>
              ) : forSale ? (
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
              ) : (
                <span className="flex shrink-0 items-center gap-1.5 self-center rounded-md bg-ink-50 px-3 py-2 text-xs font-bold text-ink-700/55">
                  Coming soon
                </span>
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
              <div className="rounded-lg bg-ink-800 p-8 text-center text-white">
                <p className="text-base font-bold">Video for this lesson is coming soon</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
                  The written notes for this course are ready now — they cover this lesson in full.
                </p>
                <a
                  href={`/learn/${slug}/notes`}
                  className="mt-4 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
                >
                  Read the course notes
                </a>
              </div>
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
