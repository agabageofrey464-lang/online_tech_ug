import jsPDF from "jspdf";
import { COMPANY, INK, MUTED, ORANGE, RULE, TEAL, TEAL_DARK, ZEBRA, logoPlate, long, todayISO } from "@/lib/doc-kit";

/**
 * The list of students on an internship intake, as a sheet to share.
 *
 * It goes to the students themselves and to their supervisors, so it carries
 * what identifies a student to their own class — name, university, course and
 * field — and where each one stands. Phone numbers, emails and registration
 * numbers stay in the dashboard: a list passed round a WhatsApp group is not
 * the place for them.
 */

export type ListRow = { name: string; university: string; course: string; field: string; status: string };

export function buildInternList(rows: ListRow[], opts: { title: string; window: string; logo?: HTMLImageElement | string | null }): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const right = W - M;
  const fill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const ink = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);

  // number · name · university · course · field · status
  const X = [M + 3, M + 12, M + 62, M + 104, M + 141, right - 3];

  const head = () => {
    fill(TEAL);
    doc.rect(0, 0, W, 30, "F");
    fill(TEAL_DARK);
    doc.triangle(W, 0, W, 30, W - 62, 0, "F");
    fill(ORANGE);
    doc.rect(0, 30, W, 1.8, "F");
    if (opts.logo) logoPlate(doc, opts.logo, M, 7.5, 56, 13);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.4);
    doc.text("INDUSTRIAL TRAINING & INTERNSHIP", right, 12, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(206, 235, 243);
    doc.text(`${COMPANY.phone}  ·  ${COMPANY.site}/internship`, right, 18, { align: "right" });

    ink(TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(opts.title, M, 43);
    ink(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.text(`${opts.window}  ·  online  ·  ${rows.length} student${rows.length === 1 ? "" : "s"}  ·  as at ${long(todayISO())}`, M, 49);

    fill(TEAL);
    doc.rect(M, 54, W - M * 2, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.4);
    ["#", "STUDENT", "UNIVERSITY", "COURSE", "FIELD"].forEach((t, i) => doc.text(t, X[i], 59.4));
    doc.text("STATUS", X[5], 59.4, { align: "right" });
  };

  head();
  let y = 62;
  const ROW = 11;
  rows.forEach((r, i) => {
    if (y + ROW > H - 20) {
      doc.addPage();
      head();
      y = 62;
    }
    if (i % 2 === 1) {
      fill(ZEBRA);
      doc.rect(M, y, W - M * 2, ROW, "F");
    }
    ink(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(String(i + 1), X[0], y + 6.6);
    ink(INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.8);
    doc.text((doc.splitTextToSize(r.name, 48) as string[])[0], X[1], y + 6.6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.6);
    const two = (t: string, w: number, x: number) => {
      const lines = (doc.splitTextToSize(t || "—", w) as string[]).slice(0, 2);
      lines.forEach((l, n) => doc.text(l, x, y + (lines.length === 1 ? 6.6 : 4.8) + n * 3.4));
    };
    two(r.university, 40, X[2]);
    two(r.course, 35, X[3]);
    two(r.field, 34, X[4]);
    const confirmed = /confirmed/i.test(r.status);
    ink(confirmed ? [0, 130, 70] : /declined/i.test(r.status) ? [190, 60, 40] : MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.4);
    doc.text(r.status.toUpperCase(), X[5], y + 6.6, { align: "right" });
    y += ROW;
    fill(RULE);
    doc.rect(M, y, W - M * 2, 0.2, "F");
  });

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    ink(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.text(`${COMPANY.name}  ·  ${COMPANY.phone} / ${COMPANY.phoneAlt}  ·  ${COMPANY.email}`, M, H - 9);
    doc.text(`Page ${p} of ${pages}`, right, H - 9, { align: "right" });
  }
  return doc;
}
