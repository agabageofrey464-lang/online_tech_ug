import { apiGet, ugx, type AdminCourse } from "@/lib/api";
import { CourseCodes } from "@/components/course-codes";


export default async function CoursesPage() {
  const courses = (await apiGet<AdminCourse[]>("/api/v1/courses")) ?? [];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink-600">Courses</h1>
        <p className="text-sm text-ink-600/60">{courses.length} course(s) in the database.</p>
      </header>

      {courses.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-6 text-center text-sm text-ink-600/60">
            Live course data appears here once the backend API is deployed. Meanwhile, here are the
            unlock codes to send learners after they pay via Mobile Money:
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Computer Basics for Everyone", code: "CB-2026" },
              { title: "Microsoft Office Mastery", code: "OFFICE-2026" },
              { title: "Internet, Email & Online Safety", code: "NET-2026" },
              { title: "Fast & Accurate Typing", code: "TYPE-2026" },
            ].map((c) => (
              <div key={c.code} className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 p-4">
                <span className="text-sm font-semibold text-ink-600">{c.title}</span>
                <span className="font-mono text-sm font-extrabold tracking-wider text-brand-700">{c.code}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => {
            const free = c.syllabus.filter((l) => l.free).length;
            const videos = c.syllabus.filter((l) => l.youtube).length;
            return (
              <div key={c.slug} className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-ink-600">{c.title}</h2>
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                    {c.level}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-600/70">{c.blurb}</p>

                {/* Per-payment unlock codes — generate one to send a learner after they pay via MoMo */}
                <CourseCodes slug={c.slug} />
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-ink-50 px-2 py-1 font-semibold text-ink-600">{c.lessons} lessons</span>
                  <span className="rounded bg-ink-50 px-2 py-1 font-semibold text-ink-600">{c.hours} hrs</span>
                  <span className="rounded bg-ink-50 px-2 py-1 font-semibold text-ink-600">{ugx(c.price_ugx)}</span>
                  <span className="rounded bg-green-100 px-2 py-1 font-semibold text-green-700">{free} free</span>
                  <span className="rounded bg-blue-100 px-2 py-1 font-semibold text-blue-700">{videos} videos</span>
                  <span className="rounded bg-ink-50 px-2 py-1 font-semibold text-ink-600">{c.materials.length} PDF(s)</span>
                  <span className="rounded bg-ink-50 px-2 py-1 font-semibold text-ink-600">{c.quiz.length} quiz Qs</span>
                </div>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-semibold text-brand-600">View lessons</summary>
                  <ul className="mt-2 space-y-1">
                    {c.syllabus.map((l, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 text-ink-600/80">
                        <span>{i + 1}. {l.title}</span>
                        <span className="shrink-0 text-xs text-ink-600/50">
                          {l.free ? "Free" : "Paid"} · {l.minutes}m
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
