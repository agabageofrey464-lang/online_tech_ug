"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Download, FileText, ChevronLeft, CheckCircle2 } from "lucide-react";
import { courses } from "@/lib/data";
import { courseNotes } from "@/lib/course-notes";
import { useAuth } from "@/lib/auth";
import { ugx, whatsappLink } from "@/lib/site";
import { BrandLogoFull } from "@/components/brand-logo-full";

// The full note content is gated on the SERVER — it is fetched (with the paid
// code) through the same-origin proxy and is never shipped in the browser bundle.
type Unit = { n?: number; title: string; summary?: string; html?: string };

const notesUrl = (slug: string, code: string) =>
  `/_api/courses/${slug}/notes${code ? `?code=${encodeURIComponent(code.trim())}` : ""}`;

const codeKey = (slug: string) => `otu_notecode_${slug}`;
const readStoredCode = (slug: string) => {
  try {
    return localStorage.getItem(codeKey(slug)) ?? "";
  } catch {
    return "";
  }
};

// Microsoft's viewer renders a public .docx read-only inside an iframe (legacy).
const officeSrc = (file: string) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(`https://www.onlinetechug.com${file}`)}`;

export default function CourseNotesPage() {
  const slug = String(useParams().slug || "");
  const course = courses.find((c) => c.slug === slug);

  const { user } = useAuth();
  const isOwner = user?.role === "admin"; // the business owner sees notes freely

  const hasServerNotes = !!courseNotes[slug];
  const preview: Unit[] = courseNotes[slug] ?? [];

  const [unlocked, setUnlocked] = useState(false);
  const [units, setUnits] = useState<Unit[]>(preview);
  const [active, setActive] = useState(0);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [checking, setChecking] = useState(false);

  // Ask the server for the notes. Returns true when the code unlocked full content.
  const fetchServerNotes = useCallback(
    async (withCode: string): Promise<boolean> => {
      try {
        const res = await fetch(notesUrl(slug, withCode), { cache: "no-store" });
        if (!res.ok) return false;
        const json = (await res.json()) as { unlocked?: boolean; units?: Unit[] };
        if (Array.isArray(json.units) && json.units.length) setUnits(json.units);
        const ok = !!json.unlocked;
        setUnlocked(ok);
        return ok;
      } catch {
        return false;
      }
    },
    [slug],
  );

  useEffect(() => {
    if (!course) return;
    if (hasServerNotes) {
      // Owner auto-unlocks with the course code; returning learners reuse the code they saved.
      const auto = isOwner ? course.unlockCode || "" : readStoredCode(slug);
      void fetchServerNotes(auto);
    } else {
      // Legacy docx courses: the files are public, so a local code check is enough.
      const saved = readStoredCode(slug);
      const ok = isOwner || (!!course.unlockCode && saved.toUpperCase() === course.unlockCode.toUpperCase());
      setUnlocked(ok);
    }
  }, [slug, isOwner, course, hasServerNotes, fetchServerNotes]);

  if (!course) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-ink-700/60">Course not found.</p>
        <Link href="/learn" className="mt-3 inline-block font-semibold text-brand-600">← Back to courses</Link>
      </div>
    );
  }

  // Chapters: server units (written notes) when available, else legacy docx files.
  const chapters: { title: string; html?: string; file?: string }[] = hasServerNotes
    ? units.map((u) => ({ title: u.n ? `Unit ${u.n} — ${u.title}` : u.title, html: u.html }))
    : (course.notes ?? []).map((n) => ({ title: n.title, file: n.file }));
  const notes = chapters;

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setErr("");
    const entered = code.trim();
    let ok = false;
    if (hasServerNotes) {
      ok = await fetchServerNotes(entered);
    } else {
      ok = !!course!.unlockCode && entered.toUpperCase() === course!.unlockCode.toUpperCase();
      if (ok) setUnlocked(true);
    }
    if (ok) {
      try {
        localStorage.setItem(codeKey(slug), entered);
      } catch {
        /* storage blocked — still unlocked for this session */
      }
    } else {
      setErr("That code isn't correct. Check the code we sent you after payment.");
    }
    setChecking(false);
  }

  return (
    <div className="container-page py-8">
      {/* Branded header — official Online Tech Uganda course material */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-card bg-gradient-to-r from-ink-700 via-ink-600 to-brand-600 p-4 text-white shadow-md sm:p-5">
        <BrandLogoFull />
        <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20">
          Official Course Notes
        </span>
      </div>

      <Link href={`/learn/${slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ChevronLeft size={16} /> Back to course
      </Link>
      <h1 className="mt-3 flex items-center gap-2 text-2xl font-extrabold text-ink-900">
        <FileText className="text-brand-500" /> {course.title} — Course Notes
      </h1>

      {notes.length === 0 ? (
        <p className="mt-6 rounded-card border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-700/60">
          Notes for this course are coming soon.
        </p>
      ) : !unlocked ? (
        /* ── Locked: premium notes require the paid unlock code ── */
        <div className="mx-auto mt-6 max-w-lg rounded-card border border-ink-600/10 bg-white p-7 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Lock size={26} />
          </span>
          <h2 className="mt-4 text-lg font-extrabold text-ink-900">These notes are for enrolled learners</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-700/70">
            Unlock the <b>{course.title}</b> course ({ugx(course.price)}) to read all chapters. Already paid? Enter your code below.
          </p>

          <form onSubmit={unlock} className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your unlock code"
              className="flex-1 rounded-md border border-ink-600/20 px-3 py-2.5 text-sm uppercase focus:border-brand-500 focus:outline-none"
            />
            <button type="submit" disabled={checking} className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
              {checking ? "Checking…" : "Unlock"}
            </button>
          </form>
          {err && <p className="mt-2 text-xs font-semibold text-red-500">{err}</p>}

          <div className="mt-5 border-t border-ink-600/10 pt-4">
            <p className="text-xs text-ink-700/50">Don&apos;t have a code yet?</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Link href={`/learn/${slug}`} className="rounded-md bg-ink-700 px-4 py-2 text-xs font-bold text-white hover:bg-ink-800">
                Get the course
              </Link>
              <a href={whatsappLink(`Hi, I'd like to buy the "${course.title}" course (${ugx(course.price)}) to access the notes.`)} target="_blank" rel="noreferrer" className="rounded-md border border-green-600 px-4 py-2 text-xs font-bold text-green-700 hover:bg-green-50">
                Pay via WhatsApp
              </a>
            </div>
          </div>

          {/* Preview: chapter titles (locked) */}
          <ul className="mt-5 space-y-1.5 text-left text-sm">
            {notes.map((n) => (
              <li key={n.title} className="flex items-center gap-2 text-ink-700/60">
                <Lock size={13} className="shrink-0 text-ink-700/40" /> {n.title}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        /* ── Unlocked: read the chapters ── */
        <>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-green-700">
            <CheckCircle2 size={16} />
            {isOwner ? "Owner access — all units open." : "Unlocked — enjoy your course notes."}
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
            {/* Chapter list */}
            <aside className="h-fit rounded-card border border-ink-600/10 bg-white p-2 shadow-sm">
              {notes.map((n, idx) => (
                <button
                  key={n.title}
                  onClick={() => setActive(idx)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    idx === active ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-50"
                  }`}
                >
                  <FileText size={15} className="shrink-0" /> {n.title}
                </button>
              ))}
            </aside>

            {/* Reader */}
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-extrabold text-ink-900">{notes[active]?.title}</h2>
                {notes[active]?.file && (
                  <a
                    href={notes[active].file}
                    download
                    className="inline-flex items-center gap-1.5 rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
                  >
                    <Download size={14} /> Download
                  </a>
                )}
              </div>

              {notes[active]?.html ? (
                /* Written in-site notes (fetched from the server) */
                <article
                  className="notes-prose rounded-card border border-ink-600/10 bg-white p-5 shadow-sm sm:p-7"
                  dangerouslySetInnerHTML={{ __html: notes[active].html! }}
                />
              ) : notes[active]?.file ? (
                <>
                  <iframe
                    key={notes[active].file}
                    src={officeSrc(notes[active].file!)}
                    title={notes[active].title}
                    className="h-[72vh] w-full rounded-card border border-ink-600/10 bg-white shadow-sm"
                  />
                  <p className="mt-2 text-xs text-ink-700/50">
                    Reading online via Microsoft&apos;s viewer. Prefer offline? Use the Download button.
                  </p>
                </>
              ) : (
                <p className="rounded-card border border-ink-600/10 bg-white p-6 text-center text-sm text-ink-700/60">
                  Loading this unit…
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
