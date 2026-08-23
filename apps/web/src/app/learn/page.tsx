import type { Metadata } from "next";
import { SafeImage } from "@/components/safe-image";
import Link from "next/link";
import { Radio, CalendarClock, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, Badge } from "@/components/ui";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/section-heading";
import { courses, liveClasses } from "@/lib/data";
import { ugx, whatsappLink } from "@/lib/site";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const metadata: Metadata = {
  title: "Learn — Online Computer Courses",
  description:
    "Affordable online computer courses for students and mature learners in Uganda. Computer basics, Microsoft Office, internet & email, and typing — with certificates.",
};

const flow = ["Register", "Pay", "Unlock videos", "Learn", "Certificate"];

// Regenerate hourly so a class that has already run drops off the page by
// itself — otherwise a static build would keep advertising it until the next
// deploy, and people could register for a session that already happened.
export const revalidate = 3600;

export default function LearnPage() {
  const upcoming = liveClasses
    .filter((lc) => new Date(lc.date).getTime() > Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Learn" }]}
        eyebrow="Learn"
        title="Online computer courses"
        subtitle="Start from the basics and build real skills — designed for students and mature learners. Learn at your own pace and earn a certificate."
      />

      {/* How it works */}
      <section className="container-page py-12">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-ink-600 sm:gap-3">
          {flow.map((f, i) => (
            <div key={f} className="flex items-center gap-2 sm:gap-3">
              <span className="rounded-full bg-brand-50 px-4 py-2 text-brand-700">{f}</span>
              {i < flow.length - 1 && <span className="text-brand-400">→</span>}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-ink-700/60">
          First lesson <span className="font-semibold text-green-600">free</span>. Pay per lesson to unlock
          the rest — <span className="font-semibold text-brand-600">from {ugx(1000)} to {ugx(5000)}</span>,
          or buy the full course.
        </p>
        <div className="mt-5 flex justify-center">
          <Link
            href="/learn/dashboard"
            className="inline-flex items-center gap-2 rounded-md border border-brand-500 px-5 py-2.5 text-sm font-bold text-brand-600 transition hover:bg-brand-50"
          >
            <GraduationCap size={16} /> My Learning Dashboard
          </Link>
        </div>
      </section>

      {/* Live classes */}
      <section className="container-page pb-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Radio size={18} />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-ink-600">Live classes</h2>
            <p className="text-sm text-ink-700/60">Instructor-led sessions — register to get the joining link.</p>
          </div>
        </div>
        {upcoming.length === 0 ? (
          /* Never leave an empty grid — give people a way to ask for the next date. */
          <div className="rounded-card border border-dashed border-ink-600/20 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-ink-800">No live classes scheduled right now.</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-700/65">
              New dates are announced regularly. Message us and we&apos;ll tell you when the next session runs — or
              start any course below straight away.
            </p>
            <a
              href={whatsappLink("Hi, when is the next live class?")}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600"
            >
              Ask about the next class
            </a>
          </div>
        ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((lc) => (
            <div key={lc.id} className="flex flex-col rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold uppercase text-red-600">
                  <Radio size={11} /> Live
                </span>
                <Badge tone="ink">{lc.mode}</Badge>
              </div>
              <h3 className="mt-3 text-sm font-extrabold text-ink-700">{lc.title}</h3>
              <p className="mt-1 text-xs text-ink-700/70">{lc.topic}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink-700/70">
                <CalendarClock size={14} className="text-brand-500" /> {fmtDate(lc.date)} · {lc.durationMins}min
              </p>
              <p className="mt-1 text-xs text-ink-700/60">Host: {lc.host}</p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className={`text-sm font-extrabold ${lc.price ? "text-brand-600" : "text-green-600"}`}>
                  {lc.price ? ugx(lc.price) : "Free"}
                </span>
                <a
                  href={whatsappLink(
                    `Hi, I'd like to REGISTER for the live class "${lc.title}" on ${fmtDate(lc.date)}${lc.price ? ` (${ugx(lc.price)})` : " (free)"}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-600"
                >
                  Register
                </a>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Courses */}
      <section className="container-page pb-8">
        <SectionHeading title="Our Courses" href="/learn/dashboard" linkLabel="My Learning →" className="mb-4" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div
              key={c.slug}
              className="flex flex-col overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <SafeImage
                  src={c.cover ?? `/courses/${c.slug}.webp`}
                  alt={c.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute right-3 top-3">
                  <Badge tone="ink">{c.level}</Badge>
                </span>
                <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow">
                  <Icon name={c.emoji} size={22} />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 pt-4">
              <h2 className="text-lg font-extrabold text-ink-600">{c.title}</h2>
              <p className="mt-2 text-sm text-ink-700/70">{c.blurb}</p>
              <p className="mt-4 text-xs font-medium text-ink-700/60">
                {c.lessons} lessons · {c.hours} hours · Certificate
              </p>
              <p className="mt-1 text-xs font-semibold">
                <span className="text-green-600">1st lesson free</span>
                <span className="text-ink-700/50"> · then from {ugx(1000)}</span>
              </p>
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-lg font-extrabold text-brand-600">{ugx(c.price)}</span>
                <Link
                  href={`/learn/${c.slug}`}
                  className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600"
                >
                  View lessons
                </Link>
              </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription note */}
      <section className="container-page py-12">
        <div className="rounded-card bg-ink-700 px-8 py-10 text-center text-white">
          <h2 className="text-2xl font-extrabold">Or subscribe and learn everything</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/85">
            Get access to all current and future courses for just <b>{ugx(20000)}/month</b>. Cancel
            anytime. Perfect for schools and groups.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              href={whatsappLink("Hi, I'm interested in the monthly learning subscription.")}
              external
              variant="primary"
            >
              Get notified at launch
            </Button>
          </div>
          <p className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs text-white/70">
            <Icon name="learn" size={14} /> Online learning platform launching in Phase 4. Enroll now
            via WhatsApp for early access.
          </p>
        </div>
      </section>
    </>
  );
}
