import type { Metadata } from "next";
import { ContactOptions } from "@/components/contact-options";
import Image from "next/image";
import Link from "next/link";
import { ExploreMore } from "@/components/explore-more";
import { Radio, CalendarClock, Award, Smartphone, Wallet, MessageCircle, Check, Building2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LearningBrochures } from "@/components/learning-brochures";
import { Button, Badge } from "@/components/ui";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/section-heading";
import { CourseBrowser } from "@/components/course-browser";
import { IntakeAdverts } from "@/components/intake-adverts";
import { PromoBanners } from "@/components/promo-banners";
import { SafeImage } from "@/components/safe-image";
import { courses, liveClasses, REGISTRATION_FEE } from "@/lib/data";
import { courseNotes } from "@/lib/course-notes";
import { ugx, whatsappLink } from "@/lib/site";
import { share } from "@/lib/seo";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const metadata: Metadata = share({
  title: "Learn — Online Computer Courses in Uganda",
  description:
    "22 professional computer training courses in Uganda — Microsoft Office, graphic design, web development, networking and more. Enrol on a full programme, or study lesson by lesson from UGX 5,000. Certificate on completion.",
  alternates: { canonical: "/learn" },
}, "/learn");

// Regenerate hourly so a class that has already run drops off the page by
// itself — otherwise a static build would keep advertising it until the next
// deploy, and people could register for a session that already happened.
export const revalidate = 3600;


const FAQ = [
  {
    q: "How do I pay for a course?",
    a: "Send Mobile Money (MTN MoMo or Airtel Money) to our number, then message us on WhatsApp with the confirmation. For a full programme we complete your registration; for self-study we reply with your unlock code within minutes.",
  },
  {
    q: "Can I pay for just one lesson?",
    a: "Yes. If you don't want the full programme, every lesson is priced on its own, from UGX 5,000 for short lessons up to UGX 15,000 for the longest. Your code unlocks that lesson alone, and there is no registration fee for self-study.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. When you complete the course with us, we issue an Online Tech Uganda certificate carrying your name, the course and a certificate number. Quizzes in the lessons are for your own practice — the certificate is issued by the school, not by the website.",
  },
  {
    q: "Are classes physical or online?",
    a: "Both. You can attend in person at our Kampala centre, or take the same course fully online and study from anywhere in Uganda. The tutors, materials and certificate are identical — tell us which you prefer when you apply.",
  },
  {
    q: "Do I need my own computer?",
    a: "It helps, but the lessons and notes work on a phone too. If you need practice time on a machine, talk to us — we can arrange it at our Kampala office.",
  },
  {
    q: "How long do I have access?",
    a: "Forever. Once a lesson is unlocked on your device it stays unlocked — there is no monthly fee and nothing expires.",
  },
  {
    q: "What is the registration fee for?",
    a: "It is a one-time, non-refundable fee of UGX 180,000 that covers your enrolment, learning materials and certification. It is charged once, on top of the training fee for your course.",
  },
];

export default function LearnPage() {
  const upcoming = liveClasses
    .filter((lc) => new Date(lc.date).getTime() > Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalLessons = courses.reduce((n, c) => n + c.lessons, 0);
  const withNotes = Object.keys(courseNotes);

  // Programmes run two months for the short courses and three or four for the
  // harder ones — stated up front, because it decides whether someone can
  // commit before they read anything else.
  const months = courses.map((c) => c.durationMonths ?? 2);

  const stats = [
    { value: `${courses.length}`, label: "Courses" },
    { value: `${totalLessons}`, label: "Lessons" },
    { value: `${Math.min(...months)}–${Math.max(...months)}`, label: "Months" },
    { value: `${REGISTRATION_FEE / 1000}K`, label: "Registration" },
  ];

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-800 text-white">
        {/* A photograph the full width of the page, with the title over it. */}
        <Image src="/web/photo-1509062522246-3755977927d7.webp" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink-900/60" />

        <div className="container-page relative py-5 sm:py-8">
          <Breadcrumbs items={[{ label: "Learn" }]} light />

          <div className="mx-auto mt-8 max-w-3xl text-center">
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20">
                <Award size={13} /> Certificate included
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20">
                <Building2 size={13} /> Physical &amp; Online classes
              </span>
            </div>
            <h1 className="mt-4 text-[36px] leading-[1.1] sm:text-[54px]">
              Learn Real Computer Skills, <em className="font-display text-brand-200">Pay Per Lesson</em>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-white/95">
              From your very first click to graphic design, Excel and coding. Built for students and
              mature learners in Uganda. Attend in person at our Kampala centre or learn online from
              anywhere — enrol on a full programme or study lesson by lesson, and earn a
              certificate you can show an employer.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="#courses"
                className="press bg-white px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-white/90"
              >
                Browse courses
              </Link>
              <a
                href={whatsappLink("Hi Online Tech Uganda, I'd like to know more about your computer courses.")}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex items-center gap-2 border border-white px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-ink-900"
              >
                <MessageCircle size={16} /> Ask a question
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mb-4 mt-9 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/10 px-4 py-4 text-center ring-1 ring-white/20 backdrop-blur-sm">
                <p className="font-display text-[30px] leading-none">{s.value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/65">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When the next classes start — the first thing under the banner,
          because a date is the one thing on this page that runs out. */}
      <section className="container-page space-y-3 pt-8 sm:pt-10">
        <IntakeAdverts />
        {/* The course offers that used to rotate on the home page. */}
        <PromoBanners zone="academy" />
      </section>

      {/* The four study tracks, moved off the home page so that page stays a
          shop and this one carries the teaching. */}
      {/* The hero ends on a hard colour edge, so this needs real clearance —
          at pt-10 the heading read as part of the banner above it. */}
      <section className="container-page pt-12 sm:pt-16">
        <LearningBrochures />
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="container-page py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            // A picture each, because four white cards with a small orange
            // glyph read as a diagram of the process rather than an invitation
            // into it. Each one shows the step actually happening.
            {
              icon: Smartphone,
              title: "Pick your course",
              body: "Enrol on the full taught programme, or unlock single lessons and study at your own pace.",
              img: "/web/photo-1516321318423-f06f85e504b3.webp",
            },
            {
              icon: Building2,
              title: "Physical or online",
              body: "Attend classes at our Kampala centre, or learn fully online — same tutors, same certificate.",
              img: "/hero/hero-6.webp",
            },
            {
              icon: Wallet,
              title: "Pay by Mobile Money",
              body: "MTN MoMo or Airtel Money. We confirm your place and send your materials.",
              img: "/web/photo-1609091839311-d5365f9ff1c5.webp",
            },
            {
              icon: Award,
              title: "Finish & get certified",
              body: "Complete the course with us and we issue your certificate, signed and stamped.",
              img: "/hero/hero-5.webp",
            },
          ].map((s, i) => (
            <div
              key={s.title}
              className="card-lift relative flex flex-col overflow-hidden bg-white"
            >
              <span className="relative block h-28 w-full overflow-hidden bg-ink-50">
                <SafeImage
                  src={s.img}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink-900/55 to-transparent" />
                <span className="absolute right-3 top-2 text-3xl font-black text-white/45">
                  {i + 1}
                </span>
              </span>

              {/* The badge sits on the seam so the photo and the text below read
                  as one card rather than a picture with a caption. It has to
                  live outside the image, whose overflow-hidden — there to keep
                  the photo inside the rounded corner — was slicing it in half.
                  7rem is the image height, less half the badge. */}
              <span className="absolute left-4 top-[5.625rem] flex h-11 w-11 items-center justify-center bg-white text-brand-600 ring-1 ring-ink-600/10">
                <s.icon size={21} />
              </span>
              <span className="flex flex-1 flex-col p-5 pt-7">
                <h2 className="text-[22px] leading-tight text-ink-900">{s.title}</h2>
                <p className="mt-1 text-sm text-ink-700/70">{s.body}</p>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live classes ───────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="container-page pb-4">
          <div className="overflow-hidden bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-600/10 bg-ink-50/70 px-5 py-3.5">
              <h2 className="inline-flex items-center gap-2 text-[26px] leading-tight text-ink-900">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                Live classes
              </h2>
              <span className="text-xs font-semibold text-ink-700/60">
                {upcoming.length} upcoming
              </span>
            </div>
            <ul className="divide-y divide-ink-600/5">
              {upcoming.slice(0, 4).map((lc) => (
                <li key={lc.title} className="flex flex-wrap items-center gap-3 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-red-50 text-red-600">
                    <Radio size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink-900">{lc.title}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-700/65">
                      <CalendarClock size={13} /> {fmtDate(lc.date)}
                      <span>· {lc.mode} · {lc.durationMins} min</span>
                      {lc.host && <span>· with {lc.host}</span>}
                    </p>
                  </div>
                  <span className="shrink-0 font-extrabold text-brand-600">
                    {lc.price ? ugx(lc.price) : "Free"}
                  </span>
                  <a
                    href={whatsappLink(`Hi, I'd like to join the live class: ${lc.title} (${fmtDate(lc.date)}).`)}
                    target="_blank"
                    rel="noreferrer"
                    className="press shrink-0 rounded-[3px] bg-brand-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-600"
                  >
                    Reserve a seat
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Courses ────────────────────────────────────────────── */}
      <section id="courses" className="container-page scroll-mt-24 py-8">
        <SectionHeading
          title="Our Courses"
          href="/learn/dashboard"
          linkLabel="My Learning →"
          className="mb-4"
        />
        <Link
          href="/community"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-brand-200 bg-brand-50 p-4 transition hover:"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
              <MessageCircle size={20} />
            </span>
            <span>
              <span className="block font-extrabold text-ink-900">Student Community</span>
              <span className="block text-sm text-ink-700/70">
                Stuck on something? Ask other students and our trainers.
              </span>
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white">
            Open community →
          </span>
        </Link>
        <CourseBrowser courses={courses} withNotes={withNotes} />
      </section>

      {/* ── Certificate ────────────────────────────────────────── */}
      <section className="container-page py-8">
        <div className="grid items-center gap-6 overflow-hidden bg-white p-6 sm:grid-cols-[1fr_auto] sm:p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-green-700">
              <Award size={13} /> On completion
            </span>
            <h2 className="mt-3 text-[26px] leading-tight text-ink-900 sm:text-[32px]">
              Finish the course, get your certificate
            </h2>
            <p className="mt-2 max-w-lg text-sm text-ink-700/70">
              Every course ends with a short quiz. Pass it and you can download an Online Tech
              Uganda certificate carrying your name and the course title — something real to attach
              to a job application.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                "Your full name on it",
                "Course title & completion date",
                "Unique certificate number",
                "Issued & signed by the school",
              ].map((x) => (
                <li key={x} className="flex items-center gap-2 text-sm text-ink-700/80">
                  <Check size={15} className="shrink-0 text-green-600" />
                  {x}
                </li>
              ))}
            </ul>
          </div>

          {/* Mini certificate mock */}
          <div className="w-full max-w-[260px] justify-self-center rounded-[3px] border-4 border-double border-gold-400/60 bg-gradient-to-br from-white to-gold-50 p-4 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-700/50">
              Certificate of Completion
            </p>
            <p className="mt-2 text-[10px] text-ink-700/60">This certifies that</p>
            <p className="mt-1 border-b border-ink-600/15 pb-1 text-sm font-extrabold text-ink-900">
              Your Name
            </p>
            <p className="mt-2 text-[10px] leading-snug text-ink-700/60">
              has successfully completed
              <br />
              <b className="text-ink-800">Microsoft Office</b>
            </p>
            <span className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
              <Award size={16} />
            </span>
            <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-brand-600">
              Online Tech Uganda
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="container-page py-8">
        <h2 className="text-[26px] leading-tight text-ink-900">Common questions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group bg-white p-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 font-bold text-ink-900">
                {f.q}
                <span className="shrink-0 text-brand-500 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-700/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Group / school enquiry ─────────────────────────────── */}
      <section className="container-page py-10">
        <div className="bg-ink-700 px-6 py-10 text-center text-white sm:px-8">
          <h2 className="text-[26px] leading-tight">Training a school, church or team?</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/85">
            We run group training at your premises or ours, with discounted rates for classes and
            staff teams. Tell us how many learners and what they need to learn.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Button
              href={whatsappLink("Hi, I'd like a quote for group computer training.")}
              external
              variant="primary"
            >
              Get a group quote
            </Button>
            <Link
              href="/contact"
              className="press rounded-[3px] border border-white/25 px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
          <p className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs text-white/70">
            <Icon name="learn" size={14} /> Also available: on-site training in Kampala and nearby districts.
          </p>
        </div>
      </section>
      <ExploreMore exclude={["/learn"]} />

      <div className="container-page pb-10">
        <ContactOptions
          subject={"Course enquiry"}
          heading={"Questions about a course?"}
          note={"Ask about intakes, fees, timetables or anything else before you enrol."}
        />
      </div>

    </>
  );
}
