"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, FileUp, Paperclip } from "lucide-react";
import { FilePicker } from "@/components/file-picker";
import { courses } from "@/lib/data";
import { academy, whenLabel, type Assignment, type Submission } from "@/lib/academy";

/**
 * A lecturer's coursework: set work, post notes, mark what comes back.
 *
 * Marking is the part that has to be quick — a score and a line of feedback,
 * no page to navigate to — because it's the thing they'll do most often and
 * the thing students are waiting on.
 */

type Marked = Submission & { name: string; email: string };

const input =
  "mt-1 w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

export function TeachCoursework() {
  const [course, setCourse] = useState(courses[0]?.slug ?? "");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [work, setWork] = useState<Marked[]>([]);
  const [msg, setMsg] = useState("");

  // Set work
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [briefFile, setBriefFile] = useState("");

  // Post a note
  const [noteTitle, setNoteTitle] = useState("");
  const [noteUrl, setNoteUrl] = useState("");
  const [noteKind, setNoteKind] = useState<"note" | "slide" | "recording" | "resource">("note");

  const load = useCallback(async () => {
    try {
      setAssignments(await academy.courseAssignments(course));
    } catch {
      setAssignments([]);
    }
  }, [course]);

  useEffect(() => {
    load();
  }, [load]);

  async function setWorkFor(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setMsg("Give the assignment a title.");
    try {
      await academy.addAssignment({
        course_slug: course,
        title: title.trim(),
        brief: brief.trim(),
        // The picker gives local time; the server keeps everything in UTC.
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
        max_score: maxScore,
        attachment: briefFile,
      });
      setTitle("");
      setBrief("");
      setDueAt("");
      setBriefFile("");
      setMsg("✓ Assignment set — your students can see it now.");
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Couldn't set that.");
    }
  }

  async function postNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteTitle.trim()) return setMsg("Give the note a title.");
    if (!noteUrl) return setMsg("Attach a file or paste a link.");
    try {
      await academy.addMaterial({
        course_slug: course,
        title: noteTitle.trim(),
        kind: noteKind,
        url: noteUrl,
      });
      setNoteTitle("");
      setNoteUrl("");
      setMsg("✓ Posted — it's on your students' notes tab.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Couldn't post that.");
    }
  }

  async function showWork(id: number) {
    setOpen(open === id ? null : id);
    if (open !== id) {
      try {
        setWork(await academy.submissionsFor(id));
      } catch {
        setWork([]);
      }
    }
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
      {/* What's been set, and what's come back */}
      <section>
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-extrabold text-ink-900">
            <ClipboardList size={17} className="text-brand-500" /> Coursework
          </h2>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="rounded-lg border border-ink-600/15 px-2.5 py-1.5 text-xs font-semibold focus:border-brand-500 focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {assignments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-600/20 bg-white p-8 text-center text-sm text-ink-700/55">
            No assignments on this course yet.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {assignments.map((a) => (
              <li key={a.id} className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
                <p className="font-extrabold text-ink-900">{a.title}</p>
                <p className="text-[12.5px] text-ink-700/60">
                  {a.due_at ? `Due ${whenLabel(a.due_at)}` : "No deadline"} · out of {a.max_score}
                </p>
                {a.brief && <p className="mt-1.5 text-sm text-ink-700/75">{a.brief}</p>}
                <button
                  onClick={() => showWork(a.id)}
                  className="press mt-2.5 rounded-lg border border-ink-600/20 px-3.5 py-2 text-xs font-bold text-ink-700 hover:bg-ink-50"
                >
                  {open === a.id ? "Hide submissions" : "Submissions"}
                </button>

                {open === a.id && (
                  <div className="mt-3 space-y-2 border-t border-ink-600/10 pt-3">
                    {work.length === 0 ? (
                      <p className="text-sm text-ink-700/55">Nobody has handed in yet.</p>
                    ) : (
                      work.map((s) => (
                        <MarkRow key={s.id} sub={s} max={a.max_score} onDone={() => showWork(a.id)} />
                      ))
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Set work / post notes */}
      <section className="h-fit space-y-4">
        <form onSubmit={setWorkFor} className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 font-extrabold text-ink-900">
            <ClipboardList size={16} className="text-brand-500" /> Set an assignment
          </h3>

          <label className="mt-3 block text-sm font-semibold text-ink-700">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} />

          <label className="mt-3 block text-sm font-semibold text-ink-700">Brief</label>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={3} className={input} />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold text-ink-700">Due</label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Out of</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value) || 100)}
                className={input}
              />
            </div>
          </div>

          <FilePicker onDone={(url) => setBriefFile(url)} label="Attach the brief (optional)" />

          <button className="press mt-3 w-full rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600">
            Set assignment
          </button>
        </form>

        <form onSubmit={postNote} className="rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 font-extrabold text-ink-900">
            <FileUp size={16} className="text-brand-500" /> Post notes or a recording
          </h3>

          <label className="mt-3 block text-sm font-semibold text-ink-700">Title</label>
          <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className={input} />

          <label className="mt-3 block text-sm font-semibold text-ink-700">Kind</label>
          <select
            value={noteKind}
            onChange={(e) => setNoteKind(e.target.value as typeof noteKind)}
            className={input}
          >
            <option value="note">Notes</option>
            <option value="slide">Slides</option>
            <option value="recording">Class recording</option>
            <option value="resource">Other resource</option>
          </select>

          <FilePicker onDone={(url) => setNoteUrl(url)} label="Attach the file" />
          <input
            value={noteUrl}
            onChange={(e) => setNoteUrl(e.target.value)}
            placeholder="…or paste a link"
            className={input}
          />

          <button className="press mt-3 w-full rounded-lg bg-ink-700 px-5 py-3 text-sm font-bold text-white hover:bg-ink-600">
            Post to the course
          </button>
        </form>

        {msg && <p className="text-xs font-semibold text-ink-700">{msg}</p>}
      </section>
    </div>
  );
}

function MarkRow({ sub, max, onDone }: { sub: Marked; max: number; onDone: () => void }) {
  const [score, setScore] = useState(sub.score ?? 0);
  const [feedback, setFeedback] = useState(sub.feedback ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await academy.mark(sub.id, score, feedback);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg bg-ink-50/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-ink-900">{sub.name}</p>
        <span className="text-[11px] text-ink-700/55">
          {sub.submitted_at ? whenLabel(sub.submitted_at) : ""}
          {sub.marked ? ` · marked ${sub.score}/${max}` : ""}
        </span>
      </div>

      {sub.text && <p className="mt-1.5 whitespace-pre-wrap text-[13px] text-ink-700/80">{sub.text}</p>}
      {sub.attachment && (
        <a
          href={sub.attachment}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brand-600 hover:underline"
        >
          <Paperclip size={12} /> Open their file
        </a>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0}
          max={max}
          value={score}
          onChange={(e) => setScore(Number(e.target.value) || 0)}
          className="w-20 rounded-lg border border-ink-600/15 px-2.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <span className="text-xs text-ink-700/55">/ {max}</span>
        <input
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="A line of feedback"
          className="min-w-0 flex-1 rounded-lg border border-ink-600/15 px-2.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={save}
          disabled={busy}
          className="press rounded-lg bg-green-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : sub.marked ? "Update" : "Mark"}
        </button>
      </div>
    </div>
  );
}
