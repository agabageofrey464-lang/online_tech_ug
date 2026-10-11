import jsPDF from "jspdf";
import {
  COMPANY,
  INK,
  MUTED,
  ORANGE,
  REGISTRATION_FEE,
  RULE,
  TEAL,
  TEAL_DARK,
  TEAL_PALE,
  logoPlate,
  long,
  paymentBand,
  todayISO,
} from "@/lib/doc-kit";
import { COURSES } from "@/lib/courses";
import type { AdminCourse } from "@/lib/api";

/**
 * One course, on one sheet, to send to the person who asked about it.
 *
 * The fee list answers "what do you teach and what does it cost". Once someone
 * has picked a course they ask a different set of questions — how long is it,
 * what exactly will I learn, what do I pay and when, how do I pay, how do I
 * start — and they want the answers as something they can forward to whoever
 * is paying. This is that: the course's own sheet, on the letterhead.
 *
 * Every figure comes from the course as the database holds it, which is what
 * registration charges, so the sheet cannot quote a fee we do not offer.
 */

const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

type Opts = { intake?: string; logo?: HTMLImageElement | string | null };

/** How many months the course runs, from the school's own list. */
function monthsFor(title: string): number | null {
  const t = title.toLowerCase();
  const exact = COURSES.find((c) => c.title.toLowerCase() === t);
  if (exact) return exact.months;
  // "Graphic Design (Photoshop, Illustrator & Canva)" is "Graphic Design" on the list.
  const loose = [...COURSES].sort((a, b) => b.title.length - a.title.length).find((c) => t.startsWith(c.title.toLowerCase()) || t.includes(c.title.toLowerCase()));
  return loose ? loose.months : null;
}

export const sheetFileName = (c: AdminCourse) => `Online-Tech-Uganda-${c.title.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "")}-Course.pdf`;

/** Add one course's sheet to `doc`, starting on its current page. */
function drawCourse(doc: jsPDF, c: AdminCourse, opts: Opts): void {
  const intake = (opts.intake ?? "").trim();
  const logo = opts.logo ?? null;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const right = W - M;
  const fill = (k: readonly number[]) => doc.setFillColor(k[0], k[1], k[2]);
  const col = (k: readonly number[]) => doc.setTextColor(k[0], k[1], k[2]);

  /* ── Letterhead ─────────────────────────────────────────────── */
  const HB = 30;
  fill(TEAL);
  doc.rect(0, 0, W, HB, "F");
  fill(TEAL_DARK);
  doc.triangle(W, 0, W, HB, W - 62, 0, "F");
  if (logo) {
    logoPlate(doc, logo, M, 7.5, 56, 13);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(COMPANY.name, M, 14);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(COMPANY.phone, right, 10.5, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(206, 235, 243);
  doc.text(COMPANY.phoneAlt, right, 15, { align: "right" });
  doc.text(COMPANY.email, right, 19.5, { align: "right" });
  doc.text(COMPANY.site, right, 24, { align: "right" });
  fill(ORANGE);
  doc.rect(0, HB, W, 1.8, "F");

  /* ── The course ─────────────────────────────────────────────── */
  let y = 40;
  col(ORANGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  doc.text("COURSE DETAILS", M, y);
  y += 7.5;

  col(TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  const title = (doc.splitTextToSize(c.title, W - M * 2) as string[]).slice(0, 2);
  title.forEach((line, i) => doc.text(line, M, y + i * 8));
  y += title.length * 8 - 2;

  if (c.blurb) {
    col(INK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.2);
    const blurb = (doc.splitTextToSize(c.blurb, W - M * 2) as string[]).slice(0, 3);
    blurb.forEach((line, i) => doc.text(line, M, y + 4 + i * 4.6));
    y += 4 + blurb.length * 4.6;
  }
  y += 3;

  /* ── At a glance: four facts in a row ───────────────────────── */
  const months = monthsFor(c.title);
  const facts: [string, string][] = [
    ["DURATION", months ? `${months} month${months > 1 ? "s" : ""}` : `${c.hours} hours`],
    ["LESSONS", `${c.lessons} lessons`],
    ["LEVEL", c.level || "All levels"],
    ["STUDY", "In class or online"],
  ];
  const fw = (W - M * 2 - 9) / 4;
  facts.forEach(([k, v], i) => {
    const x = M + i * (fw + 3);
    fill(TEAL_PALE);
    doc.roundedRect(x, y, fw, 15, 1.5, 1.5, "F");
    col(MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.4);
    doc.text(k, x + 3.5, y + 5.2);
    col(INK);
    doc.setFontSize(9.6);
    doc.text(v, x + 3.5, y + 11.2);
  });
  y += 21;

  /* ── Fees ───────────────────────────────────────────────────── */
  const total = Number(c.price_ugx);
  const training = Math.max(0, total - REGISTRATION_FEE);
  col(TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("COURSE FEE", M, y + 3);
  y += 6;

  const rows: [string, string, string][] = [
    ["Registration", "Paid once, when you join", ugx(REGISTRATION_FEE)],
    ["Training fee", months ? `For the ${months}-month programme` : "For the full programme", ugx(training)],
  ];
  rows.forEach(([k, note, v]) => {
    col(INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.2);
    doc.text(k, M + 3, y + 5.4);
    col(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.text(note, M + 44, y + 5.4);
    col(INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.6);
    doc.text(v, right - 3, y + 5.4, { align: "right" });
    y += 8;
    fill(RULE);
    doc.rect(M, y, W - M * 2, 0.2, "F");
  });
  fill(TEAL);
  doc.roundedRect(M, y + 1.5, W - M * 2, 11, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.6);
  doc.text("TOTAL — FULL PROGRAMME", M + 3, y + 8.6);
  doc.setFontSize(13);
  doc.text(ugx(total), right - 3, y + 9, { align: "right" });
  y += 16;
  col(MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.6);
  doc.text("Studying online, lessons can also be bought one at a time on the course page.", M, y + 2);
  y += 8;

  /* ── What you will learn ────────────────────────────────────── */
  const lessons = (c.syllabus ?? []).map((l) => l.title).filter(Boolean);
  if (lessons.length) {
    col(TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("WHAT YOU WILL LEARN", M, y + 3);
    y += 7;

    // Two columns, as many lessons as the sheet has room for above the
    // sections that must be on it: how to study, how to register, how to pay.
    const room = H - 108 - y;
    const LH = 4.5;
    const perCol = Math.max(3, Math.floor(room / LH));
    const shown = lessons.slice(0, perCol * 2);
    const half = Math.ceil(shown.length / 2);
    const cw = (W - M * 2 - 6) / 2;
    doc.setFontSize(8);
    shown.forEach((t, i) => {
      const colN = i < half ? 0 : 1;
      const row = i < half ? i : i - half;
      const x = M + colN * (cw + 6);
      col(ORANGE);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}.`, x, y + row * LH + 3);
      col(INK);
      doc.setFont("helvetica", "normal");
      const line = (doc.splitTextToSize(t, cw - 8) as string[])[0];
      doc.text(line, x + 7, y + row * LH + 3);
    });
    y += half * LH + 2;
    if (lessons.length > shown.length) {
      col(MUTED);
      doc.setFontSize(7.4);
      doc.text(`…and ${lessons.length - shown.length} more lessons.`, M, y + 2.5);
      y += 4;
    }
    y += 3;
  }

  /* ── What is included ───────────────────────────────────────── */
  fill(TEAL_PALE);
  doc.roundedRect(M, y, W - M * 2, 27, 2, 2, "F");
  col(TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.text("INCLUDED IN THE FEE", M + 4, y + 6);
  col(INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  [
    "Written notes you keep  ·  practical work on a real computer",
    "Attend at our Kampala centre, or online from anywhere — your choice",
    "A certificate issued by the school when you complete the course",
    "Trainers you can reach on WhatsApp while you study",
  ].forEach((line, i) => doc.text(`•  ${line}`, M + 4, y + 11.2 + i * 4.1));
  y += 32;

  /* ── How to start ───────────────────────────────────────────── */
  col(TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(intake ? `TO REGISTER — NEXT INTAKE ${intake.toUpperCase()}` : "TO REGISTER", M, y + 3);
  col(INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`1.  Register online at ${COMPANY.site}/learn/${c.slug}  — or call / WhatsApp ${COMPANY.phone}.`, M, y + 9);
  doc.text(`2.  Pay the registration fee of ${ugx(REGISTRATION_FEE)} by Mobile Money (details below) and send us the confirmation.`, M, y + 13.6);
  doc.text("3.  We confirm your place, your class times and how to join — in class or online.", M, y + 18.2);
  y += 23;

  paymentBand(doc, M, y, W - M * 2);

  /* ── Footer ─────────────────────────────────────────────────── */
  fill(RULE);
  doc.rect(M, H - 15, W - M * 2, 0.3, "F");
  col(MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.text(`${COMPANY.name}  ·  ${COMPANY.phone} / ${COMPANY.phoneAlt}  ·  ${COMPANY.email}`, M, H - 10.5);
  doc.text(`${c.title}  ·  fees as at ${long(todayISO())}`, M, H - 6.6);
}

/** One course's sheet. */
export function buildCourseSheet(course: AdminCourse, opts: Opts = {}): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawCourse(doc, course, opts);
  return doc;
}

/** Every course, a sheet each, in one file. */
export function buildAllCourseSheets(courses: AdminCourse[], opts: Opts = {}): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  [...courses]
    .sort((a, b) => a.title.localeCompare(b.title))
    .forEach((c, i) => {
      if (i > 0) doc.addPage();
      drawCourse(doc, c, opts);
    });
  return doc;
}
