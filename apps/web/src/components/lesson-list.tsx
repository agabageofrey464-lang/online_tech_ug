"use client";

import { useEffect, useState } from "react";
import { Lock, Clock, Play, X, Check } from "lucide-react";
import { lessonPrice, type Course, type Lesson } from "@/lib/data";
import { ugx, whatsappLink, site } from "@/lib/site";
import { doneLessons, toggleLesson, isUnlocked, tryUnlock } from "@/lib/learning";

export function LessonList({ course }: { course: Course }) {
  const { slug, title: courseTitle, syllabus } = course;
  const [playing, setPlaying] = useState<{ title: string; video?: string } | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setDone(doneLessons(slug));
    setUnlocked(isUnlocked(slug));
  }, [slug]);

  function mark(idx: number, value: boolean) {
    toggleLesson(slug, idx, value);
    setDone(doneLessons(slug));
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (tryUnlock(slug, code, course.unlockCode || "")) {
      setUnlocked(true);
      setShowUnlock(false);
      setCode("");
      setErr("");
    } else {
      setErr("That code isn't correct. Check the code we sent you on WhatsApp.");
    }
  }

  return (
    <>
      <ul className="mt-3 divide-y divide-ink-600/5 overflow-hidden rounded-card border border-ink-600/10 bg-white">
        {syllabus.map((lesson: Lesson, i) => {
          const price = lessonPrice(lesson.minutes);
          const free = !!lesson.free;
          const canWatch = free || unlocked;
          const isDone = done.includes(i);
          return (
            <li key={lesson.title} className="flex items-center gap-3 p-4">
              <button
                onClick={() => mark(i, !isDone)}
                title={isDone ? "Mark as not done" : "Mark as completed"}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                  isDone ? "bg-green-600 text-white" : free ? "bg-green-100 text-green-700" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                }`}
              >
                {isDone ? <Check size={16} /> : i + 1}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-800">
                  {lesson.title}
                  {free && <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-green-700">Free</span>}
                  {!free && unlocked && <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-700">Unlocked</span>}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-700/60">
                  <Clock size={12} /> {lesson.minutes} min
                </p>
              </div>

              {canWatch ? (
                <button
                  onClick={() => {
                    setPlaying({ title: lesson.title, video: lesson.preview || course.sampleVideo });
                    mark(i, true);
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700"
                >
                  <Play size={13} /> Watch{free ? " free" : ""}
                </button>
              ) : (
                <>
                  <span className="hidden text-sm font-extrabold text-brand-600 sm:block">{ugx(price)}</span>
                  <button
                    onClick={() => setShowUnlock(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-md bg-brand-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-600"
                  >
                    <Lock size={13} /> Unlock {ugx(price)}
                  </button>
                </>
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
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {playing.video ? (
              <video src={playing.video} controls autoPlay playsInline className="w-full rounded-lg bg-black" />
            ) : (
              <div className="rounded-lg bg-ink-800 p-10 text-center text-white">Lesson video coming soon.</div>
            )}
            <p className="mt-3 text-center text-sm font-semibold text-white">{playing.title}</p>
          </div>
        </div>
      )}

      {/* Unlock modal — pay via MoMo, then enter the code we send */}
      {showUnlock && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowUnlock(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-lg font-extrabold text-ink-600">Unlock this course</h3>
              <button onClick={() => setShowUnlock(false)} aria-label="Close" className="text-ink-600/50 hover:text-ink-600">
                <X size={20} />
              </button>
            </div>
            <ol className="space-y-2 text-sm text-ink-700/80">
              <li><b>1.</b> Send payment via Mobile Money to <b className="text-ink-800">{site.phoneDisplay}</b> (Airtel) or {site.phoneAlt}.</li>
              <li><b>2.</b> Send the confirmation on WhatsApp — we&apos;ll reply with your <b>unlock code</b>.</li>
              <li><b>3.</b> Enter the code below to unlock all lessons & videos.</li>
            </ol>
            <a
              href={whatsappLink(`Hi, I've paid for the "${courseTitle}" course. Please send my unlock code.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-md bg-green-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-green-700"
            >
              Pay & get code on WhatsApp
            </a>
            <form onSubmit={submitCode} className="mt-4">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter unlock code"
                className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm uppercase focus:border-brand-500 focus:outline-none"
              />
              {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
              <button type="submit" className="mt-2 w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
                Unlock course
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
