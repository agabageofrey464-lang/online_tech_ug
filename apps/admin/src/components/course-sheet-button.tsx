"use client";

import { useState } from "react";
import { loadImg, todayISO } from "@/lib/doc-kit";
import { buildAllCourseSheets, buildCourseSheet, sheetFileName } from "@/lib/course-sheet-pdf";
import type { AdminCourse } from "@/lib/api";

/** The intake typed into the documents box above, so every sheet carries the same date. */
const intakeNow = () => {
  try {
    return localStorage.getItem("otu_intake") ?? "";
  } catch {
    return "";
  }
};

/**
 * "Download course PDF" — the one course's own sheet, to send to the person
 * who asked about it: what it covers, how long it runs, the fee and how it is
 * paid, and how to register.
 */
export function CourseSheetButton({ course }: { course: AdminCourse }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        try {
          const logo = await loadImg("/logo-lockup-dark.png");
          buildCourseSheet(course, { logo, intake: intakeNow() }).save(sheetFileName(course));
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy}
      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
    >
      {busy ? "Building…" : "⬇ Download course PDF"}
    </button>
  );
}

/** Every course's sheet in a single file, one page each. */
export function AllCourseSheetsButton({ courses }: { courses: AdminCourse[] }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        try {
          const logo = await loadImg("/logo-lockup-dark.png");
          buildAllCourseSheets(courses, { logo, intake: intakeNow() }).save(`Online-Tech-Uganda-All-Course-Details-${todayISO()}.pdf`);
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy || courses.length === 0}
      className="rounded-lg border border-brand-500 px-5 py-2.5 text-sm font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-60"
    >
      {busy ? "Building…" : `All ${courses.length} course sheets in one PDF`}
    </button>
  );
}
