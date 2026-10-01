"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Lessons, and the decision to sell one.
 *
 * The shop front lists 269 lessons and offers each for UGX 5,000 to 8,000.
 * Eleven have a video. The rest opened a player saying the video was coming
 * and that the written notes "cover this lesson in full" — which for Microsoft
 * Word meant three note units standing in for ten lessons.
 *
 * So nothing is sold until it has been looked at here. Each lesson shows what
 * it actually has, plays its video if there is one, and is published only when
 * the owner says so. A lesson with nothing behind it reads "Coming soon" on
 * the site, with no price on it.
 */

type Lesson = {
  index: number;
  title: string;
  minutes: number;
  youtube?: string;
  preview?: string;
};

type Course = { slug: string; title: string; lessons: Lesson[]; noteUnits: number };

export default function LessonsAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [published, setPublished] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Lesson | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lessons", { cache: "no-store" });
      if (res.redirected && res.url.includes("/login")) {
        setErr("Your session has expired. Sign in again.");
        return;
      }
      if (!res.ok) {
        setErr(`Couldn't load lessons (error ${res.status}).`);
        return;
      }
      const data = await res.json();
      setErr("");
      setCourses(data.courses ?? []);
      setPublished(data.published ?? {});
    } catch {
      setErr("Couldn't reach the server. Check your connection, then reload.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(slug: string, index: number, next: boolean) {
    const key = `${slug}:${index}`;
    setBusy(key);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_slug: slug, lesson_index: index, published: next }),
      });
      if (res.ok) {
        setPublished((p) => {
          const cur = new Set(p[slug] ?? []);
          if (next) cur.add(index);
          else cur.delete(index);
          return { ...p, [slug]: [...cur].sort((a, b) => a - b) };
        });
      }
    } finally {
      setBusy(null);
    }
  }

  const totals = useMemo(() => {
    const lessons = courses.reduce((n, c) => n + c.lessons.length, 0);
    const live = Object.values(published).reduce((n, v) => n + v.length, 0);
    const withVideo = courses.reduce(
      (n, c) => n + c.lessons.filter((l) => l.youtube || l.preview).length,
      0,
    );
    return { lessons, live, withVideo };
  }, [courses, published]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Lessons</h1>
        <p className="mt-1 text-sm text-ink-600/65">
          Nothing is sold until you have checked it. A lesson you have not published shows
          &ldquo;Coming soon&rdquo; on the site, with no price on it.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-ink-50 px-3 py-1.5 text-ink-700">
            {totals.lessons} lessons
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1.5 text-green-800">
            {totals.live} published &amp; on sale
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">
            {totals.lessons - totals.live} not published
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-700">
            {totals.withVideo} have a video
          </span>
        </div>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">
          Loading…
        </p>
      ) : err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-bold text-red-700">{err}</p>
          <button
            onClick={load}
            className="mt-3 rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => {
            const live = published[c.slug] ?? [];
            const isOpen = open === c.slug;
            return (
              <section
                key={c.slug}
                className="overflow-hidden rounded-2xl border border-ink-600/10 bg-white shadow-sm"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : c.slug)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left hover:bg-ink-50/50"
                >
                  <span className="min-w-0">
                    <span className="block font-bold text-ink-600">{c.title}</span>
                    <span className="block text-xs text-ink-600/55">
                      {c.lessons.length} lessons · {c.noteUnits} note units ·{" "}
                      {c.lessons.filter((l) => l.youtube || l.preview).length} with video
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        live.length
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {live.length} of {c.lessons.length} on sale
                    </span>
                    <span className="text-ink-600/40">{isOpen ? "▲" : "▼"}</span>
                  </span>
                </button>

                {isOpen && (
                  <ul className="divide-y divide-ink-600/10 border-t border-ink-600/10">
                    {c.lessons.map((l) => {
                      const hasVideo = Boolean(l.youtube || l.preview);
                      const on = live.includes(l.index);
                      const key = `${c.slug}:${l.index}`;
                      return (
                        <li key={key} className="flex flex-wrap items-center gap-3 px-5 py-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-50 text-xs font-bold text-ink-600">
                            {l.index + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-ink-700">
                              {l.title}
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="text-ink-600/55">{l.minutes} min</span>
                              {hasVideo ? (
                                <span className="rounded bg-green-100 px-1.5 py-0.5 font-bold text-green-800">
                                  Video
                                </span>
                              ) : (
                                <span className="rounded bg-ink-100 px-1.5 py-0.5 font-bold text-ink-600/60">
                                  No video
                                </span>
                              )}
                            </span>
                          </span>

                          {hasVideo && (
                            <button
                              onClick={() => setPlaying(l)}
                              className="shrink-0 rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
                            >
                              ▶ Watch
                            </button>
                          )}

                          <button
                            onClick={() => toggle(c.slug, l.index, !on)}
                            disabled={busy === key}
                            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60 ${
                              on ? "bg-green-600 hover:bg-green-700" : "bg-ink-500 hover:bg-ink-600"
                            }`}
                          >
                            {busy === key ? "…" : on ? "On sale" : "Publish"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {playing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPlaying(null)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {playing.youtube ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playing.youtube}?autoplay=1&rel=0`}
                  title={playing.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : (
              <video
                src={playing.preview}
                controls
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
            )}
            <p className="mt-3 text-center text-sm font-semibold text-white">{playing.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
