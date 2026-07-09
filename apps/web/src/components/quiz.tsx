"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/lib/data";
import { saveQuiz, quizResult } from "@/lib/learning";
import { Certificate } from "@/components/certificate";

export function Quiz({
  courseSlug,
  courseTitle,
  questions,
}: {
  courseSlug: string;
  courseTitle: string;
  questions: QuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [prev, setPrev] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  useEffect(() => {
    const r = quizResult(courseSlug);
    if (r) setPrev(r);
  }, [courseSlug]);

  const total = questions.length;
  const score = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
  const passed = score / total >= 0.6;

  function submit() {
    setSubmitted(true);
    saveQuiz(courseSlug, score, total);
    setPrev({ score, total, passed });
  }

  function retake() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold text-ink-600">Quiz</h2>
      <p className="text-sm text-ink-700/60">
        Score 60% or higher to earn your certificate.
        {prev && !submitted && (
          <span className="ml-1 font-semibold text-ink-700">
            (Last attempt: {prev.score}/{prev.total} — {prev.passed ? "passed" : "try again"})
          </span>
        )}
      </p>

      <ol className="mt-4 space-y-5">
        {questions.map((q, qi) => (
          <li key={qi}>
            <p className="text-sm font-semibold text-ink-800">
              {qi + 1}. {q.q}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi;
                const correct = q.answer === oi;
                let cls = "border-ink-600/15 hover:border-brand-300";
                if (submitted) {
                  if (correct) cls = "border-green-500 bg-green-50 font-semibold";
                  else if (chosen) cls = "border-red-400 bg-red-50 font-semibold";
                } else if (chosen) {
                  cls = "border-brand-600 bg-brand-100 font-bold text-ink-900 ring-2 ring-brand-400/50 shadow-sm";
                }
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={`flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 text-left text-sm transition ${cls}`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        chosen ? "border-brand-600 bg-brand-600" : "border-ink-600/30"
                      }`}
                    >
                      {chosen && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {submitted && correct && <CheckCircle2 size={16} className="text-green-600" />}
                    {submitted && chosen && !correct && <XCircle size={16} className="text-red-500" />}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      {!submitted ? (
        <button
          onClick={submit}
          disabled={Object.keys(answers).length < total}
          className="mt-5 rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          Submit quiz
        </button>
      ) : (
        <div className="mt-5">
          <div
            className={`rounded-lg p-4 text-sm font-semibold ${
              passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}
          >
            You scored {score}/{total} ({Math.round((score / total) * 100)}%) —{" "}
            {passed ? "Passed! 🎉 Claim your certificate below." : "Not passed yet. Review and try again."}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={retake}
              className="inline-flex items-center gap-1.5 rounded-md border border-ink-600/20 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              <RotateCcw size={15} /> Retake quiz
            </button>
          </div>
          {passed && (
            <div className="mt-4">
              <Certificate courseTitle={courseTitle} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
