import jsPDF from "jspdf";
import {
  COMPANY,
  INK,
  MUTED,
  ORANGE,
  paymentBand,
  RULE,
  TEAL,
  TEAL_DARK,
  TEAL_PALE,
  ZEBRA,
  long,
  todayISO,
} from "@/lib/doc-kit";
import { PRESETS } from "@/lib/quote-presets";

/**
 * What we build, and what it costs — a PDF for a client weighing up a project.
 *
 * Deliberately separate from the course fees. Someone pricing a school
 * management system and someone choosing an evening class are two different
 * people, and one list serving both serves neither.
 *
 * The figures are the quotation presets, so this price list and the quote we
 * later send them are the same numbers. A brochure that undercuts the quote
 * costs an argument; one that overshoots costs the job.
 */

const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

/** Work priced per visit or per hour rather than as a project. */
const SUPPORT = [
  {
    title: "Repairs & IT Support",
    from: 30000,
    what: "Laptop & desktop repair, upgrades (RAM/SSD), operating system and software installation, virus removal, data recovery. Onsite in Kampala or remote.",
  },
  {
    title: "Networking & CCTV",
    from: 0,
    what: "Wi-Fi and office LAN setup, structured cabling, CCTV and access control, network security. Quoted after a site visit, which is free within Kampala.",
  },
  {
    title: "Maintenance & Support Plans",
    from: 0,
    what: "Monthly cover for your machines, network and website — priced on how many devices you run. Ask for a plan.",
  },
];

export function buildServices(opts: { logo?: HTMLImageElement | string | null } = {}): jsPDF {
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
      doc.addImage(logo, "PNG", M, 7, 56, 13);
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
      `Indicative prices as at ${long(todayISO())}. We quote in writing once we know what you need.`,
      M,
      H - 6.6,
    );
  };

  header("SOFTWARE & IT SERVICES", "What we build, and what it costs");

  let y = 55;
  fill(TEAL_PALE);
  doc.roundedRect(M, y, W - M * 2, 15, 2, 2, "F");
  col(INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.text(
    "Every project starts with a free conversation about what you need. We then send a written quote,",
    M + 4,
    y + 6,
  );
  doc.text(
    "build in stages you approve as we go, and hand over with training. Half on start, half on delivery.",
    M + 4,
    y + 10.5,
  );
  y += 21;

  /* ── Project packages, from the quotation presets ───────────── */
  const projects = PRESETS.filter((p) => p.lines.some((l) => l.price > 0));

  for (const p of projects) {
    const total = p.lines.reduce((sum, l) => sum + l.price * (l.qty || 1), 0);
    const scope = p.scope.split("\n").filter(Boolean);
    const blockH = 16 + Math.max(p.lines.length * 4.6, scope.length * 4.2) + 6;

    if (y + blockH > H - 22) {
      doc.addPage();
      header("SOFTWARE & IT SERVICES", "continued");
      y = 55;
    }

    // Title bar with the price on it, so the figure is never hunted for.
    fill(TEAL);
    doc.roundedRect(M, y, W - M * 2, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(p.label.toUpperCase(), M + 4, y + 6.8);
    doc.setFontSize(11);
    doc.text(`from ${ugx(total)}`, right - 4, y + 6.8, { align: "right" });

    const bodyY = y + 14;
    const midX = M + (W - M * 2) * 0.52;

    // What it costs, broken down.
    col(MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("WHAT YOU PAY FOR", M + 2, bodyY);
    p.lines.forEach((l, i) => {
      const ly = bodyY + 4.6 + i * 4.6;
      col(INK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.4);
      const desc = doc.splitTextToSize(l.desc.split(" — ")[0], 62) as string[];
      doc.text(desc[0], M + 2, ly);
      col(TEAL);
      doc.setFont("helvetica", "bold");
      doc.text(ugx(l.price * (l.qty || 1)), midX - 6, ly, { align: "right" });
    });

    // What it includes.
    col(MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("WHAT YOU GET", midX + 2, bodyY);
    scope.forEach((line, i) => {
      col(INK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.4);
      const t = doc.splitTextToSize(`•  ${line}`, right - midX - 4) as string[];
      doc.text(t[0], midX + 2, bodyY + 4.4 + i * 4.2);
    });

    y += blockH;
    fill(RULE);
    doc.rect(M, y - 3, W - M * 2, 0.2, "F");
    y += 3;
  }

  /* ── Work charged per visit ─────────────────────────────────── */
  if (y + 46 > H - 22) {
    doc.addPage();
    header("SOFTWARE & IT SERVICES", "continued");
    y = 55;
  }

  col(TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SUPPORT & INFRASTRUCTURE", M, y + 4);
  y += 9;

  SUPPORT.forEach((sv, i) => {
    const lines = doc.splitTextToSize(sv.what, W - M * 2 - 8) as string[];
    const h = 8 + lines.length * 3.8;
    if (i % 2 === 1) {
      fill(ZEBRA);
      doc.rect(M, y, W - M * 2, h, "F");
    }
    col(INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.6);
    doc.text(sv.title, M + 3, y + 5.5);
    col(TEAL);
    doc.setFontSize(9);
    doc.text(sv.from ? `from ${ugx(sv.from)}` : "quoted on request", right - 3, y + 5.5, {
      align: "right",
    });
    col(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    lines.forEach((t, n) => doc.text(t, M + 3, y + 9.6 + n * 3.8));
    y += h;
  });

  y += 6;

  /* ── How to start ───────────────────────────────────────────── */
  if (y + 22 < H - 22) {
    fill(TEAL_PALE);
    doc.roundedRect(M, y, W - M * 2, 20, 2, 2, "F");
    col(TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.2);
    doc.text("TO START", M + 4, y + 6);
    col(INK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.text(
      `Call or WhatsApp ${COMPANY.phone} / ${COMPANY.phoneAlt}, email ${COMPANY.email},`,
      M + 4,
      y + 11.4,
    );
    doc.text(
      `or describe the job at ${COMPANY.site}/request and we will come back with a written quote.`,
      M + 4,
      y + 15.6,
    );
  }

  y += 28;
  if (y + 32 > H - 22) {
    doc.addPage();
    header("SOFTWARE & IT SERVICES", "continued");
    y = 55;
  }
  paymentBand(doc, M, y, W - M * 2);

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    footer(p, pages);
  }

  return doc;
}
