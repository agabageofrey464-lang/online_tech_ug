"use client";

import { useEffect, useRef, useState } from "react";
import { COURSES, REGISTRATION_FEE, courseTotal, ugx, type AdminCourse } from "@/lib/courses";

/**
 * Printable student enrolment forms.
 *
 * The owner generates a form for a course, prints or shares it, and the student
 * fills it in by hand before starting. Nothing is public — forms exist only
 * where an administrator creates them.
 */

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function EnrolmentFormsPage() {
  const [idx, setIdx] = useState(0);
  const [copies, setCopies] = useState(1);
  const [busy, setBusy] = useState(false);
  const logo = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    loadImg("/logo-mark.png").then((i) => (logo.current = i));
  }, []);

  const course = COURSES[idx];

  async function generate(print: boolean, all = false) {
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const list: AdminCourse[] = all ? COURSES : Array(copies).fill(course);

      list.forEach((c, i) => {
        if (i > 0) doc.addPage();
        drawForm(doc, c, logo.current);
      });

      if (print) {
        doc.autoPrint();
        window.open(doc.output("bloburl") as unknown as string, "_blank");
      } else {
        const name = all ? "All-Courses" : course.title.replace(/[^\w]+/g, "-");
        doc.save(`Enrolment-Form-${name}.pdf`);
      }
    } finally {
      setBusy(false);
    }
  }

  const input =
    "mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Enrolment Forms</h1>
        <p className="text-sm text-ink-600/60">
          Print a registration form for a course and give it to a new student to fill in. Only you
          can create these — they are not on the public site.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-ink-600">Choose a course</h2>

          <label className="mt-4 block text-sm font-semibold text-ink-700">Course</label>
          <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} className={input}>
            {COURSES.map((c, i) => (
              <option key={c.title} value={i}>
                {c.title} — {c.months} month{c.months > 1 ? "s" : ""} — {ugx(courseTotal(c))}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm font-semibold text-ink-700">
            How many blank copies?
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={copies}
            onChange={(e) => setCopies(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
            className={input}
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => generate(true)}
              disabled={busy}
              className="rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Preparing…" : "🖨️ Print form"}
            </button>
            <button
              onClick={() => generate(false)}
              disabled={busy}
              className="rounded-md border border-ink-600/20 px-6 py-2.5 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
            >
              ⬇️ Download PDF
            </button>
            <button
              onClick={() => generate(false, true)}
              disabled={busy}
              className="rounded-md border border-ink-600/20 px-6 py-2.5 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
            >
              📚 All {COURSES.length} courses
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-600/50">
            Download gives you a file you can send on WhatsApp or email.
          </p>
        </section>

        <section className="h-fit rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-ink-600">On this form</h2>
          <p className="mt-1 text-xs text-ink-600/60">{course.title}</p>

          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-600/65">Duration</dt>
              <dd className="font-semibold text-ink-800">
                {course.months} month{course.months > 1 ? "s" : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-600/65">Registration</dt>
              <dd className="font-semibold tabular-nums text-ink-800">{ugx(REGISTRATION_FEE)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-600/65">Training</dt>
              <dd className="font-semibold tabular-nums text-ink-800">{ugx(course.trainingFee)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-ink-600/10 pt-1.5">
              <dt className="font-bold text-ink-700">Total</dt>
              <dd className="font-extrabold tabular-nums text-brand-600">{ugx(courseTotal(course))}</dd>
            </div>
          </dl>

          <p className="mt-4 text-xs font-semibold text-ink-700">The student fills in:</p>
          <ul className="mt-1.5 space-y-1 text-xs text-ink-600/70">
            {[
              "Personal details & ID / NIN",
              "Contact and home address",
              "Next of kin",
              "Education background",
              "Study mode — physical or online",
              "Payment record & balance",
              "Declaration and signature",
            ].map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ─────────────────────────── PDF layout ─────────────────────────── */

type Doc = import("jspdf").jsPDF;

function drawForm(doc: Doc, course: AdminCourse, logo: HTMLImageElement | null) {
  const W = 210;
  const M = 14; // page margin
  const cx = W / 2;
  let y = 12;

  // ── Header band
  doc.setFillColor(40, 35, 99);
  doc.rect(0, 0, W, 30, "F");
  if (logo) doc.addImage(logo, "PNG", M, 4, 50, 18);

  if (!logo) {
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("ONLINE TECH UGANDA", M, 14);
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.6);
  doc.setTextColor(215, 240, 247);
  doc.text("Computer Training  ·  Kampala  ·  +256 756 839 270  ·  onlinetechug@gmail.com", M, 26.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("STUDENT ENROLMENT FORM", W - M, 14, { align: "right" });

  y = 38;

  // ── Course box
  doc.setFillColor(253, 243, 236);
  doc.setDrawColor(241, 90, 41);
  doc.setLineWidth(0.4);
  doc.rect(M, y, W - M * 2, 22, "FD");

  doc.setTextColor(40, 35, 99);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(course.title, M + 4, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text(
    `Duration: ${course.months} month${course.months > 1 ? "s" : ""}   |   Registration: ${ugx(REGISTRATION_FEE)}   |   Training: ${ugx(course.trainingFee)}`,
    M + 4,
    y + 14,
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(241, 90, 41);
  doc.text(`TOTAL: ${ugx(courseTotal(course))}`, M + 4, y + 19.5);

  y += 28;

  // ── Helpers
  const sectionTitle = (label: string) => {
    doc.setFillColor(40, 35, 99);
    doc.rect(M, y, W - M * 2, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(label.toUpperCase(), M + 3, y + 4.2);
    y += 9;
  };

  /** A labelled writing line. `span` is a fraction of the usable width. */
  const field = (label: string, span = 1, gapAfter = true) => {
    const usable = W - M * 2;
    const w = usable * span - (span < 1 ? 4 : 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text(label, M + curX, y);
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(0.25);
    doc.line(M + curX, y + 5.5, M + curX + w, y + 5.5);
    curX += w + (span < 1 ? 4 : 0);
    if (gapAfter && curX >= usable - 2) {
      curX = 0;
      y += 11;
    }
  };

  let curX = 0;
  const row = () => {
    curX = 0;
  };

  // ── Student details
  sectionTitle("1. Student details");
  field("Full name (as on ID)", 1);
  field("Date of birth", 0.34);
  field("Gender", 0.3);
  field("NIN / ID number", 0.36);
  row();
  field("Phone number", 0.5);
  field("Alternative phone", 0.5);
  row();
  field("Email address", 0.5);
  field("District / Town", 0.5);
  row();
  field("Home address / Village", 1);

  // ── Next of kin
  sectionTitle("2. Next of kin / guardian");
  field("Full name", 0.5);
  field("Relationship", 0.5);
  row();
  field("Phone number", 0.5);
  field("Occupation", 0.5);

  // ── Education
  sectionTitle("3. Education background");
  field("Highest level completed", 0.5);
  field("School / Institution", 0.5);
  row();
  field("Do you own a computer?  (Yes / No)", 0.5);
  field("Previous computer training?  (Yes / No)", 0.5);

  // ── Study arrangement
  sectionTitle("4. Study arrangement");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text("Mode:", M, y + 3);
  const box = (x: number, label: string) => {
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.rect(x, y, 4, 4);
    doc.text(label, x + 6, y + 3.2);
  };
  box(M + 14, "Physical (Kampala centre)");
  box(M + 74, "Online");
  y += 9;
  field("Preferred start date", 0.34);
  field("Preferred days", 0.32);
  field("Preferred time", 0.34);

  // ── Payment
  sectionTitle("5. Payment record (office use)");
  field("Registration paid (UGX)", 0.34);
  field("Training paid (UGX)", 0.32);
  field("Balance (UGX)", 0.34);
  row();
  field("Payment method (MoMo / Airtel / Cash)", 0.5);
  field("Receipt / Transaction no.", 0.5);

  // ── Declaration
  sectionTitle("6. Declaration");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  const declaration = doc.splitTextToSize(
    "I confirm that the information above is true and correct. I understand that the registration fee is a one-time, non-refundable charge, and I agree to complete payment of the training fee as arranged with Online Tech Uganda. I agree to attend classes regularly and to observe the rules of the training centre.",
    W - M * 2,
  );
  doc.text(declaration, M, y + 3);
  y += declaration.length * 3.6 + 8;

  curX = 0;
  field("Student's signature", 0.5);
  field("Date", 0.5);
  row();
  field("Registered by (staff name)", 0.5);
  field("Date", 0.5);

  // ── Footer
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(M, 283, W - M, 283);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Online Tech Uganda  ·  www.onlinetechug.com  ·  Physical & online computer training", cx, 288, {
    align: "center",
  });
}
