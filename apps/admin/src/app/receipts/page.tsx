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

  useEffect(() => {
    loadImg("/logo.jpeg").then((i) => (logo.current = i));
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
    const M = 16;
    const right = W - M;

    /* ── Letterhead */
    doc.setFillColor(40, 35, 99);
    doc.rect(0, 0, W, 30, "F");
    if (logo.current) doc.addImage(logo.current, "JPEG", M, 5, 20, 20);
    const tx = logo.current ? M + 24 : M;
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(COMPANY.name, tx, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(255, 205, 185);
    doc.text(COMPANY.tagline, tx, 17.5);
    doc.text(
      `${COMPANY.address}  ·  ${COMPANY.phone} / ${COMPANY.phoneAlt}  ·  ${COMPANY.email}`,
      tx,
      22,
    );
    doc.text(COMPANY.site, tx, 26.5);

    doc.setFillColor(241, 90, 41);
    doc.rect(0, 30, W, 1.5, "F");

    /* ── Title, number and date */
    let y = 42;
    doc.setTextColor(40, 35, 99);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("RECEIPT", M, y);

    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`No.  ${num}`, right, y - 5, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`Date:  ${long(date)}`, right, y, { align: "right" });
    y += 6;
    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.4);
    doc.line(M, y, right, y);
    y += 9;

    /* ── Received from */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("RECEIVED FROM", M, y);
    y += 5.5;

    doc.setFontSize(12);
    doc.setTextColor(25, 25, 25);
    doc.text(party === "business" ? business.trim() || name.trim() : name.trim(), M, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const who: string[] = [];
    if (party === "business") {
      who.push(`Contact person: ${name.trim()}`);
      if (tin.trim()) who.push(`TIN: ${tin.trim()}`);
    } else {
      who.push("Individual customer");
    }
    if (address.trim()) who.push(address.trim());
    const reach = [phone.trim(), email.trim()].filter(Boolean).join("  ·  ");
    if (reach) who.push(reach);
    for (const w of who) {
      doc.text(w, M, y);
      y += 4.4;
    }
    y += 5;

    /* ── Items */
    const cQty = M + 105;
    const cPrice = M + 143;
    const cAmt = right;

    doc.setFillColor(40, 35, 99);
    doc.rect(M, y - 5, right - M, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("DESCRIPTION", M + 2, y);
    doc.text("QTY", cQty, y, { align: "right" });
    doc.text("UNIT PRICE", cPrice, y, { align: "right" });
    doc.text("AMOUNT", cAmt - 2, y, { align: "right" });
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    let shade = false;
    for (const l of lines) {
      if (!l.desc.trim() && !l.price) continue;
      const amt = (Number(l.qty) || 0) * (Number(l.price) || 0);
      const wrapped = doc.splitTextToSize(l.desc.trim() || "—", 96) as string[];
      const h = Math.max(7, wrapped.length * 4.6 + 2.5);
      if (shade) {
        doc.setFillColor(248, 248, 250);
        doc.rect(M, y - 4.5, right - M, h, "F");
      }
      shade = !shade;
      doc.text(wrapped, M + 2, y);
      doc.text(String(l.qty), cQty, y, { align: "right" });
      doc.text(Number(l.price).toLocaleString("en-UG"), cPrice, y, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(amt.toLocaleString("en-UG"), cAmt - 2, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += h;
    }

    doc.setDrawColor(225, 225, 225);
    doc.line(M, y - 3, right, y - 3);
    y += 4;

    /* ── Totals */
    const label = (t: string, v: string, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(9.5);
      doc.text(t, cPrice, y, { align: "right" });
      doc.text(v, cAmt - 2, y, { align: "right" });
      y += bold ? 6.5 : 5.5;
    };
    doc.setTextColor(60, 60, 60);
    label("Total", ugx(total));
    label("Amount paid", ugx(received));
    if (balance > 0) {
      doc.setTextColor(200, 60, 40);
      label("Balance due", ugx(balance), true);
      doc.setTextColor(60, 60, 60);
    }

    y += 2;
    doc.setFillColor(40, 35, 99);
    doc.rect(cQty - 12, y - 5.5, right - (cQty - 12), 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("PAID", cQty - 8, y + 0.5);
    doc.text(ugx(received), cAmt - 2, y + 0.5, { align: "right" });
    y += 12;

    /* ── Amount in words and payment method */
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("AMOUNT IN WORDS", M, y);
    y += 4.8;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 30, 30);
    const words = doc.splitTextToSize(inWords(received), right - M) as string[];
    doc.text(words, M, y);
    y += words.length * 4.8 + 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    doc.text("PAID BY", M, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 30, 30);
    doc.text(method, M + 24, y);
    y += 7;

    if (note.trim()) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text("NOTE", M, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      const nl = doc.splitTextToSize(note.trim(), right - M) as string[];
      doc.text(nl, M, y);
      y += nl.length * 4.4 + 3;
    }

    /* ── Signature block */
    y = Math.max(y + 8, 230);
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.4);
    doc.line(M, y - 6, right, y - 6);

    // The company mark sits above the rule; the signatory signs over it by hand.
    doc.setFont("times", "bolditalic");
    doc.setFontSize(17);
    doc.setTextColor(40, 35, 99);
    doc.text("onlinetechug", M + 2, y + 4);

    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.line(M, y + 8, M + 68, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text("AUTHORISED SIGNATURE", M, y + 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    doc.text(signatory.trim() || "Online Tech Uganda", M, y + 17.5);
    doc.text("For and on behalf of Online Tech Uganda", M, y + 21.5);

    // Stamp ring, to the right of the signature
    doc.setDrawColor(205, 205, 205);
    doc.circle(right - 20, y + 8, 16);
    doc.setFontSize(7);
    doc.setTextColor(185, 185, 185);
    doc.text("COMPANY STAMP", right - 20, y + 9, { align: "center" });

    /* ── Footer */
    doc.setDrawColor(235, 235, 235);
    doc.line(M, 278, right, 278);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Goods received in good condition. Warranty as stated at the time of sale. Keep this receipt — it is required for any claim.",
      W / 2,
      283,
      { align: "center" },
    );
    doc.text(
      `${COMPANY.name}  ·  ${COMPANY.address}  ·  ${COMPANY.phone}  ·  ${COMPANY.email}  ·  ${COMPANY.site}`,
      W / 2,
      288,
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

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => run("print")}
              disabled={busy || !ready}
              className="rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Preparing…" : "🖨️ Print receipt"}
            </button>
            <button
              onClick={() => run("share")}
              disabled={busy || !ready}
              className="rounded-md bg-green-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              📲 Share to client
            </button>
            <button
              onClick={() => run("download")}
              disabled={busy || !ready}
              className="rounded-md border border-ink-600/20 px-6 py-2.5 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
            >
              ⬇️ Download PDF
            </button>
          </div>

          {!ready && (
            <p className="mt-3 text-xs text-ink-600/55">
              Add the customer&apos;s name and at least one priced item to issue the receipt.
            </p>
          )}
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
