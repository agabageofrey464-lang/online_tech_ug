import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Lock, FileText, Download, Check, PlayCircle, BadgeCheck, Users } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { SafeImage } from "@/components/safe-image";
import { CourseStructuredData, BreadcrumbStructuredData } from "@/components/structured-data";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LessonList } from "@/components/lesson-list";
import { Quiz } from "@/components/quiz";
import { CourseRegister } from "@/components/course-register";
import { CourseProgress } from "@/components/course-progress";
import { courses } from "@/lib/data";
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
    description: `${course.title} — ${course.lessons} lessons. Unlock lessons from ${ugx(5000)} or buy the full course for ${ugx(course.price)}.`,
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
            </div>
            <h1 className="mt-2 text-2xl font-black text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.5)] sm:text-3xl">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <p className="flex-1 text-sm text-ink-700/75">{course.blurb}</p>
          <div className="shrink-0 text-center sm:text-right">
            <p className="text-xs text-ink-700/50">Full course</p>
            <p className="text-2xl font-extrabold text-brand-600">{ugx(course.price)}</p>
            <p className="text-[11px] text-ink-700/50">or single lessons from {ugx(5000)}</p>
            <div className="mt-2 flex flex-col items-stretch gap-2 sm:items-end">
              <CourseRegister courseSlug={course.slug} courseTitle={course.title} price={course.price} />
              <Button
                href={whatsappLink(`Hi, I'd like to buy the full "${course.title}" course (${ugx(course.price)}).`)}
                external
                variant="outline"
                className="px-5 py-2"
              >
                Buy full course
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { icon: PlayCircle, title: "Learn at your pace", body: "Watch lessons any time, on phone or laptop." },
          { icon: BadgeCheck, title: "Certificate included", body: "Pass the quiz and download your certificate." },
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
          The first lesson is <b className="text-green-700">free</b>. Other lessons unlock from{" "}
          <b className="text-brand-700">{ugx(5000)} to {ugx(15000)}</b> via Mobile Money — pay for just
          the lesson you need, or the whole course. Tick lessons as you finish, then take the quiz for
          your certificate.
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
