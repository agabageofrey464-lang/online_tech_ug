import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Lock, FileText, Download, Check, Building2, BadgeCheck, Users } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { SafeImage } from "@/components/safe-image";
import { CourseStructuredData, BreadcrumbStructuredData } from "@/components/structured-data";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LessonList } from "@/components/lesson-list";
import { Quiz } from "@/components/quiz";
import { CourseRegister } from "@/components/course-register";
import { CourseProgress } from "@/components/course-progress";
import { CourseAcademyPanel } from "@/components/course-academy-panel";
import { courses, REGISTRATION_FEE, courseTotal } from "@/lib/data";
import { courseNotes } from "@/lib/course-notes";
import { ugx, whatsappLink } from "@/lib/site";

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) return { title: "Course not found" };
  return {
    title: course.title,
    description: `${course.title} — ${course.lessons} lessons over ${course.durationMonths ?? 1} month(s). Full programme ${ugx(courseTotal(course))} (registration ${ugx(REGISTRATION_FEE)} + training ${ugx(course.trainingFee ?? 0)}), or study lesson by lesson from ${ugx(5000)}.`,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  // Written units take priority; else fall back to any docx notes.
  const noteCount = courseNotes[course.slug]?.length ?? course.notes?.length ?? 0;

  return (
    <div className="container-page py-10">
      <CourseStructuredData course={course} />
      <BreadcrumbStructuredData
        items={[{ name: "Learn", href: "/learn" }, { name: course.title, href: `/learn/${course.slug}` }]}
      />
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Learn", href: "/learn" }, { label: course.title }]} />
      </div>

      {/* Hero */}
      <div className="overflow-hidden rounded-card bg-white shadow-sm">
        <div className="relative h-44 w-full sm:h-56">
          <SafeImage
            src={course.cover ?? `/courses/${course.slug}.webp`}
            alt={course.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="ink">{course.level}</Badge>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/20">
                {course.lessons} lessons
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/20">
                {course.hours} hours
              </span>
              <span className="rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-bold text-white">
                Certificate
              </span>
              {course.durationMonths && (
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/20">
                  {course.durationMonths} month{course.durationMonths > 1 ? "s" : ""}
                </span>
              )}
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/20">
                Physical &amp; online
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.5)] sm:text-3xl">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <p className="flex-1 text-sm text-ink-700/75">{course.blurb}</p>
          {/* Programme fees — registration is one-time and non-refundable */}
          <div className="w-full shrink-0 sm:w-72">
            <div className="rounded-lg border border-ink-600/10 bg-ink-50/60 p-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-700/65">
                    Registration Fee
                    <span className="block text-[10px] text-ink-700/45">One-time, non-refundable</span>
                  </dt>
                  <dd className="font-semibold tabular-nums text-ink-900">{ugx(REGISTRATION_FEE)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-700/65">
                    Training Fee
                    {course.durationMonths && (
                      <span className="block text-[10px] text-ink-700/45">
                        {course.durationMonths} month{course.durationMonths > 1 ? "s" : ""} of training
                      </span>
                    )}
                  </dt>
                  <dd className="font-semibold tabular-nums text-ink-900">{ugx(course.trainingFee ?? 0)}</dd>
                </div>
              </dl>
              <div className="mt-3 border-t border-ink-600/10 pt-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700/70">
                  Total Investment
                </p>
                <p className="text-2xl font-extrabold leading-tight text-brand-600">
                  {ugx(courseTotal(course))}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-col items-stretch gap-2">
              <CourseRegister
                courseSlug={course.slug}
                courseTitle={course.title}
                price={courseTotal(course)}
              />
              <Button
                href={whatsappLink(
                  `Hi, I'd like to apply for the "${course.title}" programme (${course.durationMonths ?? ""} month${(course.durationMonths ?? 0) > 1 ? "s" : ""}) — total ${ugx(courseTotal(course))}.`,
                )}
                external
                variant="outline"
                className="px-5 py-2"
              >
                Apply on WhatsApp
              </Button>
            </div>

            <p className="mt-2 text-center text-[11px] text-ink-700/55 sm:text-right">
              Not ready for the full programme? Unlock single lessons below from <b>{ugx(5000)}</b>.
            </p>
          </div>
        </div>
      </div>

      {/* Live classes, for a student who is already on this course */}
      <div className="mt-4">
        <CourseAcademyPanel slug={course.slug} />
      </div>

      {/* Trust strip */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Building2, title: "Physical or online", body: "Attend at our Kampala centre or learn online — your choice." },
          { icon: BadgeCheck, title: "Certificate included", body: "Issued by the school when you complete the course." },
          { icon: Users, title: "Real support", body: "Stuck? Message our trainers on WhatsApp." },
        ].map((f) => (
          <div key={f.title} className="flex items-start gap-3 rounded-card border border-ink-600/10 bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <f.icon size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-900">{f.title}</p>
              <p className="text-xs text-ink-700/65">{f.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress (after enrolling) */}
      <CourseProgress slug={course.slug} total={course.syllabus.length} />

      {/* What you'll learn — drawn from the real syllabus */}
      <h2 className="mt-8 text-lg font-extrabold text-ink-600">What you&apos;ll learn</h2>
      <ul className="mt-3 grid gap-2 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm sm:grid-cols-2">
        {course.syllabus.slice(0, 8).map((l) => (
          <li key={l.title} className="flex items-start gap-2 text-sm text-ink-700/80">
            <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
            {l.title}
          </li>
        ))}
      </ul>

      {/* Unlock notice */}
      <div className="mt-6 flex items-start gap-3 rounded-card border border-brand-200 bg-brand-50 p-4 text-sm text-ink-700">
        <Lock size={18} className="mt-0.5 shrink-0 text-brand-600" />
        <p>
          Lessons unlock from{" "}
          <b className="text-brand-700">{ugx(5000)} to {ugx(15000)}</b> via Mobile Money — pay for just
          the lesson you need, or the whole course. Tick lessons as you finish, and use the quiz to test
          yourself before your assessment.
        </p>
      </div>

      {/* Lessons */}
      <h2 className="mt-8 text-lg font-extrabold text-ink-600">Video lessons</h2>
      <LessonList course={course} />

      {/* Course notes (premium — unlocked with the course code) */}
      {noteCount > 0 && (
        <Link
          href={`/learn/${course.slug}/notes`}
          className="mt-8 flex items-center justify-between gap-3 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
              <FileText size={22} />
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-base font-extrabold text-ink-900">
                📚 Course notes <span className="text-sm font-semibold text-ink-700/50">({noteCount} units)</span>
                <Lock size={13} className="text-ink-700/40" />
              </p>
              <p className="text-sm text-ink-700/65">Read the full written notes online — unlocked with your course code.</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white">Read notes →</span>
        </Link>
      )}

      {/* Materials / downloads */}
      {course.materials && course.materials.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-extrabold text-ink-600">Course materials</h2>
          <ul className="mt-3 space-y-2">
            {course.materials.map((m) => (
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
                  <Download size={18} className="text-ink-700/50" />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Quiz + certificate */}
      {course.quiz && course.quiz.length > 0 && (
        <div className="mt-8">
          <Quiz courseSlug={course.slug} courseTitle={course.title} questions={course.quiz} />
        </div>
      )}
    </div>
  );
}
