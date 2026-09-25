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
  ZEBRA,
  logoPlate,
  long,
  paymentBand,
  todayISO,
} from "@/lib/doc-kit";
import type { AdminCourse } from "@/lib/api";

/**
 * The course list, as a PDF to hand a prospective student.
 *
 * The first version was a 22-row table. Every figure in it was right, but a
 * student reading it could not tell what anything cost — twenty-two rows of
 * small type with two money columns each is a spreadsheet, not a price list.
 *
 * So it is grouped by price instead. Eight fees, each shown once and large,
 * with the courses you get for it underneath. A student picks a budget, then
 * a course — which is the order they actually decide in.
 *
 * Kept out of the button so it can be rendered and checked without a browser.
 */

export const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

type Opts = { intake?: string; logo?: HTMLImageElement | string | null };

export function buildCatalogue(courses: AdminCourse[], opts: Opts = {}): jsPDF {
  const intake = opts.intake ?? "";
  const logo = opts.logo ?? null;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const right = W - M;

  const fill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const col = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);

  const header = (title: string, sub: string) => {
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

    col(TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(title, M, 43);
    col(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    doc.text(sub, M, 49);
  };

  const footer = (page: number, pages: number) => {
    fill(RULE);
    doc.rect(M, H - 15, W - M * 2, 0.3, "F");
    col(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.text(
      `${COMPANY.name}  ·  ${COMPANY.phone} / ${COMPANY.phoneAlt}  ·  ${COMPANY.email}`,
      M,
      H - 10.5,
    );
    doc.text(`Page ${page} of ${pages}`, right, H - 10.5, { align: "right" });
    doc.text(
      `Every fee below includes the one-off registration of ${ugx(REGISTRATION_FEE)}.  Prices as at ${long(todayISO())}.`,
      M,
      H - 6.6,
    );
  };

  header(
    "COURSE FEES",
    intake.trim()
      ? `What each course costs — next intake: ${intake.trim()}`
      : "What each course costs — physical or online, certificate on completion",
  );

  let y = 55;

  /* ── One course, one price ──────────────────────────────────── */
  // Grouping by fee saved space but made a reader work out which courses a
  // price belonged to. Each course now carries its own figure, with room
  // around it, which is what someone comparing two courses needs.
  const list = [...courses].sort((a, b) => Number(a.price_ugx) - Number(b.price_ugx));
  const ROW = 13;

  const listHead = () => {
    fill(TEAL);
    doc.rect(M, y, W - M * 2, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.6);
    doc.text("COURSE", M + 4, y + 5.4);
    doc.text("FULL PROGRAMME", right - 4, y + 5.4, { align: "right" });
    y += 8;
  };
  listHead();

  list.forEach((c, i) => {
    if (y + ROW > H - 24) {
      doc.addPage();
      header("COURSE FEES", "continued");
      y = 55;
      listHead();
    }

    if (i % 2 === 1) {
      fill(ZEBRA);
      doc.rect(M, y, W - M * 2, ROW, "F");
    }

    col(INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const name = (doc.splitTextToSize(c.title, 108) as string[]).slice(0, 2);
    name.forEach((line, n) => doc.text(line, M + 4, y + 5.6 + n * 4.4));

    col(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    doc.text(c.level, M + 4, y + 5.6 + name.length * 4.4);

    // The price, on its own, against the course it belongs to.
    col(TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(ugx(Number(c.price_ugx)), right - 4, y + 8, { align: "right" });

    y += ROW;
    fill(RULE);
    doc.rect(M, y, W - M * 2, 0.2, "F");
  });

  y += 6;

  /* ── What every student gets ────────────────────────────────── */
  if (y + 32 > H - 22) {
    doc.addPage();
    header("COURSE FEES", "continued");
    y = 55;
  }

  fill(TEAL_PALE);
  doc.roundedRect(M, y, W - M * 2, 28, 2, 2, "F");
  col(TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.text("EVERY COURSE INCLUDES", M + 4, y + 6);
  col(INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  [
    "Written notes you keep  ·  practical work on a real computer",
    "Attend at our Kampala centre, or online from anywhere — your choice",
    "A certificate issued by the school when you complete",
    "Trainers you can reach on WhatsApp while you study",
  ].forEach((line, i) => doc.text(`•  ${line}`, M + 4, y + 11.4 + i * 4.2));
  y += 34;

  if (y + 52 > H - 22) {
    doc.addPage();
    header("COURSE FEES", "continued");
    y = 55;
  }

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
  doc.text(`or register at ${COMPANY.site}/learn and we will confirm your place.`, M, y + 15);
  y += 21;

  paymentBand(doc, M, y, W - M * 2);

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    footer(p, pages);
  }

  return doc;
}
