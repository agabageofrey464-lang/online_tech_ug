"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Certificate issuer — the owner decides who gets certified.
 *
 * Certificates are no longer handed out automatically when a learner passes an
 * online quiz. They are printed here, by an administrator, for people who
 * actually attended and completed a course.
 */

const COURSES = [
  "Computer Basics",
  "Microsoft Office",
  "Microsoft Word",
  "Microsoft Excel",
  "Microsoft PowerPoint",
  "Microsoft Access",
  "Microsoft Publisher",
  "Internet & Email",
  "Typing Skills",
  "Graphic Design",
  "Web Development",
  "Digital Marketing",
  "Advanced Excel & Data Analysis",
  "Computer Networking & IT Essentials",
  "Cybersecurity Basics",
  "Video Editing",
  "Python Programming",
  "Mobile App Development",
  "AutoCAD",
  "QuickBooks Accounting",
  "Microsoft 365 & Teams",
  "Photography & Photo Editing",
];

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Stable-looking serial so every certificate can be traced in your records. */
function makeSerial(name: string, course: string, date: string) {
  const seed = [...(name + course + date)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const yr = date.slice(0, 4);
  return `OTU/${yr}/${String(seed % 9000 + 1000)}`;
}

export default function CertificatesPage() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState(COURSES[0]);
  const [date, setDate] = useState(todayISO());
  const [mode, setMode] = useState<"Physical" | "Online">("Physical");
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<{ name: string; course: string; serial: string }[]>([]);

  const logo = useRef<HTMLImageElement | null>(null);
  const sign = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    loadImg("/logo-mark.png").then((i) => (logo.current = i));
    loadImg("/signature.png").then((i) => (sign.current = i));
    try {
      const raw = localStorage.getItem("otu_issued_certs");
      if (raw) setIssued(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const serial = makeSerial(name.trim() || "—", course, date);

  async function generate(print: boolean) {
    const learner = name.trim();
    if (!learner) return;
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = 297;
      const cx = W / 2;
      const shown = new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Borders
      doc.setDrawColor(40, 35, 99);
      doc.setLineWidth(3);
      doc.rect(6, 6, W - 12, 210 - 12);
      doc.setDrawColor(241, 90, 41);
      doc.setLineWidth(0.6);
      doc.rect(11, 11, W - 22, 210 - 22);

      if (logo.current) {
        doc.addImage(logo.current, "PNG", cx - 32, 18, 64, 23);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(241, 90, 41);
        doc.text("ONLINE TECH UGANDA", cx, 36, { align: "center" });
      }

      doc.setFont("times", "bold");
      doc.setFontSize(30);
      doc.setTextColor(40, 35, 99);
      doc.text("Certificate of Completion", cx, 66, { align: "center" });

      // Ornamental divider
      doc.setDrawColor(241, 90, 41);
      doc.setLineWidth(0.4);
      doc.line(cx - 42, 73, cx - 6, 73);
      doc.line(cx + 6, 73, cx + 42, 73);
      doc.setFillColor(241, 90, 41);
      doc.triangle(cx, 70.6, cx - 2.4, 73, cx, 75.4, "F");
      doc.triangle(cx, 70.6, cx + 2.4, 73, cx, 75.4, "F");

      doc.setFont("times", "normal");
      doc.setFontSize(13);
      doc.setTextColor(90, 90, 90);
      doc.text("This certifies that", cx, 84, { align: "center" });

      doc.setFont("times", "bolditalic");
      doc.setFontSize(26);
      doc.setTextColor(40, 35, 99);
      doc.text(learner, cx, 98, { align: "center" });
      const nameW = doc.getTextWidth(learner);
      doc.setDrawColor(241, 90, 41);
      doc.setLineWidth(0.5);
      doc.line(cx - nameW / 2 - 8, 101, cx + nameW / 2 + 8, 101);

      doc.setFont("times", "normal");
      doc.setFontSize(13);
      doc.setTextColor(90, 90, 90);
      doc.text(`has successfully completed the ${mode.toLowerCase()} course`, cx, 114, {
        align: "center",
      });

      doc.setFont("times", "bold");
      doc.setFontSize(17);
      doc.setTextColor(50, 50, 50);
      doc.text(course, cx, 124, { align: "center" });

      // Footer: date and signature
      const baseY = 172;
      const colW = 62;
      const leftCx = cx - 62;
      const rightCx = cx + 62;

      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.4);
      doc.line(leftCx - colW / 2, baseY, leftCx + colW / 2, baseY);
      doc.line(rightCx - colW / 2, baseY, rightCx + colW / 2, baseY);

      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text(shown, leftCx, baseY - 3, { align: "center" });

      if (sign.current) doc.addImage(sign.current, "PNG", rightCx - 20, baseY - 20, 40, 18);

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("DATE", leftCx, baseY + 6, { align: "center" });
      doc.text("AUTHORISED SIGNATURE", rightCx, baseY + 6, { align: "center" });

      // Serial — so a certificate can be verified against your records
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Certificate No. ${serial}`, cx, 192, { align: "center" });

      if (print) {
        doc.autoPrint();
        window.open(doc.output("bloburl") as unknown as string, "_blank");
      } else {
        doc.save(`${learner.replace(/\s+/g, "-")}-${course.replace(/\s+/g, "-")}.pdf`);
      }

      const next = [{ name: learner, course, serial }, ...issued].slice(0, 50);
      setIssued(next);
      try {
        localStorage.setItem("otu_issued_certs", JSON.stringify(next));
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false);
    }
  }

  const input =
    "mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Certificates</h1>
        <p className="text-sm text-ink-600/60">
          Issue a certificate to someone who has completed a course. You decide who gets one —
          nothing is handed out automatically.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-ink-600">Details</h2>

          <label className="mt-4 block text-sm font-semibold text-ink-700">
            Student&apos;s full name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nakato Sarah"
            className={input}
          />

          <label className="mt-4 block text-sm font-semibold text-ink-700">Course</label>
          <input
            list="otu-courses"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className={input}
          />
          <datalist id="otu-courses">
            {COURSES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-ink-600/50">
            Pick from the list or type any course — useful for group and on-site training.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-ink-700">Completion date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Attended</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "Physical" | "Online")}
                className={input}
              >
                <option>Physical</option>
                <option>Online</option>
              </select>
            </div>
          </div>

          <p className="mt-4 rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-600/70">
            Certificate No. <b className="font-mono text-ink-700">{serial}</b> — printed on the
            certificate so you can trace it in your records.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => generate(true)}
              disabled={busy || !name.trim()}
              className="rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Preparing…" : "🖨️ Print certificate"}
            </button>
            <button
              onClick={() => generate(false)}
              disabled={busy || !name.trim()}
              className="rounded-md border border-ink-600/20 px-6 py-2.5 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
            >
              ⬇️ Download PDF
            </button>
          </div>
        </section>

        <section className="h-fit rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-ink-600">Recently issued</h2>
          {issued.length === 0 ? (
            <p className="mt-3 text-sm text-ink-600/60">
              Nothing issued yet from this computer.
            </p>
          ) : (
            <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto text-sm">
              {issued.map((c, i) => (
                <li key={`${c.serial}-${i}`} className="border-b border-ink-600/5 pb-2">
                  <p className="font-semibold text-ink-800">{c.name}</p>
                  <p className="text-xs text-ink-600/60">{c.course}</p>
                  <p className="font-mono text-[11px] text-ink-600/45">{c.serial}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-ink-600/50">
            This list is kept in this browser only, as a convenience record.
          </p>
        </section>
      </div>
    </div>
  );
}
