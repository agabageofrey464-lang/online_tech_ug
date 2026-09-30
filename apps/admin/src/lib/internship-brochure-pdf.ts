import jsPDF from "jspdf";
import {
  COMPANY,
  INK,
  MUTED,
  ORANGE,
  RULE,
  TEAL,
  TEAL_DARK,
  TEAL_PALE,
  logoPlate,
  long,
  paymentBand,
  todayISO,
} from "@/lib/doc-kit";

/**
 * The internship brochure — one sheet to hand a university student.
 *
 * Students ask the same four things in the same order: what does it cost, how
 * long is it, will you sign my school's forms, and what will I actually do.
 * This answers them in that order, on the same letterhead as everything else
 * the business sends, so it can be printed for a campus noticeboard or sent
 * as a file in a WhatsApp group.
 *
 * The figures come from the same constants the /internship page renders, so a
 * student reading the sheet and a student reading the site are quoted the
 * same thing.
 */

// Must match INTERNSHIP_FEE / INTERNSHIP_MONTHS in
// apps/web/src/components/internship-panel.tsx.
export const INTERNSHIP_FEE = 150_000;
export const INTERNSHIP_MONTHS = 2;
/** When placements actually run — the recess term most schools share. */
export const INTERNSHIP_WINDOW = "November & December";
/** This intake runs remotely — nobody is expected at the Kampala office. */
export const INTERNSHIP_MODE = "Online";

const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

/** Where a student can be placed. Software first, because most of the work is. */
const AREAS: { title: string; what: string }[] = [
  {
    title: "Software Development",
    what: "Websites, web apps and business systems in the stack we ship with — HTML, CSS, JavaScript, React and Python.",
  },
  {
    title: "Systems & Databases",
    what: "School, POS, inventory and SACCO systems: designing tables, writing queries, building screens a client uses daily.",
  },
  {
    title: "Graphic & Media Design",
    what: "Brand work, flyers, social artwork, photo and video editing for campaigns that go out under a client's name.",
  },
  {
    title: "Networking & IT Support",
    what: "Network design, configuration and troubleshooting, plus remote support for users — taught and practised on simulators and live systems.",
  },
  {
    title: "Digital Marketing",
    what: "Running social accounts and paid campaigns, writing the content, and reading what the numbers actually say.",
  },
  {
    title: "Technical Writing & Support",
    what: "Documentation, user guides and handling real support queries — the part of every IT job nobody trains you for.",
  },
];

const COVERS = [
  "A supervisor assigned to you, reachable through the whole placement",
  "Daily check-ins, code review and real tickets from the team's board",
  "Every school form filled, signed and stamped, on time",
  "Work you can put in a portfolio and a reference you can use",
  "First look at any job we open after you finish",
];

const STEPS = [
  ["Send your details", "Name, university, programme, registration number and the dates your school requires."],
  ["We confirm a place", "We check availability in the area you want and reply, usually within a few days."],
  ["Acceptance letter", "Signed and stamped, addressed to your Academic Registrar, in time for your deadline."],
  ["Train, then certify", "Work with the team on live jobs. We complete your assessment forms and issue a completion letter."],
];

const UNIVERSITIES =
  "Makerere · Kyambogo · MUBS · UCU · Ndejje · Bugema · Mbarara · Gulu · and every technical college and institute — public or private, diploma or degree.";

type Options = {
  logo?: HTMLImageElement | string | null;
  /** A photograph of the work, printed beside the pitch. */
  photo?: HTMLImageElement | string | null;
  intake?: string;
};

export function buildInternshipBrochure(opts: Options = {}): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 14;
  const CW = W - M * 2;

  const fill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const ink = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);

  // ── Letterhead ──────────────────────────────────────────────
  fill(TEAL);
  doc.rect(0, 0, W, 34, "F");
  fill(ORANGE);
  doc.rect(0, 34, W, 2.4, "F");

  if (opts.logo) {
    logoPlate(doc, opts.logo, M, 7, 44, 13);
  } else {
    ink([255, 255, 255]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(COMPANY.name, M, 15);
  }

  ink([255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.4);
  doc.text("INDUSTRIAL TRAINING & INTERNSHIP", W - M, 13, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  ink([200, 232, 240]);
  doc.text(`${COMPANY.phone}  ·  ${COMPANY.email}`, W - M, 19, { align: "right" });
  doc.text(`${COMPANY.site}/internship`, W - M, 23.5, { align: "right" });
  doc.text(`${COMPANY.address}`, W - M, 28, { align: "right" });

  let y = 44;

  // ── The offer, stated before anything else ──────────────────
  ink(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("Spend your internship doing the work,", M, y);
  doc.text("not watching it", M, y + 7.5);
  y += 14;

  // Fee tile — the first question every student asks.
  const feeW = 62;
  fill(TEAL_PALE);
  doc.roundedRect(M, y, feeW, 22, 2, 2, "F");
  fill(ORANGE);
  doc.rect(M, y, 2.2, 22, "F");
  ink(MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.6);
  doc.text("PLACEMENT FEE", M + 6, y + 6);
  ink(TEAL_DARK);
  doc.setFontSize(15);
  doc.text(ugx(INTERNSHIP_FEE), M + 6, y + 13.5);
  ink(MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`One payment · ${INTERNSHIP_MONTHS} months · nothing more to pay`, M + 6, y + 19);

  // The window, set in the brand yellow so it is the second thing read after
  // the fee — a student's next question is always "when".
  doc.setFillColor(252, 220, 4);
  doc.roundedRect(M + feeW + 8, y - 1, 52, 8.5, 1.4, 1.4, "F");
  ink([30, 26, 10]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  doc.text(
    `${INTERNSHIP_MODE.toUpperCase()} · INTAKE ${INTERNSHIP_WINDOW.toUpperCase()}`,
    M + feeW + 11,
    y + 4.6,
  );

  // The pitch, beside the fee.
  // The photograph: real work, on a real machine. Placed at 34mm wide, which
  // puts the 720px source at roughly 540dpi — it will not look soft in print.
  const PHOTO_W = 33;
  const PHOTO_H = 37;
  const photoX = W - M - PHOTO_W;
  if (opts.photo) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(photoX - 1.2, y - 2.2, PHOTO_W + 2.4, PHOTO_H + 2.4, 1.6, 1.6, "F");
    doc.addImage(opts.photo, "JPEG", photoX, y - 1, PHOTO_W, PHOTO_H, undefined, "SLOW");
  }

  ink(INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  const pitchW = CW - feeW - 8 - (opts.photo ? PHOTO_W + 6 : 0);
  const pitch = doc.splitTextToSize(
    "Run entirely online, so you can do it from home, from campus or from your home district. You are given real tickets from the same board as the team, with a supervisor on call, daily check-ins and code review — not a reading list. Most of the work is software, and by the end you have something real to show and people who will vouch for you.",
    pitchW,
  );
  doc.text(pitch, M + feeW + 8, y + 13);
  y += Math.max(24, opts.photo ? PHOTO_H + 1 : 0);

  // Who we take.
  fill([250, 250, 252]);
  doc.roundedRect(M, y, CW, 13, 1.8, 1.8, "F");
  ink(TEAL_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.4);
  doc.text("ONLINE · OPEN TO EVERY UNIVERSITY AND INSTITUTION IN UGANDA", M + 4, y + 5);
  ink(MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(doc.splitTextToSize(UNIVERSITIES, CW - 8), M + 4, y + 9.5);
  y += 16;

  // ── Where you can be placed ─────────────────────────────────
  const heading = (label: string) => {
    ink(TEAL_DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.6);
    doc.text(label, M, y);
    doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
    doc.setLineWidth(0.4);
    doc.line(M, y + 2, W - M, y + 2);
    y += 6.2;
  };

  heading("Where you can be placed");

  const colW = (CW - 6) / 2;
  let col = 0;
  let rowTop = y;
  for (const area of AREAS) {
    const x = M + col * (colW + 6);
    const body = doc.splitTextToSize(area.what, colW - 4);
    const h = 5.0 + body.length * 3.05 + 2.2;

    fill([252, 252, 253]);
    doc.roundedRect(x, rowTop, colW, h, 1.6, 1.6, "F");
    fill(ORANGE);
    doc.rect(x, rowTop, 1.6, h, "F");

    ink(INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(area.title, x + 4, rowTop + 5);
    ink(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.9);
    doc.text(body, x + 4, rowTop + 9);

    if (col === 1) {
      rowTop += h + 2.0;
      col = 0;
    } else {
      col = 1;
    }
  }
  y = rowTop + 3;

  // ── What the fee covers ─────────────────────────────────────
  heading(`What your ${ugx(INTERNSHIP_FEE)} covers`);
  ink(INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  for (const line of COVERS) {
    fill(TEAL);
    doc.circle(M + 1.6, y - 1.1, 1.1, "F");
    doc.text(line, M + 6, y);
    y += 4.8;
  }
  y += 0.5;

  // ── How to apply ────────────────────────────────────────────
  heading("How to apply");
  const stepW = (CW - 9) / 4;
  STEPS.forEach(([title, what], i) => {
    const x = M + i * (stepW + 3);
    fill(TEAL_PALE);
    doc.roundedRect(x, y, stepW, 22.5, 1.6, 1.6, "F");
    fill(TEAL);
    doc.circle(x + 5, y + 6, 3.2, "F");
    ink([255, 255, 255]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(String(i + 1), x + 5, y + 7.4, { align: "center" });
    ink(INK);
    doc.setFontSize(7.4);
    doc.text(doc.splitTextToSize(title, stepW - 12), x + 10, y + 7.4);
    ink(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(doc.splitTextToSize(what, stepW - 6), x + 3, y + 13);
  });
  y += 25.5;

  // ── How to pay ──────────────────────────────────────────────
  y += paymentBand(doc, M, y, CW) + 3.5;

  // ── Apply now ───────────────────────────────────────────────
  fill(TEAL_DARK);
  doc.roundedRect(M, y, CW, 15.5, 2, 2, "F");
  ink([255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Apply now — places are limited", M + 5, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  ink([198, 232, 241]);
  doc.text(
    `WhatsApp or call ${COMPANY.phone} / ${COMPANY.phoneAlt}  ·  ${COMPANY.site}/internship`,
    M + 5,
    y + 12.5,
  );
  y += 19;

  // ── Footer ──────────────────────────────────────────────────
  ink(MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  const intakeNote = opts.intake ? `Next intake: ${opts.intake}.  ` : "";
  doc.text(
    `${intakeNote}We keep intakes small so everyone gets a supervisor — apply early and your acceptance letter is signed well before your school's deadline.`,
    M,
    y,
  );
  doc.text(`${COMPANY.name} · ${long(todayISO())}`, M, y + 4);

  return doc;
}
