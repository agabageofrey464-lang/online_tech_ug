"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Copy,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
  Smartphone,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { courses, REGISTRATION_FEE, courseTotal } from "@/lib/data";
import { site, ugx } from "@/lib/site";

/**
 * Where a registration ends.
 *
 * It used to end in WhatsApp, which made the message the receipt — and made
 * everyone who registered a message the owner had to answer by hand. This
 * page is the receipt instead: a reference, what they owe, how to pay it,
 * and what happens next. Nothing here needs the owner to do anything.
 */
export default function RegisteredPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense fallback={<div className="container-page py-14 text-center text-sm text-ink-700/60">Loading…</div>}>
      <Confirmation slug={slug} />
    </Suspense>
  );
}

function Confirmation({ slug }: { slug: string }) {
  const search = useSearchParams();
  const reference = search.get("ref") ?? "";
  const emailed = search.get("emailed") === "1";
  const name = search.get("name") ?? "";

  const course = courses.find((c) => c.slug === slug);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const total = course ? courseTotal(course) : 0;
  const first = name.split(" ")[0];

  return (
    <div className="container-page py-8 print:py-0">
      <div className="mb-5 print:hidden">
        <Breadcrumbs
          items={[
            { label: "Learn", href: "/learn" },
            ...(course ? [{ label: course.title, href: `/learn/${course.slug}` }] : []),
            { label: "Registered" },
          ]}
        />
      </div>

      <div className="mx-auto max-w-2xl">
        {/* The confirmation itself */}
        <div className="overflow-hidden rounded-card border border-green-200 bg-white shadow-sm">
          <div className="bg-green-600 px-6 py-7 text-center text-white">
            <CheckCircle2 className="mx-auto" size={46} strokeWidth={2.2} />
            <h1 className="mt-2.5 text-2xl font-black">
              {first ? `You're registered, ${first}!` : "You're registered!"}
            </h1>
            <p className="mx-auto mt-1 max-w-md text-sm text-white/90">
              {course ? course.title : "Your course"} — your place is held. Nothing more is
              needed from you right now.
            </p>
          </div>

          {/* Reference */}
          {reference && (
            <div className="border-b border-ink-600/10 bg-brand-50/50 px-6 py-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-700/55">
                Your reference
              </p>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(reference).then(() => setCopied(true)).catch(() => {});
                }}
                className="press mt-1 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xl font-black tracking-wide text-brand-700 shadow-sm print:shadow-none"
              >
                {reference}
                <Copy size={15} className="text-ink-700/40 print:hidden" />
              </button>
              <p className="mt-1.5 text-[11.5px] text-ink-700/60">
                {copied ? "Copied." : "Quote this when you pay, call or visit."}
              </p>
            </div>
          )}

          <div className="p-6">
            {/* What it costs */}
            {course && (
              <>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-700/55">
                  What you&apos;re paying
                </h2>
                <dl className="mt-2.5 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-700/70">Registration fee (one-time)</dt>
                    <dd className="font-semibold tabular-nums text-ink-900">
                      {ugx(REGISTRATION_FEE)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-700/70">
                      Training fee
                      {course.durationMonths ? (
                        <span className="block text-[11px] text-ink-700/45">
                          {course.durationMonths} month{course.durationMonths > 1 ? "s" : ""} of
                          training
                        </span>
                      ) : null}
                    </dt>
                    <dd className="font-semibold tabular-nums text-ink-900">
                      {ugx(course.trainingFee ?? 0)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-ink-600/10 pt-2">
                    <dt className="font-bold text-ink-900">Total</dt>
                    <dd className="text-xl font-black tabular-nums text-brand-600">{ugx(total)}</dd>
                  </div>
                </dl>
              </>
            )}

            {/* How to pay */}
            <h2 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-ink-700/55">
              How to pay
            </h2>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-600/10 bg-ink-50/50 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
                  <Smartphone size={15} className="text-brand-500" /> Mobile Money
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700/75">
                  Send to <b className="text-ink-900">{site.phoneDisplay}</b> or{" "}
                  <b className="text-ink-900">{site.phoneAlt}</b>, in the name of Online Tech
                  Uganda. MTN or Airtel.
                </p>
              </div>
              <div className="rounded-xl border border-ink-600/10 bg-ink-50/50 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
                  <MapPin size={15} className="text-brand-500" /> At our office
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700/75">
                  Pay in person at our {site.address} office and register at the counter with
                  your reference.
                </p>
              </div>
            </div>

            {/* What happens next */}
            <h2 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-ink-700/55">
              What happens next
            </h2>
            <ol className="mt-2.5 space-y-2.5">
              {[
                "Pay the fee by Mobile Money, or come to the office.",
                "We confirm your payment — usually the same working day.",
                "You get an email with your unlock code and your class timetable.",
                "Enter the code on the course page and every lesson opens.",
              ].map((stepText, i) => (
                <li key={stepText} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[12px] font-black text-white">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-sm text-ink-700/80">{stepText}</span>
                </li>
              ))}
            </ol>

            {/* Receipt in writing */}
            <p className="mt-6 flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3 text-[13px] text-ink-700/80">
              <Mail size={15} className="mt-0.5 shrink-0 text-brand-600" />
              {emailed
                ? "We've emailed you a copy of this, with your reference. Check your inbox — and your spam folder, just in case."
                : "Keep this page or print it. Your reference is how we find you if you call or visit."}
            </p>

            {/* Reaching us — offered, never the way in */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-ink-600/10 pt-5 text-[13px] text-ink-700/70">
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-brand-500" /> {site.phoneDisplay}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-brand-500" /> {site.phoneAlt}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-brand-500" /> {site.email}
              </span>
            </div>
          </div>
        </div>

        {/* Where to go now */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row print:hidden">
          <Link
            href={course ? `/learn/${course.slug}` : "/learn"}
            className="press flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600"
          >
            <GraduationCap size={16} /> Back to my course
          </Link>
          <Link
            href="/academy"
            className="press flex flex-1 items-center justify-center gap-2 rounded-lg border border-ink-600/20 bg-white px-5 py-3 text-sm font-bold text-ink-800 hover:bg-ink-50"
          >
            <CalendarDays size={16} /> My academy
          </Link>
          <button
            onClick={() => window.print()}
            className="press flex items-center justify-center gap-2 rounded-lg border border-ink-600/20 bg-white px-5 py-3 text-sm font-bold text-ink-800 hover:bg-ink-50"
          >
            <Printer size={16} /> Print
          </button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-700/50 print:hidden">
          <BadgeCheck size={13} className="text-green-600" />
          Registered with Online Tech Uganda — certificate issued on completion.
        </p>
      </div>
    </div>
  );
}
