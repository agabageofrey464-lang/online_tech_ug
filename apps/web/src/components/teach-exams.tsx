"use client";

import { useCallback, useEffect, useState } from "react";
import { FileCheck2, Plus, Trash2 } from "lucide-react";
import { academy, type ExamAttempt, type ExamPaperWithAnswers } from "@/lib/academy";
import { courses } from "@/lib/data";

/**
 * Setting an examination, and reading its results.
 *
 * The lecturer writes each question with its options and marks the right one;
 * the paper is then marked by itself the moment a student hands it in. Below
 * the form are the papers already set on the course, each with who has sat it
 * and what they scored.
 */

type Q = { q: string; options: string[]; answer: number };
const blank = (): Q => ({ q: "", options: ["", "", "", ""], answer: 0 });
const input = "w-full min-w-0 rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

export function TeachExams() {
  const [course, setCourse] = useState(courses[0]?.slug ?? "");
  const [list, setList] = useState<ExamPaperWithAnswers[]>([]);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [mins, setMins] = useState(30);
  const [pass, setPass] = useState(50);
  const [qs, setQs] = useState<Q[]>([blank(), blank()]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [results, setResults] = useState<(ExamAttempt & { name: string; email: string })[]>([]);

  const load = useCallback(async () => {
    if (!course) return;
    try {
      setList(await academy.courseExams(course));
    } catch {
      setList([]);
    }
  }, [course]);
  useEffect(() => {
    load();
  }, [load]);

  const setQ = (i: number, change: Partial<Q>) => setQs((all) => all.map((q, n) => (n === i ? { ...q, ...change } : q)));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const ready = qs.filter((q) => q.q.trim() && q.options.filter((o) => o.trim()).length >= 2);
    if (ready.length < 2) {
      setMsg("Write at least two questions, each with two or more options.");
      return;
    }
    // Empty option boxes are dropped, so the marked answer is counted among those that remain.
    const questions = ready.map((q) => {
      const kept = q.options.map((o, k) => ({ o: o.trim(), k })).filter((x) => x.o);
      return { q: q.q.trim(), options: kept.map((x) => x.o), answer: Math.max(0, kept.findIndex((x) => x.k === q.answer)) };
    });
    setBusy(true);
    try {
      await academy.createExam({ course_slug: course, title, instructions, duration_minutes: mins, pass_mark: pass, questions });
      setTitle("");
      setInstructions("");
      setQs([blank(), blank()]);
      setMsg(`Examination set, with ${questions.length} questions. Students on the course can see it now.`);
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "The examination could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function showResults(id: number) {
    if (open === id) {
      setOpen(null);
      return;
    }
    setOpen(id);
    setResults([]);
    try {
      setResults(await academy.examResults(id));
    } catch {
      setResults([]);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <form onSubmit={save} className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-extrabold text-ink-900">
          <FileCheck2 size={17} className="text-brand-500" /> Set an examination
        </h2>
        <p className="mt-1 text-[12.5px] text-ink-700/65">Timed, sat once by each student, and marked automatically when they hand in.</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-ink-800 sm:col-span-2">
            Course
            <select value={course} onChange={(e) => setCourse(e.target.value)} className={`${input} mt-1`}>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-800 sm:col-span-2">
            Title
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. End of course examination" className={`${input} mt-1`} />
          </label>
          <label className="text-xs font-bold text-ink-800">
            Time allowed (minutes)
            <input type="number" min={5} max={240} value={mins} onChange={(e) => setMins(Number(e.target.value))} className={`${input} mt-1`} />
          </label>
          <label className="text-xs font-bold text-ink-800">
            Pass mark (%)
            <input type="number" min={1} max={100} value={pass} onChange={(e) => setPass(Number(e.target.value))} className={`${input} mt-1`} />
          </label>
          <label className="text-xs font-bold text-ink-800 sm:col-span-2">
            Instructions to students <span className="font-normal text-ink-700/55">(optional)</span>
            <textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Answer every question. Choose one option for each." className={`${input} mt-1`} />
          </label>
        </div>

        <div className="mt-4 space-y-3">
          {qs.map((q, i) => (
            <div key={i} className="rounded-lg border border-ink-600/15 bg-ink-50/40 p-3">
              <div className="flex items-start gap-2">
                <span className="mt-2.5 text-sm font-extrabold text-brand-600">{i + 1}.</span>
                <input value={q.q} onChange={(e) => setQ(i, { q: e.target.value })} placeholder="The question" className={input} />
                {qs.length > 2 && (
                  <button type="button" onClick={() => setQs((all) => all.filter((_, n) => n !== i))} aria-label={`Remove question ${i + 1}`} className="mt-2 text-ink-700/45 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="mt-2 grid gap-2 pl-6 sm:grid-cols-2">
                {q.options.map((o, k) => (
                  <label key={k} className="flex items-center gap-2">
                    <input type="radio" name={`right-${i}`} checked={q.answer === k} onChange={() => setQ(i, { answer: k })} title="Mark as the right answer" className="h-4 w-4 shrink-0 accent-[#16a34a]" />
                    <input
                      value={o}
                      onChange={(e) => setQ(i, { options: q.options.map((x, n) => (n === k ? e.target.value : x)) })}
                      placeholder={`Option ${String.fromCharCode(65 + k)}`}
                      className={input}
                    />
                  </label>
                ))}
              </div>
              <p className="mt-1.5 pl-6 text-[11px] text-ink-700/55">Tick the circle beside the right answer. Leave an option empty if you need fewer than four.</p>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => setQs((all) => [...all, blank()])} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-ink-600/20 px-3.5 py-2 text-xs font-bold text-ink-700 hover:bg-ink-50">
          <Plus size={14} /> Add a question
        </button>

        {msg && <p className="mt-3 text-sm font-semibold text-ink-800">{msg}</p>}
        <button type="submit" disabled={busy} className="press mt-3 block w-full rounded-lg bg-brand-500 px-5 py-3 text-sm font-black text-white hover:bg-brand-600 disabled:opacity-60 sm:w-auto">
          {busy ? "Saving…" : "Set this examination"}
        </button>
      </form>

      <section className="h-fit rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
        <h2 className="font-extrabold text-ink-900">Examinations on this course</h2>
        {list.length === 0 && <p className="mt-2 text-sm text-ink-700/60">None set yet.</p>}
        <ul className="mt-2 space-y-2">
          {list.map((x) => (
            <li key={x.id} className="rounded-lg border border-ink-600/10 p-3">
              <p className="font-bold text-ink-900">{x.title}</p>
              <p className="text-[12px] text-ink-700/60">
                {x.question_count} questions · {x.duration_minutes} min · pass {x.pass_mark}%
              </p>
              <button onClick={() => showResults(x.id)} className="mt-1.5 text-xs font-bold text-brand-600 hover:underline">
                {open === x.id ? "Hide results" : "See results"}
              </button>
              {open === x.id && (
                <ul className="mt-2 space-y-1 border-t border-ink-600/10 pt-2 text-[12.5px]">
                  {results.length === 0 && <li className="text-ink-700/55">No student has sat it yet.</li>}
                  {results.map((r) => (
                    <li key={r.email} className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-ink-800">{r.name}</span>
                      <span className={`shrink-0 font-bold ${r.submitted_at ? (r.passed ? "text-green-700" : "text-red-700") : "text-ink-700/50"}`}>
                        {r.submitted_at ? `${r.score}/${r.total} · ${r.percent}%` : "sitting now"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
