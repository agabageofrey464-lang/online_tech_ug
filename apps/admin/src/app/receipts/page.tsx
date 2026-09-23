"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Customer receipts.
 *
 * Whenever someone pays — for a laptop, a repair, a course or a software job —
 * they want something in their hand. This prints an itemised receipt on our
 * letterhead with a traceable number, the amount in words (which is what makes
 * a receipt hard to alter) and an authorised signature block.
 *
 * Receipt numbers run in order on the machine that issues them, so two receipts
 * never share a number.
 */

type Party = "individual" | "business";

type Line = { desc: string; qty: number; price: number };

const METHODS = [
  "Cash",
  "MTN Mobile Money",
  "Airtel Money",
  "Bank Transfer",
  "Card / Online",
  "Cheque",
] as const;

const COMPANY = {
  name: "ONLINE TECH UGANDA",
  tagline: "Computers & Accessories · IT Services · Software Development · Computer Training",
  phone: "+256 756 839 270",
  phoneAlt: "+256 760 547 211",
  email: "onlinetechug@gmail.com",
  site: "www.onlinetechug.com",
  address: "Kampala, Uganda",
};

// House colours, matching the site.
const TEAL = [14, 116, 144] as const;
const TEAL_DARK = [12, 93, 117] as const;
const TEAL_PALE = [238, 250, 253] as const;
const ORANGE = [241, 90, 41] as const;
const INK = [34, 34, 34] as const;
const MUTED = [110, 110, 110] as const;
const RULE = [226, 232, 234] as const;
const ZEBRA = [247, 251, 252] as const;
const NOTE_BG = [252, 250, 246] as const;
const SOFT = [250, 252, 253] as const;
const GREEN = [0, 150, 80] as const;
const AMBER = [214, 120, 20] as const;
const RED = [200, 60, 40] as const;
const PEN = [150, 150, 150] as const;
const STAMP = [210, 218, 220] as const;

// Where a balance can be settled — printed rather than explained on the phone.
const MOMO = {
  mtn: "0760 547 211  (Online Tech Uganda)",
  airtel: "Pay Merchant ID 7148212  (Online TechUG Services)",
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const long = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";
const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* ── Amount in words ───────────────────────────────────────────────────────
   Written out on every receipt: figures alone can be altered with a pen,
   words cannot. Ugandan receipts are expected to carry both. */
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

function inWords(amount: number): string {
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

/* ── Receipt numbering ─────────────────────────────────────────────────── */
const SEQ_KEY = "otu.receipt.seq";

function peekNumber(date: string) {
  let seq = 1;
  try {
    seq = Number(localStorage.getItem(SEQ_KEY) || "0") + 1;
  } catch {
    /* private browsing — start from 1 */
  }
  return `OTU/RCT/${date.slice(0, 4)}/${String(seq).padStart(4, "0")}`;
}

function bumpNumber() {
  try {
    localStorage.setItem(SEQ_KEY, String(Number(localStorage.getItem(SEQ_KEY) || "0") + 1));
  } catch {
    /* nothing to do */
  }
}

export default function ReceiptsPage() {
  const [party, setParty] = useState<Party>("individual");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [tin, setTin] = useState("");

  const [lines, setLines] = useState<Line[]>([{ desc: "", qty: 1, price: 0 }]);
  const [method, setMethod] = useState<string>(METHODS[0]);
  const [paid, setPaid] = useState<number | "">("");
  const [date, setDate] = useState(todayISO());
  const [signatory, setSignatory] = useState("Agaba Geofrey");
  const [note, setNote] = useState("");

  const [num, setNum] = useState("OTU/RCT/0000/0001");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const logo = useRef<HTMLImageElement | null>(null);
  const sign = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    loadImg("/logo-mark.png").then((i) => (logo.current = i));
    loadImg("/signature.png").then((i) => (sign.current = i));
  }, []);

  // localStorage is only readable in the browser, so the number is settled here.
  useEffect(() => setNum(peekNumber(date)), [date]);

  const total = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
  const received = paid === "" ? total : Number(paid) || 0;
  const balance = Math.max(0, total - received);
  const ready = name.trim().length > 1 && total > 0;

  function setLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  const addLine = () => setLines((p) => [...p, { desc: "", qty: 1, price: 0 }]);
  const dropLine = (i: number) => setLines((p) => (p.length === 1 ? p : p.filter((_, x) => x !== i)));

  async function build() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210;
    const H = 297;
    const M = 15;
    const right = W - M;

    type RGB = readonly [number, number, number];
    const col = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
    const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
    const draw = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);

    /* ── Letterhead ───────────────────────────────────────────── */
    const HB = 36;
    fill(TEAL);
    doc.rect(0, 0, W, HB, "F");
    // A darker wedge on the right gives the flat band some depth and gives
    // the contact details something to sit on.
    fill(TEAL_DARK);
    doc.triangle(W, 0, W, HB, W - 74, 0, "F");

    if (logo.current) {
      // The logo is a wide lockup drawn for dark backgrounds, so on the teal
      // band it needs no tile — and it already carries the company name.
      doc.addImage(logo.current, "PNG", M, 6, 58, 21);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(255, 255, 255);
      doc.text(COMPANY.name, M, 17);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.6);
    doc.setTextColor(215, 240, 247);
    doc.text(COMPANY.tagline, M, 32.5);

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY.phone, right, 12, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(206, 235, 243);
    doc.setFontSize(7.6);
    doc.text(COMPANY.phoneAlt, right, 17, { align: "right" });
    doc.text(COMPANY.email, right, 22, { align: "right" });
    doc.text(`${COMPANY.site}  ·  ${COMPANY.address}`, right, 27, { align: "right" });

    fill(ORANGE);
    doc.rect(0, HB, W, 2, "F");

    /* ── Title, number and date ───────────────────────────────── */
    let y = 52;
    col(TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text("RECEIPT", M, y);
    doc.setFontSize(8);
    col(MUTED);
    doc.setFont("helvetica", "normal");
    doc.text("Official receipt of payment", M, y + 5.5);

    // Boxed, because the number is what gets quoted back to us on the phone.
    const bx = right - 72;
    const by = 40;
    const bw = 72;
    fill(TEAL_PALE);
    draw(RULE);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, by, bw, 19, 2, 2, "FD");
    doc.setFontSize(7.5);
    col(MUTED);
    doc.text("RECEIPT No.", bx + 4, by + 6);
    doc.text("DATE", bx + 4, by + 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    col(TEAL);
    doc.text(num, bx + bw - 4, by + 6, { align: "right" });
    col(INK);
    doc.text(long(date), bx + bw - 4, by + 14, { align: "right" });

    y += 12;

    /* ── Who paid, and how ────────────────────────────────────── */
    const colW = (right - M - 6) / 2;
    const boxTop = y;

    const leftLines: string[] = [];
    if (party === "business") {
      leftLines.push(`Contact person: ${name.trim()}`);
      if (tin.trim()) leftLines.push(`TIN: ${tin.trim()}`);
    } else {
      leftLines.push("Individual customer");
    }
    if (address.trim()) leftLines.push(address.trim());
    const reach = [phone.trim(), email.trim()].filter(Boolean).join("   ·   ");
    if (reach) leftLines.push(reach);

    const boxH = Math.max(26, 14 + leftLines.length * 4.4);

    draw(RULE);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, boxTop, colW, boxH, 2, 2, "D");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    col(MUTED);
    doc.text("RECEIVED FROM", M + 4, boxTop + 6);
    doc.setFontSize(11.5);
    col(INK);
    const who = party === "business" ? business.trim() || name.trim() : name.trim();
    doc.text(doc.splitTextToSize(who, colW - 8)[0] as string, M + 4, boxTop + 12.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    col(MUTED);
    let ly = boxTop + 17.5;
    for (const t of leftLines) {
      doc.text(doc.splitTextToSize(t, colW - 8)[0] as string, M + 4, ly);
      ly += 4.4;
    }

    const rx = M + colW + 6;
    fill(TEAL_PALE);
    draw(RULE);
    doc.roundedRect(rx, boxTop, colW, boxH, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    col(MUTED);
    doc.text("PAYMENT", rx + 4, boxTop + 6);
    doc.setFontSize(11.5);
    col(INK);
    doc.text(method, rx + 4, boxTop + 12.5);

    // Settled or not, stated plainly — it is the first thing anyone checks.
    const settled = balance <= 0;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);
    fill(settled ? GREEN : AMBER);
    const chip = settled ? "PAID IN FULL" : "PART PAYMENT";
    const cw = doc.getTextWidth(chip) + 7;
    doc.roundedRect(rx + 4, boxTop + 16, cw, 6, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(chip, rx + 4 + cw / 2, boxTop + 20.2, { align: "center" });

    y = boxTop + boxH + 9;

    /* ── Items ────────────────────────────────────────────────── */
    const cQty = M + 112;
    const cPrice = M + 148;
    const cAmt = right - 3;

    fill(TEAL);
    doc.roundedRect(M, y - 5.5, right - M, 9, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("DESCRIPTION", M + 4, y);
    doc.text("QTY", cQty, y, { align: "right" });
    doc.text("UNIT PRICE", cPrice, y, { align: "right" });
    doc.text("AMOUNT", cAmt, y, { align: "right" });
    y += 9;

    doc.setFontSize(9);
    let shade = false;
    for (const l of lines) {
      if (!l.desc.trim() && !l.price) continue;
      const amt = (Number(l.qty) || 0) * (Number(l.price) || 0);
      const wrapped = doc.splitTextToSize(l.desc.trim() || "—", 100) as string[];
      const h = Math.max(8, wrapped.length * 4.6 + 3.2);
      if (shade) {
        fill(ZEBRA);
        doc.rect(M, y - 5, right - M, h, "F");
      }
      shade = !shade;
      doc.setFont("helvetica", "normal");
      col(INK);
      doc.text(wrapped, M + 4, y);
      col(MUTED);
      doc.text(String(l.qty), cQty, y, { align: "right" });
      doc.text(Number(l.price).toLocaleString("en-UG"), cPrice, y, { align: "right" });
      doc.setFont("helvetica", "bold");
      col(INK);
      doc.text(amt.toLocaleString("en-UG"), cAmt, y, { align: "right" });
      y += h;
    }
    draw(RULE);
    doc.setLineWidth(0.3);
    doc.line(M, y - 3.5, right, y - 3.5);
    y += 3;

    /* ── Totals ───────────────────────────────────────────────── */
    const row = (t: string, v: string, bold = false, color?: RGB) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(9.5);
      col(color ?? MUTED);
      doc.text(t, cPrice, y, { align: "right" });
      col(color ?? INK);
      doc.text(v, cAmt, y, { align: "right" });
      y += 5.6;
    };
    row("Subtotal", ugx(total));
    row("Amount received", ugx(received));
    if (balance > 0) row("Balance due", ugx(balance), true, RED);

    y += 1.5;
    fill(TEAL);
    doc.roundedRect(cQty - 16, y - 6, right - (cQty - 16), 11, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL PAID", cQty - 12, y + 1.2);
    doc.text(ugx(received), cAmt, y + 1.2, { align: "right" });
    y += 13;

    /* ── Amount in words ──────────────────────────────────────── */
    const words = doc.splitTextToSize(inWords(received), right - M - 36) as string[];
    const wh = Math.max(13, words.length * 4.6 + 8);
    fill(TEAL_PALE);
    draw(RULE);
    doc.roundedRect(M, y - 5, right - M, wh, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.3);
    col(MUTED);
    doc.text("AMOUNT IN WORDS", M + 4, y);
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(9.6);
    col(TEAL_DARK);
    doc.text(words, M + 4, y + 5.4);
    y += wh + 5;

    /* ── Note ─────────────────────────────────────────────────── */
    if (note.trim()) {
      const nl = doc.splitTextToSize(note.trim(), right - M - 30) as string[];
      const nh = Math.max(13, nl.length * 4.4 + 8);
      fill(NOTE_BG);
      draw(RULE);
      doc.roundedRect(M, y - 5, right - M, nh, 2, 2, "FD");
      // An orange keyline marks it as an aside rather than another figure.
      fill(ORANGE);
      doc.rect(M, y - 5, 1.6, nh, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.3);
      col(MUTED);
      doc.text("NOTE", M + 6, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      col(INK);
      doc.text(nl, M + 6, y + 5.4);
      y += nh + 5;
    }

    /* ── Settling the balance, or the terms ───────────────────── */
    // A part-paid receipt raises a question — how do I pay the rest? — so the
    // answer belongs on the document rather than in a phone call.
    const payLines =
      balance > 0
        ? [
            `Balance of ${ugx(balance)} may be paid by:`,
            `MTN Mobile Money  ·  ${MOMO.mtn}`,
            `Airtel Money  ·  ${MOMO.airtel}`,
            "Cash or card at our shop in Kampala.",
          ]
        : [
            "This receipt confirms payment in full for the items listed above.",
            "Please keep it — it is required for any warranty claim or exchange.",
          ];

    const ph = payLines.length * 4.6 + 10;
    fill(SOFT);
    draw(RULE);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y - 5, right - M, ph, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.3);
    col(MUTED);
    doc.text(balance > 0 ? "HOW TO PAY THE BALANCE" : "TERMS", M + 4, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    col(INK);
    let py = y + 5.8;
    for (const t of payLines) {
      doc.text(t, M + 4, py);
      py += 4.6;
    }
    y += ph + 6;

    /* ── Signature ────────────────────────────────────────────── */
    // A floor keeps the signature in the same place on every receipt, which
    // is what makes a stack of them look like one company's paperwork.
    y = Math.max(y + 4, 214);

    if (sign.current) {
      doc.addImage(sign.current, "PNG", M + 1, y - 0.3, 52, 10.8);
    } else {
      doc.setFont("times", "bolditalic");
      doc.setFontSize(19);
      col(TEAL);
      doc.text("onlinetechug", M + 3, y + 5);
    }

    draw(PEN);
    doc.setLineWidth(0.3);
    doc.line(M, y + 9, M + 72, y + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    col(INK);
    doc.text("AUTHORISED SIGNATURE", M, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    col(MUTED);
    doc.text(signatory.trim() || "Online Tech Uganda", M, y + 18.6);
    doc.text("For and on behalf of Online Tech Uganda", M, y + 22.8);

    draw(STAMP);
    doc.setLineWidth(0.4);
    doc.circle(right - 19, y + 9, 16.5);
    doc.setFontSize(7);
    doc.setTextColor(185, 195, 198);
    doc.text("COMPANY", right - 19, y + 7.6, { align: "center" });
    doc.text("STAMP", right - 19, y + 11.4, { align: "center" });

    /* ── Footer ───────────────────────────────────────────────── */
    fill(TEAL);
    doc.rect(0, H - 14, W, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.4);
    doc.setTextColor(255, 255, 255);
    doc.text("Thank you for your business.", W / 2, H - 8.6, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(200, 232, 241);
    doc.text(
      "Goods received in good condition · Warranty as stated at the time of sale · Keep this receipt, it is required for any claim",
      W / 2,
      H - 4.4,
      { align: "center" },
    );

    return doc;
  }

  function fileName() {
    const who = (party === "business" ? business || name : name).trim().replace(/\s+/g, "-");
    return `Receipt-${num.replace(/\//g, "-")}-${who || "customer"}.pdf`;
  }

  async function run(mode: "print" | "download" | "share") {
    if (!ready) return;
    setBusy(true);
    setMsg("");
    try {
      const doc = await build();

      if (mode === "print") {
        doc.autoPrint();
        window.open(doc.output("bloburl") as unknown as string, "_blank");
      } else if (mode === "download") {
        doc.save(fileName());
      } else {
        const file = new File([doc.output("blob") as Blob], fileName(), {
          type: "application/pdf",
        });
        const nav = navigator as Navigator & {
          canShare?: (d: { files?: File[] }) => boolean;
          share?: (d: { files?: File[]; title?: string; text?: string }) => Promise<void>;
        };
        if (nav.share && nav.canShare?.({ files: [file] })) {
          await nav.share({
            files: [file],
            title: `Receipt ${num}`,
            text: `Receipt ${num} from Online Tech Uganda`,
          });
        } else {
          // Desktop browsers cannot share a file — hand over the PDF instead.
          doc.save(fileName());
          setMsg(
            "This browser can't share files directly, so the PDF was downloaded — attach it to WhatsApp or email.",
          );
        }
      }

      bumpNumber();
      setNum(peekNumber(date));
    } catch {
      setMsg("Couldn't create the receipt. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Receipts</h1>
        <p className="text-sm text-ink-600/60">
          Issue a receipt for anything a client pays for — a computer, a repair, a course or a
          software job. Print it, or share the PDF straight to WhatsApp.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          {/* Who paid */}
          <div className="flex flex-wrap gap-2">
            {(["individual", "business"] as Party[]).map((p) => (
              <button
                key={p}
                onClick={() => setParty(p)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  party === p
                    ? "bg-brand-500 text-white"
                    : "border border-ink-600/15 text-ink-600 hover:border-brand-400"
                }`}
              >
                {p === "individual" ? "Individual" : "Business / Organisation"}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {party === "business" && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-700">Business name</label>
                <input
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="e.g. Kampala Parents School"
                  className={input}
                />
              </div>
            )}
            <div className={party === "business" ? "" : "sm:col-span-2"}>
              <label className="block text-sm font-semibold text-ink-700">
                {party === "business" ? "Contact person" : "Customer name"}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className={input}
              />
            </div>
            {party === "business" && (
              <div>
                <label className="block text-sm font-semibold text-ink-700">Their TIN</label>
                <input
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  placeholder="Optional"
                  className={input}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-ink-700">Contact number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xx xxx xxx"
                className={input}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Optional"
                className={input}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Nakawa, Kampala"
                className={input}
              />
            </div>
          </div>

          {/* What was paid for */}
          <div className="mt-6 border-t border-ink-600/10 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-ink-700">What was paid for</p>
              <button
                onClick={addLine}
                className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-bold text-ink-600 hover:bg-ink-50"
              >
                + Add item
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_56px_104px_26px] items-center gap-2">
                  <input
                    value={l.desc}
                    onChange={(e) => setLine(i, { desc: e.target.value })}
                    placeholder="e.g. HP EliteBook 840 G8 — Core i5, 8GB, 256GB SSD"
                    className="rounded-md border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    min={1}
                    value={l.qty}
                    onChange={(e) => setLine(i, { qty: Number(e.target.value) })}
                    className="rounded-md border border-ink-600/15 px-2 py-2 text-center text-sm focus:border-brand-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    value={l.price || ""}
                    onChange={(e) => setLine(i, { price: Number(e.target.value) })}
                    placeholder="Price"
                    className="rounded-md border border-ink-600/15 px-2 py-2 text-right text-sm focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    onClick={() => dropLine(i)}
                    disabled={lines.length === 1}
                    title="Remove this item"
                    className="text-sm text-ink-600/50 transition hover:text-red-600 disabled:opacity-25"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="mt-6 grid gap-4 border-t border-ink-600/10 pt-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-ink-700">Paid by</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={input}>
                {METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Amount received</label>
              <input
                type="number"
                min={0}
                value={paid}
                onChange={(e) => setPaid(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder={total ? String(total) : "0"}
                className={input}
              />
              <p className="mt-1 text-[11px] text-ink-600/55">
                Leave blank if they paid in full. Enter less for a deposit — the balance then shows
                on the receipt.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Receipt date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Signed by</label>
              <input
                value={signatory}
                onChange={(e) => setSignatory(e.target.value)}
                className={input}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Note on the receipt</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. 6 months warranty on the battery · Balance due on delivery"
                className={input}
              />
            </div>
          </div>

          {!ready && (
            <p className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-800">
              <span aria-hidden>⚠️</span>
              <span>
                Before you can issue this receipt, add{" "}
                {name.trim().length > 1 ? "" : <b>the customer&apos;s name</b>}
                {name.trim().length > 1 || total > 0 ? "" : " and "}
                {total > 0 ? "" : <b>one priced item</b>}.
              </span>
            </p>
          )}

          <div className={`mt-4 flex flex-wrap gap-2 ${ready ? "" : "opacity-60"}`}>
            <button
              onClick={() => run("print")}
              disabled={busy || !ready}
              className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ink-600/25 disabled:shadow-none"
            >
              {busy ? "Preparing…" : "🖨️ Print receipt"}
            </button>
            <button
              onClick={() => run("share")}
              disabled={busy || !ready}
              className="rounded-lg bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-ink-600/25 disabled:shadow-none"
            >
              📲 Share to client
            </button>
            <button
              onClick={() => run("download")}
              disabled={busy || !ready}
              className="rounded-lg border border-ink-600/20 bg-white px-6 py-3 text-sm font-bold text-ink-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:text-ink-600/40"
            >
              ⬇️ Download PDF
            </button>
          </div>
          {msg && <p className="mt-3 text-xs font-semibold text-ink-700">{msg}</p>}
        </section>

        {/* Live summary of what will print */}
        <section className="h-fit space-y-3">
          <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-extrabold text-ink-600">Receipt</h2>
              <span className="rounded-md bg-ink-50 px-2 py-1 font-mono text-[11px] text-ink-700">
                {num}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-600/60">{long(date)}</p>

            <div className="mt-3 border-t border-ink-600/10 pt-3 text-sm">
              <p className="font-bold text-ink-700">
                {(party === "business" ? business || name : name).trim() || "—"}
              </p>
              <p className="text-xs text-ink-600/60">
                {party === "business" ? "Business / Organisation" : "Individual"}
                {phone.trim() ? ` · ${phone.trim()}` : ""}
              </p>
            </div>

            <div className="mt-3 space-y-1.5 border-t border-ink-600/10 pt-3 text-sm">
              {lines
                .filter((l) => l.desc.trim() || l.price)
                .map((l, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span className="line-clamp-1 text-ink-600/75">
                      {l.qty > 1 ? `${l.qty} × ` : ""}
                      {l.desc.trim() || "—"}
                    </span>
                    <span className="shrink-0 font-semibold text-ink-700">
                      {((Number(l.qty) || 0) * (Number(l.price) || 0)).toLocaleString("en-UG")}
                    </span>
                  </div>
                ))}
              {total === 0 && <p className="text-xs text-ink-600/50">No items yet.</p>}
            </div>

            <div className="mt-3 border-t border-ink-600/10 pt-3 text-sm">
              <div className="flex justify-between text-ink-600/75">
                <span>Total</span>
                <span className="font-semibold text-ink-700">{ugx(total)}</span>
              </div>
              <div className="mt-1 flex justify-between font-extrabold text-ink-700">
                <span>Paid</span>
                <span>{ugx(received)}</span>
              </div>
              {balance > 0 && (
                <div className="mt-1 flex justify-between font-bold text-red-600">
                  <span>Balance due</span>
                  <span>{ugx(balance)}</span>
                </div>
              )}
              <p className="mt-2 text-[11px] italic leading-relaxed text-ink-600/60">
                {inWords(received)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-ink-700">Every receipt carries:</p>
            <ul className="mt-1.5 space-y-1 text-xs text-ink-600/70">
              {[
                "Your letterhead, phones and email",
                "A traceable receipt number",
                "Itemised description, quantity and price",
                "The amount in figures and in words",
                "How they paid, and any balance due",
                "The onlinetechug mark and authorised signature",
                "Space for your company stamp",
              ].map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
            <p className="mt-3 border-t border-ink-600/10 pt-3 text-[11px] text-ink-600/55">
              Numbers run in order on this device. Sign and stamp before handing it over.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
