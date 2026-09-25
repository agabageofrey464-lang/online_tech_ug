import jsPDF from "jspdf";
import {
  COMPANY,
  INK,
  MOMO,
  MUTED,
  ORANGE,
  REGISTRATION_FEE,
  RULE,
  TEAL,
  TEAL_DARK,
  TEAL_PALE,
  ZEBRA,
  long,
  todayISO,
} from "@/lib/doc-kit";
import type { AdminCourse } from "@/lib/api";

/**
 * The course list, as a PDF to hand a prospective student.
 *
 * Kept out of the button so it can be rendered and checked without a browser —
 * a document nobody has looked at is a document nobody should send.
 */

export const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

export function buildCatalogue(
  courses: AdminCourse[],
  opts: { intake?: string; logo?: HTMLImageElement | null } = {},
): jsPDF {
  const intake = opts.intake ?? "";
  const logo = { current: opts.logo ?? null };

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 14;
    const right = W - M;

    const fill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const col = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);

    /* ── Letterhead, repeated on every page ─────────────────── */
    const header = (title: string, sub: string) => {
      const HB = 32;
      fill(TEAL);
      doc.rect(0, 0, W, HB, "F");
      fill(TEAL_DARK);
      doc.triangle(W, 0, W, HB, W - 66, 0, "F");

      if (logo.current) {
        doc.addImage(logo.current, "PNG", M, 5.5, 52, 19);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(255, 255, 255);
        doc.text(COMPANY.name, M, 15);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(COMPANY.phone, right, 11, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.4);
      doc.setTextColor(206, 235, 243);
      doc.text(COMPANY.phoneAlt, right, 15.6, { align: "right" });
      doc.text(COMPANY.email, right, 20.2, { align: "right" });
      doc.text(`${COMPANY.site}  ·  ${COMPANY.address}`, right, 24.8, { align: "right" });

      fill(ORANGE);
      doc.rect(0, HB, W, 1.8, "F");

      col(TEAL);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(19);
      doc.text(title, M, 45);
      col(MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.4);
      doc.text(sub, M, 50.6);
    };

    /* ── Page furniture ─────────────────────────────────────── */
    const footer = (page: number, pages: number) => {
      fill(RULE);
      doc.rect(M, H - 16, W - M * 2, 0.3, "F");
      col(MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.text(
        `${COMPANY.name}  ·  ${COMPANY.phone} / ${COMPANY.phoneAlt}  ·  ${COMPANY.email}`,
        M,
        H - 11,
      );
      doc.text(`Page ${page} of ${pages}`, right, H - 11, { align: "right" });
      doc.text(`Prices valid as at ${long(todayISO())}`, M, H - 7.2);
    };

    /* ── Page 1 header ──────────────────────────────────────── */
    header(
      "COURSE LIST & FEES",
      intake.trim()
        ? `Choose your course — next intake: ${intake.trim()}`
        : "Choose your course — physical or online, certificate on completion",
    );

    /* ── How it works, so nobody has to ask ─────────────────── */
    let y = 57;
    fill(TEAL_PALE);
    doc.roundedRect(M, y, W - M * 2, 19, 2, 2, "F");
    col(TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.4);
    doc.text("HOW IT WORKS", M + 4, y + 6);
    col(INK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.text(
      `1. Pick a course below.    2. Pay registration of ${ugx(REGISTRATION_FEE)} (once) plus the training fee.`,
      M + 4,
      y + 11.4,
    );
    doc.text(
      `3. Pay by MTN ${MOMO.mtn}  or Airtel ${MOMO.airtel}    4. We confirm and you start.`,
      M + 4,
      y + 15.8,
    );
    y += 25;

    /* ── Table ──────────────────────────────────────────────── */
    const COLS = { n: M + 2, course: M + 9, level: 96, weeks: 122, train: 146, total: right - 2 };

    const tableHead = () => {
      fill(TEAL);
      doc.rect(M, y, W - M * 2, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.6);
      doc.text("#", COLS.n, y + 5.4);
      doc.text("COURSE", COLS.course, y + 5.4);
      doc.text("LEVEL", COLS.level, y + 5.4);
      doc.text("LESSONS", COLS.weeks, y + 5.4);
      doc.text("TRAINING", COLS.train, y + 5.4);
      doc.text("TOTAL", COLS.total, y + 5.4, { align: "right" });
      y += 8;
    };
    tableHead();

    const sorted = [...courses].sort((a, b) => Number(a.price_ugx) - Number(b.price_ugx));

    sorted.forEach((c, i) => {
      // The blurb wraps, so a row is as tall as it needs to be.
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      const blurb = doc.splitTextToSize(c.blurb || "", 68) as string[];
      // The title column stops where LEVEL begins; anything wider collides
      // with it, which is what "Web Development (HTML, CSS, JavaScript &
      // WordPress)" was doing.
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      const name = doc.splitTextToSize(c.title, 68) as string[];
      const rowH = Math.max(11, 3.5 + name.length * 4 + blurb.length * 3);

      if (y + rowH > H - 24) {
        doc.addPage();
        header("COURSE LIST & FEES", "continued");
        y = 57;
        tableHead();
      }

      if (i % 2 === 1) {
        fill(ZEBRA);
        doc.rect(M, y, W - M * 2, rowH, "F");
      }

      const total = Number(c.price_ugx);
      const training = Math.max(0, total - REGISTRATION_FEE);

      col(MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(String(i + 1), COLS.n, y + 5);

      col(INK);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      doc.text(name, COLS.course, y + 5);

      if (blurb.length) {
        col(MUTED);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(blurb, COLS.course, y + 5 + name.length * 4);
      }

      col(MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.4);
      doc.text(c.level || "Beginner", COLS.level, y + 5);
      doc.text(`${c.lessons} lessons`, COLS.weeks, y + 5);
      doc.text(`${c.hours} hrs`, COLS.weeks, y + 8.6);

      col(INK);
      doc.setFontSize(7.6);
      doc.text(ugx(training), COLS.train, y + 5);

      col(TEAL);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.6);
      doc.text(ugx(total), COLS.total, y + 5, { align: "right" });

      y += rowH;
      fill(RULE);
      doc.rect(M, y, W - M * 2, 0.2, "F");
    });

    /* ── What every student gets ────────────────────────────── */
    if (y + 40 > H - 24) {
      doc.addPage();
      header("COURSE LIST & FEES", "continued");
      y = 57;
    } else {
      y += 6;
    }

    fill(TEAL_PALE);
    doc.roundedRect(M, y, W - M * 2, 30, 2, 2, "F");
    col(TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.4);
    doc.text("EVERY COURSE INCLUDES", M + 4, y + 6);
    col(INK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    [
      "Written notes you keep  ·  practical work on a real computer",
      "Attend at our Kampala centre, or online from anywhere — your choice",
      "A certificate issued by the school when you complete",
      "Trainers you can reach on WhatsApp while you study",
    ].forEach((line, i) => {
      doc.text(`•  ${line}`, M + 4, y + 11.6 + i * 4.4);
    });
    y += 36;

    /* ── How to register ────────────────────────────────────── */
    if (y + 26 < H - 24) {
      col(TEAL);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("TO REGISTER", M, y + 4);
      col(INK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        `Call or WhatsApp ${COMPANY.phone} / ${COMPANY.phoneAlt}, visit us in ${COMPANY.address},`,
        M,
        y + 10,
      );
      doc.text(
        `or register online at ${COMPANY.site}/learn and we will confirm your place.`,
        M,
        y + 15,
      );
    }

    /* ── Numbering, now that the page count is known ────────── */
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      footer(p, pages);
    }


  return doc;
}
