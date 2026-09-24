"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GraduationCap, FileText, Award, BookOpen, Play, Users, Briefcase, Video } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { courses } from "@/lib/data";
import { enrolledCourses, progressPct, quizResult, learnerName } from "@/lib/learning";

export default function DashboardPage() {
  const [ready, setReady] = useState(false);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    const update = () => {
      setSlugs(enrolledCourses());
      setName(learnerName());
    };
    update();
    setReady(true);
    window.addEventListener("otu-learning", update);
    return () => window.removeEventListener("otu-learning", update);
  }, []);

  const myCourses = courses.filter((c) => slugs.includes(c.slug));

  return (
    <div className="container-page py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Learn", href: "/learn" }, { label: "My Learning" }]} />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <GraduationCap size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">
            {name ? `${name.split(" ")[0]}'s Learning` : "My Learning"}
          </h1>
          <p className="text-sm text-ink-700/60">Your courses, progress, community and certificates.</p>
        </div>
      </div>

      <Link
        href="/academy"
        className="press mb-4 flex items-center gap-3 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-4 shadow-sm transition hover:shadow-md"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
          <Video size={21} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold text-ink-900">
            My Academy — live classes
          </span>
          <span className="block text-sm text-ink-700/65">
            Join your lecturer, see your timetable, hand in work and check attendance.
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white">
          Open →
        </span>
      </Link>

      {/* Everything a student can reach from here */}
      <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/learn", icon: BookOpen, title: "Courses & Lessons", body: "Browse and unlock lessons" },
          { href: "/community", icon: Users, title: "Student Community", body: "Ask questions, get answers" },
          { href: "/jobs", icon: Briefcase, title: "Jobs & Internships", body: "Openings for our students" },
          { href: "/contact", icon: Award, title: "Certificates", body: "Issued when you complete" },
        ].map((x) => (
          <Link
            key={x.href}
            href={x.href}
            className="group rounded-card border border-ink-600/10 bg-white p-4 shadow-sm card-lift"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <x.icon size={19} />
            </span>
            <p className="mt-2.5 font-bold text-ink-900 group-hover:text-brand-600">{x.title}</p>
            <p className="text-xs text-ink-700/60">{x.body}</p>
          </Link>
        ))}
      </div>

      {!ready ? (
        <p className="text-ink-700/50">Loading…</p>
      ) : myCourses.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-600/20 bg-white p-10 text-center">
          <BookOpen className="mx-auto text-ink-700/40" size={36} />
          <p className="mt-3 font-semibold text-ink-700">You haven&apos;t enrolled in any course yet.</p>
          <Link
            href="/learn"
            className="mt-4 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Enrolled courses + progress */}
          <section>
            <h2 className="mb-3 text-lg font-extrabold text-ink-600">My courses</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {myCourses.map((c) => {
                const pct = progressPct(c.slug, c.syllabus.length);
                const quiz = quizResult(c.slug);
                return (
                  <div key={c.slug} className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-ink-700">{c.title}</h3>
                      {quiz?.passed && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          <Award size={12} /> Quiz passed
                        </span>
                      )}
                    </div>
                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-ink-700/60">{pct}% complete</p>
                    <Link
                      href={`/learn/${c.slug}`}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600"
                    >
                      <Play size={13} /> {pct > 0 ? "Continue" : "Start"} learning
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Downloads */}
          <section>
            <h2 className="mb-3 text-lg font-extrabold text-ink-600">Downloads</h2>
            <ul className="space-y-2">
              {myCourses.flatMap((c) =>
                (c.materials || []).map((m) => (
                  <li key={m.file}>
                    <a
                      href={m.file}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="flex items-center gap-3 rounded-card border border-ink-600/10 bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <FileText size={20} />
                      </span>
                      <span className="flex-1 text-sm font-semibold text-ink-800">{m.title}</span>
                      <span className="text-xs font-semibold text-brand-600">Download</span>
                    </a>
                  </li>
                )),
              )}
              {myCourses.every((c) => !c.materials?.length) && (
                <li className="text-sm text-ink-700/50">No downloads available for your courses yet.</li>
              )}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
