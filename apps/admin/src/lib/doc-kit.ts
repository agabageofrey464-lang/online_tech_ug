import type jsPDF from "jspdf";

/**
 * Shared furniture for the documents we hand to clients.
 *
 * Receipts, quotations, certificates and letters all carry the same
 * letterhead, the same house colours and the same way of writing a figure.
 * Keeping those in one place is what stops three documents from the same
 * company slowly becoming three different companies.
 */

export const COMPANY = {
  name: "ONLINE TECH UGANDA",
  tagline: "Computers & Accessories · IT Services · Software Development · Computer Training",
  phone: "+256 756 839 270",
  phoneAlt: "+256 760 547 211",
  email: "onlinetechug@gmail.com",
  site: "www.onlinetechug.com",
  address: "Kampala, Uganda",
};

/**
 * Charged once when a student joins, on top of the course's training fee.
 * Must match REGISTRATION_FEE in apps/web/src/lib/data.ts — it is the figure
 * the site quotes, so a document printing a different one is quoting a price
 * we do not offer.
 */
export const REGISTRATION_FEE = 50000;

/** Where a client can pay — printed rather than explained on the phone. */
export const MOMO = {
  mtn: "0760 547 211  (Online Tech Uganda)",
  // The number and the merchant ID: either one reaches the same account.
  airtel: "0756 839 270  ·  Merchant ID 7148212",
  airtelName: "Online TechUG Services",
};

// House colours, matching the site.
export const TEAL = [14, 116, 144] as const;
export const TEAL_DARK = [12, 93, 117] as const;
export const TEAL_PALE = [238, 250, 253] as const;
export const ORANGE = [241, 90, 41] as const;
export const INK = [34, 34, 34] as const;
export const MUTED = [110, 110, 110] as const;
export const RULE = [226, 232, 234] as const;
export const ZEBRA = [247, 251, 252] as const;
export const NOTE_BG = [252, 250, 246] as const;
export const SOFT = [250, 252, 253] as const;
export const GREEN = [0, 150, 80] as const;
export const AMBER = [214, 120, 20] as const;
export const RED = [200, 60, 40] as const;
export const PEN = [150, 150, 150] as const;
export const STAMP = [210, 218, 220] as const;

export type RGB = readonly [number, number, number];

/** One priced row on a receipt or a quotation. */
export type Line = { desc: string; qty: number; price: number };

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDays = (iso: string, n: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const long = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

export const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

export function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* ── Amount in words ───────────────────────────────────────────────────────
   On every document that carries a figure: numbers alone can be altered with
   a pen, words cannot. Ugandan paperwork is expected to carry both. */
const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function under1000(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
  const rest = n % 100;
  return `${ONES[Math.floor(n / 100)]} Hundred${rest ? ` and ${under1000(rest)}` : ""}`;
}

export function inWords(amount: number): string {
  const n = Math.floor(Math.abs(amount));
  if (n === 0) return "Uganda Shillings Zero Only";
  const parts: string[] = [];
  const scales: [number, string][] = [
    [1000000000, "Billion"],
    [1000000, "Million"],
    [1000, "Thousand"],
  ];
  let rest = n;
  for (const [value, label] of scales) {
    const count = Math.floor(rest / value);
    if (count) {
      parts.push(`${under1000(count)} ${label}`);
      rest %= value;
    }
  }
  if (rest) parts.push(under1000(rest));
  return `Uganda Shillings ${parts.join(" ")} Only`;
}

/**
 * Document numbers that run in order on the machine that issues them, so two
 * documents of the same kind never share a number.
 */
export function nextNumber(kind: string, key: string, date: string) {
  let seq = 1;
  try {
    seq = Number(localStorage.getItem(key) || "0") + 1;
  } catch {
    /* private browsing — start from 1 */
  }
  return `OTU/${kind}/${date.slice(0, 4)}/${String(seq).padStart(4, "0")}`;
}

export function bumpNumber(key: string) {
  try {
    localStorage.setItem(key, String(Number(localStorage.getItem(key) || "0") + 1));
  } catch {
    /* nothing to do */
  }
}


/**
 * The "how to pay" band printed at the foot of a document.
 *
 * Every document that asks for money should say where it goes, in the same
 * shape each time — a client who has to ring up to ask for the Mobile Money
 * number is a client who has not paid yet.
 *
 * Returns the height used, so the caller can carry on beneath it.
 */
export function paymentBand(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
): number {
  const H = 30;
  const fill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);

  fill(TEAL);
  doc.roundedRect(x, y, w, H, 2, 2, "F");
  fill(ORANGE);
  doc.rect(x, y + H - 2.2, w, 2.2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("HOW TO PAY", x + 5, y + 7.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(198, 232, 241);
  doc.text("Mobile Money only. Keep your confirmation message.", x + 33, y + 7.5);

  const colW = (w - 10) / 2;

  // MTN — its own tile, so the two accounts are never misread as one line.
  doc.setFillColor(255, 205, 0);
  doc.roundedRect(x + 5, y + 10.5, colW - 3, 13, 1.5, 1.5, "F");
  doc.setTextColor(40, 30, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.4);
  doc.text("MTN MOBILE MONEY", x + 8, y + 15.2);
  doc.setFontSize(8.6);
  doc.text(MOMO.mtn, x + 8, y + 20.4);

  // Airtel
  doc.setFillColor(214, 32, 39);
  doc.roundedRect(x + 8 + colW, y + 10.5, colW - 3, 13, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.4);
  doc.text(`AIRTEL MONEY  —  ${MOMO.airtelName}`, x + 11 + colW, y + 15.2);
  doc.setFontSize(8.6);
  doc.text(MOMO.airtel, x + 11 + colW, y + 20.4);

  return H;
}


/**
 * The logo, set on a white plate.
 *
 * The mark is dark ink on white — that is the artwork, and it is what gets
 * printed on a business card. Dropping it straight onto the teal letterhead
 * would make the wordmark disappear, so the letterhead gives it a white panel
 * to sit on rather than the brand being redrawn to suit the background.
 *
 * `h` is the logo's drawn height; the plate is sized around it.
 */
export function logoPlate(
  doc: jsPDF,
  logo: string | HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const pad = 2.4;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x - pad, y - pad, w + pad * 2, h + pad * 2, 1.8, 1.8, "F");
  doc.addImage(logo, "PNG", x, y, w, h);
}

/* ─── The company's official stamp ────────────────────────────────
   Drawn as the real stamp is laid out — the border, "Online Tech UG LTD",
   the tagline, the OT mark, the telephone line and the star — in vector
   lines and lettering, so it prints sharp at any size, with the date set
   in red each time a document is made. Only the OT mark is an image, lifted
   from a photograph of the real stamp. */
let stampLogo: Promise<HTMLImageElement | null> | null = null;

/** Loads the stamp's OT mark once and keeps it. */
export function loadStamp(): Promise<HTMLImageElement | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  stampLogo ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/stamp-logo.png";
  });
  return stampLogo;
}

/** "17 OCT 2026", as the stamp's dater prints it. */
export function stampDate(d = new Date()): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "").toUpperCase();
}

// Sampled from a photograph of the real stamp.
const STAMP_INK = [20, 40, 165] as const;
const DATE_INK = [222, 25, 55] as const;

/** Text set as large as fits `maxW`, centred on cx. */
function fitText(doc: jsPDF, text: string, cx: number, y: number, maxW: number, maxSize: number) {
  let size = maxSize;
  doc.setFontSize(size);
  while (doc.getTextWidth(text) > maxW && size > 4) {
    size -= 0.25;
    doc.setFontSize(size);
  }
  doc.text(text, cx, y, { align: "center" });
}

/** A five-pointed star centred on (cx, cy). */
function star(doc: jsPDF, cx: number, cy: number, r: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.42;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  const rel = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]] as [number, number]);
  doc.lines(rel, pts[0][0], pts[0][1], [1, 1], "F", true);
}

/**
 * The official stamp, `w` mm wide with its top-left at (x, y), dated `date`
 * in red. The `logo` is the OT mark from loadStamp(); without it the stamp is
 * still drawn, with the mark left out.
 */
export function officialStamp(doc: jsPDF, logo: HTMLImageElement | null, x: number, y: number, w = 52, date = stampDate()) {
  const h = w / 1.85;
  const cx = x + w / 2;
  // Ink is never quite solid on paper.
  const GState = (doc as unknown as { GState: new (o: { opacity: number }) => unknown }).GState;
  const setOpacity = (o: number) => (doc as unknown as { setGState: (g: unknown) => void }).setGState(new GState({ opacity: o }));
  setOpacity(0.9);

  doc.setDrawColor(STAMP_INK[0], STAMP_INK[1], STAMP_INK[2]);
  doc.setFillColor(STAMP_INK[0], STAMP_INK[1], STAMP_INK[2]);
  doc.setTextColor(STAMP_INK[0], STAMP_INK[1], STAMP_INK[2]);

  // The border.
  doc.setLineWidth(w * 0.018);
  doc.roundedRect(x, y, w, h, w * 0.025, w * 0.025, "S");

  // Online Tech UG LTD
  doc.setFont("helvetica", "bold");
  fitText(doc, "Online Tech UG LTD", cx, y + h * 0.24, w * 0.88, w * 0.3);

  // ——YOUR TECHNOLOGY PARTNER——
  doc.setFontSize(w * 0.095);
  const tag = "YOUR TECHNOLOGY PARTNER";
  const tw = doc.getTextWidth(tag);
  const ty = y + h * 0.355;
  doc.text(tag, cx, ty, { align: "center" });
  doc.setLineWidth(w * 0.008);
  doc.line(x + w * 0.06, ty - w * 0.012, cx - tw / 2 - w * 0.015, ty - w * 0.012);
  doc.line(cx + tw / 2 + w * 0.015, ty - w * 0.012, x + w * 0.94, ty - w * 0.012);

  // The OT mark on the left, the star on the right.
  if (logo) {
    const lw = w * 0.2;
    const lh = (lw * logo.naturalHeight) / logo.naturalWidth;
    doc.addImage(logo, "PNG", x + w * 0.05, y + h * 0.43, lw, lh);
  }
  star(doc, x + w * 0.89, y + h * 0.56, w * 0.035);

  // Tel:0756839270 / 0760547211
  doc.setFont("helvetica", "bold");
  fitText(doc, "Tel:0756839270 / 0760547211", cx, y + h * 0.9, w * 0.92, w * 0.17);

  // The date, in red, where the dater sits.
  doc.setTextColor(DATE_INK[0], DATE_INK[1], DATE_INK[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(w * 0.19);
  doc.text(date, x + w * 0.56, y + h * 0.625, { align: "center" });

  setOpacity(1);
}
