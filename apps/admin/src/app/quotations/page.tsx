"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  COMPANY,
  MOMO,
  TEAL,
  TEAL_DARK,
  TEAL_PALE,
  ORANGE,
  INK,
  MUTED,
  RULE,
  ZEBRA,
  SOFT,
  PEN,
  STAMP,
  type RGB,
  todayISO,
  addDays,
  long,
  ugx,
  loadImg,
  inWords,
  nextNumber,
  bumpNumber,
  type Line,
} from "@/lib/doc-kit";
import { PRESETS, detectJob } from "@/lib/quote-presets";

/**
 * Quotations for the clients who ask for one.
 *
 * A request arrives through the website and lands in Leads. Until now the
 * reply had to be written by hand in Word, which is why quotes went out slowly
 * and looked nothing like the receipts that followed them.
 *
 * Open this from a lead and the client's details come with it, so the job is
 * to price the work rather than retype a name and a phone number.
 */

type Party = "individual" | "business";

const SEQ_KEY = "otu.quotation.seq";

const DEFAULT_TERMS = [
  "50% to begin, 30% at a working version, 20% on handover.",
  "Work begins once the first payment is received and the scope is signed off.",
  "One round of revisions is included at each stage; further changes are quoted separately.",
  "Anything not listed under Scope is not included in this price.",
];

function QuotationInner() {
  const params = useSearchParams();

  const [party, setParty] = useState<Party>("business");
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [tin, setTin] = useState("");

  const [subject, setSubject] = useState("");
  const [lines, setLines] = useState<Line[]>([{ desc: "", qty: 1, price: 0 }]);
  const [scope, setScope] = useState("");
  const [excludes, setExcludes] = useState("");
  const [terms, setTerms] = useState(DEFAULT_TERMS.join("\n"));
  const [timeline, setTimeline] = useState("");
  const [date, setDate] = useState(todayISO());
  const [validDays, setValidDays] = useState(30);
  const [signatory, setSignatory] = useState("Agaba Geofrey");

  const [num, setNum] = useState("OTU/QTN/0000/0001");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  // Which template the request matched, so the admin can see what was assumed.
  const [matched, setMatched] = useState("");

  const logo = useRef<HTMLImageElement | null>(null);
  const sign = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    loadImg("/logo-lockup.png").then((i) => (logo.current = i));
    loadImg("/signature.png").then((i) => (sign.current = i));
  }, []);

  useEffect(() => setNum(nextNumber("QTN", SEQ_KEY, date)), [date]);

  // Opened from a lead: bring the client's details rather than retyping them.
  useEffect(() => {
    const g = (k: string) => params.get(k) ?? "";
    if (g("name")) setName(g("name"));
    if (g("business")) {
      setBusiness(g("business"));
      setParty("business");
    }
    if (g("phone")) setPhone(g("phone"));
    if (g("email")) setEmail(g("email"));
    if (g("subject")) setSubject(g("subject"));

    // Build the quote from what they asked for, rather than opening empty.
    const asked = `${g("subject")} ${g("note")}`.trim();
    if (asked) {
      const preset = detectJob(asked);
      if (preset) {
        setLines(preset.lines.map((l) => ({ ...l })));
        setScope(preset.scope);
        setExcludes(preset.excludes);
        setMatched(preset.label);
      } else {
        setMatched("");
      }
    }
  }, [params]);

  const total = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
  const ready = (party === "business" ? business.trim() || name.trim() : name.trim()).length > 1 && total > 0;

  function setLine(i: number, patch: Partial<Line>) {
    setLines((p) => p.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  const addLine = () => setLines((p) => [...p, { desc: "", qty: 1, price: 0 }]);
  const dropLine = (i: number) => setLines((p) => (p.length === 1 ? p : p.filter((_, x) => x !== i)));

  function applyPreset(p: (typeof PRESETS)[number]) {
    setLines(p.lines.map((l) => ({ ...l })));
    setScope(p.scope);
    setExcludes(p.excludes);
    if (!subject.trim()) setSubject(p.label);
    setMsg("");
  }

  async function build() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210;
    const H = 297;
    const M = 15;
    const right = W - M;

    const col = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
    const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
    const draw = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);

    /** Starts a new page when the next block wouldn't fit above the footer. */
    const room = (needed: number, y: number) => {
      if (y + needed < H - 18) return y;
      doc.addPage();
      return 22;
    };

    /* ── Letterhead ───────────────────────────────────────────── */
    const HB = 36;
    fill(TEAL);
    doc.rect(0, 0, W, HB, "F");
    fill(TEAL_DARK);
    doc.triangle(W, 0, W, HB, W - 74, 0, "F");

    if (logo.current) {
      doc.addImage(logo.current, "PNG", M, 8, 56, 13);
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

    /* ── Title, number and dates ──────────────────────────────── */
    let y = 52;
    col(TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text("QUOTATION", M, y);
    doc.setFontSize(8);
    col(MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(subject.trim() || "Prepared at your request", M, y + 5.5);

    const bx = right - 72;
    const by = 40;
    const bw = 72;
    fill(TEAL_PALE);
    draw(RULE);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, by, bw, 25, 2, 2, "FD");
    doc.setFontSize(7.5);
    col(MUTED);
    doc.text("QUOTATION No.", bx + 4, by + 6);
    doc.text("DATE", bx + 4, by + 13);
    doc.text("VALID UNTIL", bx + 4, by + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    col(TEAL);
    doc.text(num, bx + bw - 4, by + 6, { align: "right" });
    col(INK);
    doc.text(long(date), bx + bw - 4, by + 13, { align: "right" });
    doc.text(long(addDays(date, validDays)), bx + bw - 4, by + 20, { align: "right" });

    y += 14;

    /* ── Who it is for ───────────────────────────────────────── */
    const who = party === "business" ? business.trim() || name.trim() : name.trim();
    const forLines: string[] = [];
    if (party === "business" && name.trim()) forLines.push(`Attn: ${name.trim()}`);
    if (tin.trim()) forLines.push(`TIN: ${tin.trim()}`);
    if (address.trim()) forLines.push(address.trim());
    const reach = [phone.trim(), email.trim()].filter(Boolean).join("   ·   ");
    if (reach) forLines.push(reach);

    const boxH = Math.max(24, 14 + forLines.length * 4.4);
    draw(RULE);
    doc.roundedRect(M, y, right - M, boxH, 2, 2, "D");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    col(MUTED);
    doc.text("PREPARED FOR", M + 4, y + 6);
    doc.setFontSize(11.5);
    col(INK);
    doc.text(doc.splitTextToSize(who, right - M - 8)[0] as string, M + 4, y + 12.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    col(MUTED);
    let ly = y + 17.5;
    for (const t of forLines) {
      doc.text(doc.splitTextToSize(t, right - M - 8)[0] as string, M + 4, ly);
      ly += 4.4;
    }
    y += boxH + 9;

    /* ── Priced items ─────────────────────────────────────────── */
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
      y = room(h, y);
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
    y += 4;

    fill(TEAL);
    doc.roundedRect(cQty - 16, y - 6, right - (cQty - 16), 11, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL", cQty - 12, y + 1.2);
    doc.text(ugx(total), cAmt, y + 1.2, { align: "right" });
    y += 13;

    const words = doc.splitTextToSize(inWords(total), right - M - 36) as string[];
    const wh = Math.max(13, words.length * 4.6 + 8);
    y = room(wh, y);
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
    y += wh + 6;

    /* ── Scope, exclusions, timeline, terms ───────────────────── */
    const block = (title: string, body: string, accent: RGB) => {
      const items = body
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);
      if (items.length === 0) return;

      const wrapped = items.flatMap((t) => doc.splitTextToSize(`•  ${t}`, right - M - 14) as string[]);
      const h = wrapped.length * 4.6 + 10;
      y = room(h, y);

      fill(SOFT);
      draw(RULE);
      doc.setLineWidth(0.3);
      doc.roundedRect(M, y - 5, right - M, h, 2, 2, "FD");
      fill(accent);
      doc.rect(M, y - 5, 1.6, h, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.3);
      col(MUTED);
      doc.text(title, M + 6, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.6);
      col(INK);
      doc.text(wrapped, M + 6, y + 5.6);
      y += h + 5;
    };

    block("WHAT IS INCLUDED", scope, TEAL);
    block("NOT INCLUDED IN THIS PRICE", excludes, ORANGE);
    if (timeline.trim()) block("TIMELINE", timeline, TEAL_DARK);
    block("TERMS", terms, TEAL);

    // How to pay, so accepting the quote doesn't need a phone call.
    block(
      "HOW TO PAY",
      `MTN Mobile Money  ·  ${MOMO.mtn}\nAirtel Money  ·  ${MOMO.airtel}\nCash or card at our shop in Kampala.`,
      TEAL,
    );

    /* ── Signature ────────────────────────────────────────────── */
    y = room(36, y + 6);

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

    // Somewhere for the client to sign their acceptance.
    draw(STAMP);
    doc.setLineWidth(0.3);
    doc.line(right - 72, y + 9, right, y + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    col(INK);
    doc.text("ACCEPTED BY (CLIENT)", right - 72, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    col(MUTED);
    doc.text("Name, signature and date", right - 72, y + 18.6);

    /* ── Footer on every page ─────────────────────────────────── */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      fill(TEAL);
      doc.rect(0, H - 14, W, 14, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.4);
      doc.setTextColor(255, 255, 255);
      doc.text(
        `This quotation is valid until ${long(addDays(date, validDays))}.`,
        W / 2,
        H - 8.6,
        { align: "center" },
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(200, 232, 241);
      doc.text(
        `${COMPANY.name}  ·  ${COMPANY.address}  ·  ${COMPANY.phone}  ·  ${COMPANY.email}  ·  Page ${i} of ${pages}`,
        W / 2,
        H - 4.4,
        { align: "center" },
      );
    }

    return doc;
  }

  function fileName() {
    const w = (party === "business" ? business || name : name).trim().replace(/\s+/g, "-");
    return `Quotation-${num.replace(/\//g, "-")}-${w || "client"}.pdf`;
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
        const file = new File([doc.output("blob") as Blob], fileName(), { type: "application/pdf" });
        const nav = navigator as Navigator & {
          canShare?: (d: { files?: File[] }) => boolean;
          share?: (d: { files?: File[]; title?: string; text?: string }) => Promise<void>;
        };
        if (nav.share && nav.canShare?.({ files: [file] })) {
          await nav.share({ files: [file], title: `Quotation ${num}`, text: `Quotation ${num} from Online Tech Uganda` });
        } else {
          doc.save(fileName());
          setMsg("This browser can't share files, so the PDF was downloaded — attach it to email or WhatsApp.");
        }
      }
      bumpNumber(SEQ_KEY);
      setNum(nextNumber("QTN", SEQ_KEY, date));
    } catch {
      setMsg("Couldn't create the quotation. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Quotations</h1>
        <p className="text-sm text-ink-600/60">
          Price a job and send it on your letterhead. Open this from a lead and the client&apos;s
          details come with it.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          {/* Presets */}
          <p className="text-sm font-bold text-ink-700">Start from a typical job</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="rounded-full border border-ink-600/15 px-3 py-1.5 text-[11px] font-bold text-ink-600 transition hover:border-brand-400 hover:text-brand-600"
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-600/55">
            Fills the lines, scope and exclusions with a starting point. Change anything before you
            send it — these are not fixed prices.
          </p>

          {matched && (
            <p className="mt-2.5 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-xs font-semibold text-green-800">
              ✓ Built from their request as a <b>{matched}</b> job — figures, scope and exclusions
              are filled in. Read them through and adjust before sending.
            </p>
          )}

          {/* Client */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-600/10 pt-4">
            {(["business", "individual"] as Party[]).map((p) => (
              <button
                key={p}
                onClick={() => setParty(p)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  party === p
                    ? "bg-brand-500 text-white"
                    : "border border-ink-600/15 text-ink-600 hover:border-brand-400"
                }`}
              >
                {p === "business" ? "Business / Organisation" : "Individual"}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {party === "business" && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-700">Organisation</label>
                <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="e.g. Kampala Parents School" className={input} />
              </div>
            )}
            <div className={party === "business" ? "" : "sm:col-span-2"}>
              <label className="block text-sm font-semibold text-ink-700">
                {party === "business" ? "Contact person" : "Client name"}
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={input} />
            </div>
            {party === "business" && (
              <div>
                <label className="block text-sm font-semibold text-ink-700">Their TIN</label>
                <input value={tin} onChange={(e) => setTin(e.target.value)} placeholder="Optional" className={input} />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-ink-700">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">What is being quoted</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mobile App Development" className={input} />
            </div>
          </div>

          {/* Lines */}
          <div className="mt-6 border-t border-ink-600/10 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-ink-700">The work, priced</p>
              <button
                onClick={addLine}
                className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-bold text-ink-600 hover:bg-ink-50"
              >
                + Add line
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_56px_110px_26px] items-center gap-2">
                  <input
                    value={l.desc}
                    onChange={(e) => setLine(i, { desc: e.target.value })}
                    placeholder="What this stage or item covers"
                    className="rounded-md border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                  <input type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} className="rounded-md border border-ink-600/15 px-2 py-2 text-center text-sm focus:border-brand-500 focus:outline-none" />
                  <input type="number" min={0} value={l.price || ""} onChange={(e) => setLine(i, { price: Number(e.target.value) })} placeholder="Price" className="rounded-md border border-ink-600/15 px-2 py-2 text-right text-sm focus:border-brand-500 focus:outline-none" />
                  <button onClick={() => dropLine(i)} disabled={lines.length === 1} title="Remove" className="text-sm text-ink-600/50 transition hover:text-red-600 disabled:opacity-25">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div className="mt-6 grid gap-4 border-t border-ink-600/10 pt-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-ink-700">What is included</label>
              <textarea value={scope} onChange={(e) => setScope(e.target.value)} rows={6} placeholder="One per line" className={input} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Not included</label>
              <textarea value={excludes} onChange={(e) => setExcludes(e.target.value)} rows={6} placeholder="One per line — this is what protects you later" className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Timeline</label>
              <textarea value={timeline} onChange={(e) => setTimeline(e.target.value)} rows={2} placeholder="One per line, e.g. Design: 1 week · Build: 4 weeks" className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Terms</label>
              <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={4} className={input} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Valid for (days)</label>
              <input type="number" min={1} value={validDays} onChange={(e) => setValidDays(Number(e.target.value) || 30)} className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Signed by</label>
              <input value={signatory} onChange={(e) => setSignatory(e.target.value)} className={input} />
            </div>
          </div>

          {!ready && (
            <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-800">
              ⚠️ Add the client&apos;s name and at least one priced line to issue the quotation.
            </p>
          )}

          <div className={`mt-4 flex flex-wrap gap-2 ${ready ? "" : "opacity-60"}`}>
            <button onClick={() => run("print")} disabled={busy || !ready} className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ink-600/25 disabled:shadow-none">
              {busy ? "Preparing…" : "🖨️ Print quotation"}
            </button>
            <button onClick={() => run("share")} disabled={busy || !ready} className="rounded-lg bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-ink-600/25 disabled:shadow-none">
              📲 Send to client
            </button>
            <button onClick={() => run("download")} disabled={busy || !ready} className="rounded-lg border border-ink-600/20 bg-white px-6 py-3 text-sm font-bold text-ink-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:text-ink-600/40">
              ⬇️ Download PDF
            </button>
          </div>
          {msg && <p className="mt-3 text-xs font-semibold text-ink-700">{msg}</p>}
        </section>

        {/* Live summary */}
        <section className="h-fit space-y-3">
          <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-extrabold text-ink-600">Quotation</h2>
              <span className="rounded-md bg-ink-50 px-2 py-1 font-mono text-[11px] text-ink-700">{num}</span>
            </div>
            <p className="mt-1 text-xs text-ink-600/60">
              {long(date)} · valid until {long(addDays(date, validDays))}
            </p>

            <div className="mt-3 border-t border-ink-600/10 pt-3 text-sm">
              <p className="font-bold text-ink-700">
                {(party === "business" ? business || name : name).trim() || "—"}
              </p>
              <p className="text-xs text-ink-600/60">{subject || "No subject yet"}</p>
            </div>

            <div className="mt-3 space-y-1.5 border-t border-ink-600/10 pt-3 text-sm">
              {lines
                .filter((l) => l.desc.trim() || l.price)
                .map((l, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span className="line-clamp-1 text-ink-600/75">{l.desc.trim() || "—"}</span>
                    <span className="shrink-0 font-semibold text-ink-700">
                      {((Number(l.qty) || 0) * (Number(l.price) || 0)).toLocaleString("en-UG")}
                    </span>
                  </div>
                ))}
              {total === 0 && <p className="text-xs text-ink-600/50">Nothing priced yet.</p>}
            </div>

            <div className="mt-3 border-t border-ink-600/10 pt-3">
              <div className="flex justify-between text-base font-extrabold text-ink-700">
                <span>Total</span>
                <span>{ugx(total)}</span>
              </div>
              <p className="mt-2 text-[11px] italic leading-relaxed text-ink-600/60">{inWords(total)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-ink-700">Every quotation carries:</p>
            <ul className="mt-1.5 space-y-1 text-xs text-ink-600/70">
              {[
                "Your letterhead, phones and email",
                "A traceable number and an expiry date",
                "The work priced line by line",
                "What is included — and what is not",
                "Payment terms and how to pay",
                "Your signature, and a line for theirs",
              ].map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
            <p className="mt-3 border-t border-ink-600/10 pt-3 text-[11px] text-ink-600/55">
              The &quot;Not included&quot; list is the part that protects you when a client asks for
              something later. Don&apos;t leave it empty.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-600/50">Loading…</p>}>
      <QuotationInner />
    </Suspense>
  );
}
