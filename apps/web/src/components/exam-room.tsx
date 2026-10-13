"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, FileCheck2, XCircle } from "lucide-react";
import { academy, type ExamAttempt, type ExamPaper, type ExamSummary } from "@/lib/academy";

/**
 * A student's examinations: what is set, sitting one, and the marks.
 *
 * An examination is sat once and against the clock. The questions are not
 * sent to the browser until the student starts, the time is kept by the
 * server, and the paper is handed in by itself when the time runs out — so a
 * student who loses their connection is marked on what they had answered.
 */

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function ExamRoom({
  exams,
  attempts,
  courseTitle,
  onChange,
}: {
  exams: ExamSummary[];
  attempts: ExamAttempt[];
  courseTitle: (slug: string) => string;
  onChange: () => void;
}) {
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [endsAt, setEndsAt] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [left, setLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<ExamAttempt | null>(null);
  const handingIn = useRef(false);

  const handIn = useCallback(async () => {
    if (!paper || handingIn.current) return;
    handingIn.current = true;
    setBusy(true);
    setErr("");
    try {
      const r = await academy.submitExam(paper.id, answers);
      setResult(r);
      setPaper(null);
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Your paper could not be handed in. Check your connection and try again.");
      handingIn.current = false;
    } finally {
      setBusy(false);
    }
  }, [paper, answers, onChange]);

  // The clock. When it reaches nothing the paper hands itself in.
  useEffect(() => {
    if (!paper) return;
    const tick = () => {
      const s = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) void handIn();
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [paper, endsAt, handIn]);

  // Leaving the page mid-paper loses nothing on the server, but say so.
  useEffect(() => {
    if (!paper) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [paper]);

  async function start(exam: ExamSummary) {
    if (!window.confirm(`Start "${exam.title}"?\n\nYou have ${exam.duration_minutes} minutes and can sit it only once. The clock starts now and does not stop.`)) return;
    setBusy(true);
    setErr("");
    setResult(null);
    try {
      const { exam: full, attempt } = await academy.startExam(exam.id);
      handingIn.current = false;
      setAnswers(new Array(full.questions.length).fill(-1));
      // The server's clock decides; this is how long that leaves on this device.
      const started = new Date(attempt.started_at.endsWith("Z") ? attempt.started_at : `${attempt.started_at}Z`).getTime();
      setEndsAt(started + full.duration_minutes * 60000);
      setPaper(full);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The examination could not be started.");
    } finally {
      setBusy(false);
    }
  }

  /* ── Sitting the paper ───────────────────────────────────────── */
  if (paper) {
    const done = answers.filter((a) => a >= 0).length;
    return (
      <div>
        <div className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink-800 px-4 py-3 text-white shadow-lg">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold">{paper.title}</p>
            <p className="text-[11.5px] text-white/70">
              {done} of {paper.questions.length} answered
            </p>
          </div>
          <span className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-lg font-black ${left <= 60 ? "bg-red-600" : "bg-white/15"}`}>
            <Clock size={16} /> {fmt(left)}
          </span>
        </div>

        {paper.instructions && <p className="mt-3 rounded-xl bg-brand-50 p-3.5 text-sm text-ink-800">{paper.instructions}</p>}

        <ol className="mt-3 space-y-3">
          {paper.questions.map((q, i) => (
            <li key={i} className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
              <p className="font-bold text-ink-900">
                <span className="mr-1.5 text-brand-600">{i + 1}.</span>
                {q.q}
              </p>
              <div className="mt-2.5 space-y-1.5">
                {q.options.map((o, k) => (
                  <label
                    key={k}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition ${
                      answers[i] === k ? "border-brand-500 bg-brand-50 font-semibold text-ink-900" : "border-ink-600/15 text-ink-800 hover:bg-ink-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={answers[i] === k}
                      onChange={() => setAnswers((a) => a.map((v, n) => (n === i ? k : v)))}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#f15a29]"
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ol>

        {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{err}</p>}
        <button
          onClick={() => {
            if (done < paper.questions.length && !window.confirm(`You have left ${paper.questions.length - done} question(s) unanswered. Hand in anyway?`)) return;
            void handIn();
          }}
          disabled={busy}
          className="press mt-4 w-full rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-black text-white hover:bg-brand-600 disabled:opacity-60 sm:w-auto"
        >
          {busy ? "Handing in…" : "Hand in my paper"}
        </button>
      </div>
    );
  }

  /* ── The list ────────────────────────────────────────────────── */
  return (
    <div className="space-y-2.5">
      {result && (
        <div className={`rounded-xl p-4 text-white shadow-sm ${result.passed ? "bg-green-600" : "bg-ink-800"}`}>
          <p className="flex items-center gap-2 text-base font-extrabold">
            {result.passed ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            {result.passed ? "Passed" : "Not passed"} — {result.score} out of {result.total} ({result.percent}%)
          </p>
          <p className="mt-1 text-sm text-white/85">Your paper has been handed in and marked. The mark is on your record.</p>
        </div>
      )}
      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{err}</p>}

      {exams.length === 0 && (
        <p className="rounded-xl border border-dashed border-ink-600/20 bg-white p-6 text-center text-sm text-ink-700/60">
          No examination has been set on your courses yet. When your lecturer sets one, it appears here.
        </p>
      )}

      {exams.map((e) => {
        const mine = attempts.find((a) => a.exam_id === e.id);
        const sat = mine?.submitted_at;
        const now = Date.now();
        const notOpen = e.opens_at && now < new Date(`${e.opens_at}Z`).getTime();
        const closed = e.closes_at && now > new Date(`${e.closes_at}Z`).getTime();
        return (
          <div key={e.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FileCheck2 size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-700/50">{courseTitle(e.course_slug)}</p>
              <p className="font-bold text-ink-900">{e.title}</p>
              <p className="text-[12px] text-ink-700/60">
                {e.question_count} questions · {e.duration_minutes} minutes · pass mark {e.pass_mark}% · sat once
              </p>
            </div>
            {sat ? (
              <span className={`rounded-lg px-3.5 py-2 text-sm font-extrabold ${mine.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {mine.passed ? "Passed" : "Not passed"} · {mine.score}/{mine.total} ({mine.percent}%)
              </span>
            ) : notOpen ? (
              <span className="rounded-lg bg-ink-50 px-3.5 py-2 text-xs font-bold text-ink-700/70">
                Opens {new Date(`${e.opens_at}Z`).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : closed && !mine ? (
              <span className="rounded-lg bg-ink-50 px-3.5 py-2 text-xs font-bold text-ink-700/70">Closed</span>
            ) : (
              <button onClick={() => start(e)} disabled={busy} className="press rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                {mine ? "Continue" : "Start examination"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
