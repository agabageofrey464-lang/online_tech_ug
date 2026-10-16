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
 * The internship brochure — two sides to hand a university student.
 *
 * Students ask the same four things in the same order: what does it cost, how
 * long is it, will you sign my school's forms, and what will I actually do.
 * The first side answers the first three and then spends the rest of the
 * page on the fourth, for the students most of the places go to: every field
 * of software and IT practice we can put someone to work in, each named, so a
 * student looking for "testing" or "databases" or "DevOps" finds the word.
 * The second side is for students who are not on an IT course, then what the
 * fee covers, how to apply and how to pay.
 *
 * The figures come from the same constants the /internship page renders, so a
 * student reading the sheet and a student reading the site are quoted the
 * same thing.
 */

// Must match the constants in apps/web/src/components/internship-panel.tsx —
// a brochure quoting different dates or a different length from the page is
// the kind of thing a student turns up holding.
export const INTERNSHIP_FEE = 150_000;
export const INTERNSHIP_START = "1 November";
export const INTERNSHIP_END = "18 December 2026";
export const INTERNSHIP_WINDOW = `${INTERNSHIP_START} - ${INTERNSHIP_END}`;
/**
 * Seven weeks, not two months: 1 November to 18 December is 47 days. This
 * said "2 months", which overstates it by a fortnight, and a school with a
 * minimum placement length will hold a student to what we printed.
 */
export const INTERNSHIP_WEEKS = 7;
/** This intake runs remotely — nobody is expected at the Kampala office. */
export const INTERNSHIP_MODE = "Online";

const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

/**
 * Software and IT practice, field by field — for students of Computer Science,
 * IT, Software Engineering and Information Systems. Named one by one because a
 * student searches the sheet for the word their course uses.
 */
export const IT_FIELDS: { title: string; what: string; tools: string }[] = [
  { title: "Front-End Web Development", what: "Build the pages people see and use, responsive on every screen.", tools: "HTML · CSS · JavaScript · React · Next.js" },
  { title: "Back-End & API Development", what: "Write the logic behind a site: accounts, orders, records and the APIs that serve them.", tools: "Python · FastAPI · Node.js · REST" },
  { title: "Full-Stack Development", what: "Take one feature from the database to the screen and ship it to a live system.", tools: "React · Python · PostgreSQL" },
  { title: "Mobile App Development", what: "Design and build apps for Android phones, tested on real devices.", tools: "Android · cross-platform apps" },
  { title: "Database Design & Administration", what: "Model the data, write the queries, keep it backed up and fast.", tools: "PostgreSQL · MySQL · SQL · ERDs" },
  { title: "Systems Analysis & Design", what: "Gather requirements from a client and turn them into a design a team can build.", tools: "Use cases · UML · data flow · specs" },
  { title: "UI / UX Design", what: "Plan how a system looks and feels before a line of code is written.", tools: "Wireframes · prototypes · Figma" },
  { title: "Software Testing & QA", what: "Find the faults before the client does: test plans, bug reports, automated checks.", tools: "Test cases · pytest · bug tracking" },
  { title: "Version Control & Team Workflow", what: "Work the way a software team works: branches, reviews and tickets.", tools: "Git · GitHub · code review" },
  { title: "Cloud, Hosting & DevOps", what: "Put a system on the internet and keep it there: servers, domains, deployments.", tools: "Linux · AWS · Vercel · SSL · CI" },
  { title: "Cybersecurity", what: "Secure accounts, sites and data; find weak points and close them.", tools: "Access control · backups · hardening" },
  { title: "Networking & System Administration", what: "Design, configure and troubleshoot networks and the users on them.", tools: "LAN · Wi-Fi · IP addressing · routers" },
  { title: "IT Support & Hardware", what: "Diagnose and fix computers: repairs, upgrades, installations and remote support.", tools: "Windows · drivers · RAM / SSD" },
  { title: "Business Systems Development", what: "School, POS, inventory and SACCO systems that a client uses every day.", tools: "Reports · roles · dashboards" },
  { title: "E-Commerce & Payment Integration", what: "Online shops with carts, checkout and Mobile Money or card payments.", tools: "Pesapal · Mobile Money · SMS · WhatsApp" },
  { title: "Data Analysis & Reporting", what: "Turn records into answers a manager can act on.", tools: "Excel · SQL · charts · dashboards" },
  { title: "AI Tools & Automation", what: "Use AI assistants to build, test and document faster, and automate routine work.", tools: "AI coding tools · scripts · bots" },
  { title: "Technical Writing & Project Reports", what: "User manuals, system documentation and the report your school asks for.", tools: "Documentation · your final-year project" },
];

/** For students who are not on an IT course: the computer side of their own field. */
export const OTHER_FIELDS: { title: string; what: string }[] = [
  { title: "Computer Applications for the Office", what: "Word, Excel, PowerPoint and Access used on real documents, budgets and records." },
  { title: "Digital Marketing & Social Media", what: "Run pages and paid campaigns, write the content and read the results." },
  { title: "Graphic Design & Branding", what: "Logos, flyers, posters and social artwork that go out under a client's name." },
  { title: "Video Editing & Photography", what: "Shoot, edit and publish adverts, reels and product photographs." },
  { title: "Accounting Software", what: "QuickBooks and Excel for invoices, stock, payroll and monthly accounts." },
  { title: "Records, Data Entry & Administration", what: "Digital filing, databases of customers and students, and office systems." },
  { title: "Online Business & E-Commerce", what: "List products, take orders and serve customers in a working online shop." },
  { title: "Customer Service & Sales", what: "Answer real enquiries by phone, WhatsApp and email, and follow up a sale." },
  { title: "Content Writing & Blogging", what: "Articles, product descriptions and newsletters, edited and published." },
  { title: "AutoCAD & Technical Drawing", what: "2D plans and 3D models, for engineering, building and architecture students." },
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
  ["We confirm a place", "We check availability in the field you want and reply, usually within a few days."],
  ["Acceptance letter", "Signed and stamped, addressed to your Academic Registrar, in time for your deadline."],
  ["Train, then certify", "Work with the team on live jobs. We complete your assessment forms and issue a completion letter."],
];

const UNIVERSITIES =
  "Makerere · Kyambogo · MUBS · UCU · Ndejje · Bugema · Mbarara · Gulu · Nkumba · KIU · and every technical college and institute — public or private, diploma or degree.";

type Options = {
  logo?: HTMLImageElement | string | null;
  /** A photograph of the work, printed beside the pitch. */
  photo?: HTMLImageElement | string | null;
  intake?: string;
};

export function buildInternshipBrochure(opts: Options = {}): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 14;
  const CW = W - M * 2;

  const fill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const ink = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);

  const letterhead = (h: number) => {
    const tall = h > 30;
    fill(TEAL);
    doc.rect(0, 0, W, h, "F");
    fill(TEAL_DARK);
    doc.triangle(W, 0, W, h, W - 60, 0, "F");
    fill(ORANGE);
    doc.rect(0, h, W, 2.4, "F");
    if (opts.logo) {
      logoPlate(doc, opts.logo, M, tall ? 7 : 5, tall ? 44 : 36, tall ? 13 : 10.6);
    } else {
      ink([255, 255, 255]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(COMPANY.name, M, tall ? 15 : 12);
    }
    ink([255, 255, 255]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.4);
    doc.text("INDUSTRIAL TRAINING & INTERNSHIP", W - M, tall ? 13 : 10, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    ink([200, 232, 240]);
    if (tall) {
      doc.text(`${COMPANY.phone}  ·  ${COMPANY.email}`, W - M, 19, { align: "right" });
      doc.text(`${COMPANY.site}/internship`, W - M, 23.5, { align: "right" });
      doc.text(`${COMPANY.address}`, W - M, 28, { align: "right" });
    } else {
      doc.text(`${COMPANY.phone}  ·  ${COMPANY.site}/internship`, W - M, 15.5, { align: "right" });
    }
  };

  const pageFoot = (page: number) => {
    ink(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.4);
    doc.text(`${COMPANY.name}  ·  ${COMPANY.phone} / ${COMPANY.phoneAlt}  ·  ${COMPANY.site}/internship  ·  ${long(todayISO())}`, M, H - 7);
    doc.text(`Page ${page} of 2`, W - M, H - 7, { align: "right" });
  };

  let y = 0;
  const heading = (label: string, note = "") => {
    ink(TEAL_DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.4);
    doc.text(label, M, y);
    let under = 2;
    if (note) {
      ink(MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.4);
      const lines = doc.splitTextToSize(note, CW) as string[];
      doc.text(lines, M, y + 4.4);
      under = 2.6 + lines.length * 3.4;
    }
    doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
    doc.setLineWidth(0.4);
    doc.line(M, y + under, W - M, y + under);
    y += under + 4;
  };

  /* ═══ Side one ═══════════════════════════════════════════════ */
  letterhead(34);
  y = 44;

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
  doc.text(`One payment · ${INTERNSHIP_WEEKS} weeks · nothing more to pay`, M + 6, y + 19);

  // The window, in the brand yellow: a student's next question is "when".
  const badge = `${INTERNSHIP_MODE.toUpperCase()} · ${INTERNSHIP_WINDOW.toUpperCase()}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  const badgeW = doc.getTextWidth(badge) + 7;
  doc.setFillColor(252, 220, 4);
  doc.roundedRect(M + feeW + 8, y - 1, badgeW, 8.5, 1.4, 1.4, "F");
  ink([30, 26, 10]);
  doc.text(badge, M + feeW + 11.5, y + 4.6);

  const PHOTO_W = 30;
  const PHOTO_H = 30;
  const photoX = W - M - PHOTO_W;
  if (opts.photo) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(photoX - 1.2, y - 2.2, PHOTO_W + 2.4, PHOTO_H + 2.4, 1.6, 1.6, "F");
    doc.addImage(opts.photo, "JPEG", photoX, y - 1, PHOTO_W, PHOTO_H, undefined, "SLOW");
  }

  ink(INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  const pitchW = CW - feeW - 8 - (opts.photo ? PHOTO_W + 6 : 0);
  const pitch = doc.splitTextToSize(
    "Run entirely online, so you can do it from home, from campus or from your home district. You are given real tickets from the same board as the team, with a supervisor on call, daily check-ins and code review — not a reading list. By the end you have something real to show and people who will vouch for you.",
    pitchW,
  );
  doc.text(pitch, M + feeW + 8, y + 13);
  y += Math.max(25, opts.photo ? PHOTO_H + 2 : 0);

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
  y += 19;

  // ── Software and IT, field by field ─────────────────────────
  heading(
    `${IT_FIELDS.length} fields of software & IT practice`,
    "For students of Computer Science, Information Technology, Software Engineering, Information Systems and related courses. Choose one, or combine two.",
  );

  const COLS = 3;
  const GAP = 3;
  const tw = (CW - GAP * (COLS - 1)) / COLS;
  const rows = Math.ceil(IT_FIELDS.length / COLS);
  // The tiles take whatever height is left above the foot of the page.
  const th = Math.min(27, (H - 13 - y - GAP * (rows - 1)) / rows);
  IT_FIELDS.forEach((f, i) => {
    const x = M + (i % COLS) * (tw + GAP);
    const top = y + Math.floor(i / COLS) * (th + GAP);
    fill([250, 252, 253]);
    doc.roundedRect(x, top, tw, th, 1.5, 1.5, "F");
    fill(ORANGE);
    doc.rect(x, top, 1.5, th, "F");

    // Its number, so a student can say "field 8" on the phone.
    ink(ORANGE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.4);
    doc.text(String(i + 1).padStart(2, "0"), x + tw - 3, top + 4.6, { align: "right" });

    ink(INK);
    doc.setFontSize(7.9);
    const title = (doc.splitTextToSize(f.title, tw - 12) as string[]).slice(0, 2);
    title.forEach((line, n) => doc.text(line, x + 4, top + 5 + n * 3.5));
    const afterTitle = top + 5 + title.length * 3.5;

    ink(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const body = (doc.splitTextToSize(f.what, tw - 7) as string[]).slice(0, 3);
    body.forEach((line, n) => doc.text(line, x + 4, afterTitle + 0.6 + n * 2.9));

    ink(TEAL_DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.9);
    doc.text((doc.splitTextToSize(f.tools, tw - 7) as string[])[0], x + 4, top + th - 2.6);
  });
  pageFoot(1);

  /* ═══ Side two ═══════════════════════════════════════════════ */
  doc.addPage();
  letterhead(21);
  y = 33;

  heading(
    "Not on an IT course? There is a place for you too",
    "For students of Business, Education, Arts, Sciences, Engineering and any other course whose school asks for industrial training.",
  );
  const cw2 = (CW - 4) / 2;
  const oh = 13.6;
  OTHER_FIELDS.forEach((f, i) => {
    const x = M + (i % 2) * (cw2 + 4);
    const top = y + Math.floor(i / 2) * (oh + 2.4);
    fill([252, 252, 253]);
    doc.roundedRect(x, top, cw2, oh, 1.5, 1.5, "F");
    fill(TEAL);
    doc.rect(x, top, 1.5, oh, "F");
    ink(INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(f.title, x + 4, top + 5.2);
    ink(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.9);
    doc.text((doc.splitTextToSize(f.what, cw2 - 7) as string[]).slice(0, 2), x + 4, top + 9.2);
  });
  y += Math.ceil(OTHER_FIELDS.length / 2) * (oh + 2.4) + 5;

  // ── What the fee covers ─────────────────────────────────────
  heading(`What your ${ugx(INTERNSHIP_FEE)} covers`);
  ink(INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  for (const line of COVERS) {
    fill(TEAL);
    doc.circle(M + 1.6, y - 1.1, 1.1, "F");
    doc.text(line, M + 6, y);
    y += 5.2;
  }
  y += 4;

  // ── How to apply ────────────────────────────────────────────
  heading("How to apply");
  const stepW = (CW - 9) / 4;
  STEPS.forEach(([title, what], i) => {
    const x = M + i * (stepW + 3);
    fill(TEAL_PALE);
    doc.roundedRect(x, y, stepW, 24, 1.6, 1.6, "F");
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
    doc.setFontSize(6.6);
    doc.text(doc.splitTextToSize(what, stepW - 6), x + 3, y + 13);
  });
  y += 29;

  // ── How to pay ──────────────────────────────────────────────
  y += paymentBand(doc, M, y, CW) + 5;

  // ── Apply now ───────────────────────────────────────────────
  fill(TEAL_DARK);
  doc.roundedRect(M, y, CW, 17, 2, 2, "F");
  ink([255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Apply now — places are limited", M + 5, y + 7.4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.6);
  ink([198, 232, 241]);
  doc.text(`WhatsApp or call ${COMPANY.phone} / ${COMPANY.phoneAlt}  ·  ${COMPANY.site}/internship`, M + 5, y + 13);
  y += 22;

  ink(MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  const intakeNote = opts.intake ? `Next intake: ${opts.intake}.  ` : "";
  doc.text(
    doc.splitTextToSize(
      `${intakeNote}We keep intakes small so everyone gets a supervisor — apply early and your acceptance letter is signed well before your school's deadline.`,
      CW,
    ),
    M,
    y,
  );
  pageFoot(2);

  return doc;
}
