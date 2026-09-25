"use client";

import { useEffect, useRef, useState } from "react";
import { loadImg, todayISO } from "@/lib/doc-kit";
import { buildCatalogue } from "@/lib/course-catalogue-pdf";
import { buildServices } from "@/lib/services-pdf";
import type { AdminCourse } from "@/lib/api";

/**
 * The course list, as a PDF to hand a prospective student.
 *
 * Someone deciding what to study wants the whole menu in front of them —
 * what it costs, how long it runs, what is covered — not a page they have to
 * scroll on a phone with no data. This prints that on the same letterhead as
 * every other document the business sends.
 *
 * Prices come from the API, which is the same table registration is validated
 * against, so a figure printed here is a figure a student can actually enrol
 * at.
 */

const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

type Props = { courses: AdminCourse[] };

export function CourseCatalogue({ courses }: Props) {
  const logo = useRef<HTMLImageElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [intake, setIntake] = useState("");

  useEffect(() => {
    loadImg("/logo-mark.png").then((i) => (logo.current = i));
  }, []);

  async function build() {
    setBusy(true);
    try {
      const doc = buildCatalogue(courses, { intake, logo: logo.current });
      doc.save(`Online-Tech-Uganda-Courses-${todayISO()}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  async function buildSvc() {
    setBusy(true);
    try {
      const doc = buildServices({ logo: logo.current });
      doc.save(`Online-Tech-Uganda-Services-${todayISO()}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
      <h2 className="text-base font-extrabold text-ink-600">Course list for students</h2>
      <p className="mt-1 text-sm text-ink-600/65">
        Two separate lists on your letterhead: course fees for students, and project prices
        for a client pricing a website, app or system.
      </p>

      <label className="mt-4 block text-sm font-semibold text-ink-700">
        Next intake <span className="font-normal text-ink-600/50">(optional)</span>
        <input
          value={intake}
          onChange={(e) => setIntake(e.target.value)}
          placeholder="e.g. 15 October 2026"
          className="mt-1 w-full max-w-xs rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={build}
          disabled={busy || courses.length === 0}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? "Building…" : "Course fees (PDF)"}
        </button>
        <button
          onClick={buildSvc}
          disabled={busy}
          className="rounded-lg bg-ink-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-ink-600 disabled:opacity-60"
        >
          {busy ? "Building…" : "Software & IT services (PDF)"}
        </button>
      </div>

      <p className="mt-3 text-[12px] text-ink-600/55">
        Fees come from the courses in your database — the same figures a student is charged when
        they register, so this cannot quote a price you do not offer.
      </p>
    </section>
  );
}
