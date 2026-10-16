"use client";

import { useEffect, useRef, useState } from "react";
import { logoPlate } from "@/lib/doc-kit";
import { IT_FIELDS, OTHER_FIELDS } from "@/lib/internship-brochure-pdf";

/**
 * Internship letters.
 *
 * Ugandan institutions ask interns for a letter on company letterhead, both to
 * accept a placement and to confirm it was completed. This generates either,
 * addressed to the school, with a reference number the owner can trace.
 */

type LetterKind = "acceptance" | "completion";

/** A letter already issued, as the backend lists it. */
type Issued = {
  id: number;
  kind: string;
  title: string;
  reference: string;
  filename: string;
  size: number;
  created_at: string;
};

// The fields we offer, the same list as the brochure and the apply form.
const FIELDS = [...IT_FIELDS.map((f) => f.title), ...OTHER_FIELDS.map((f) => f.title)];

/** An application from the site, as the dashboard lists it. */
type Applicant = { id: number; name: string; job_title: string | null; message: string; status: string };

/** The "Key: value" lines the apply form writes, read back into fields. */
function readApplication(message: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of (message || "").split(/\r?\n/)) {
    const m = line.match(/^([^:]{2,40}):\s*(.*)$/);
    if (m) out[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return out;
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
/** "1 November – 18 December 2026" → two ISO dates, or null if it cannot be read. */
function readDates(text: string): [string, string] | null {
  const m = (text || "").match(/(\d{1,2})\s+([A-Za-z]+)\s*(\d{4})?\s*[–—-]+\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return null;
  const mo = (s: string) => MONTHS.findIndex((x) => x.startsWith(s.toLowerCase().slice(0, 3)));
  const y2 = Number(m[6]);
  const y1 = m[3] ? Number(m[3]) : mo(m[2]) > mo(m[5]) ? y2 - 1 : y2;
  if (mo(m[2]) < 0 || mo(m[5]) < 0) return null;
  const iso = (y: number, mIdx: number, d: string) => `${y}-${String(mIdx + 1).padStart(2, "0")}-${d.padStart(2, "0")}`;
  return [iso(y1, mo(m[2]), m[1]), iso(y2, mo(m[5]), m[4])];
}

/**
 * A paragraph answering what this student asked about in their note, so each
 * letter speaks to that student rather than being the same for everyone.
 */
function answerFor(note: string, district: string): string {
  const n = (note || "").toLowerCase();
  const parts: string[] = [];
  if (/log ?book|supervis|assess|form/.test(n))
    parts.push("The student will be assigned a named supervisor who will follow their work daily, sign their logbook each week, and complete the assessment forms the institution requires at the end of the placement.");
  if (/dut|day|work|job|busy|time|schedule|week/.test(n))
    parts.push("We have noted the student's other commitments. Sessions run three to four days a week, from 9:00 am to 12:00 pm, and we shall agree with the student a weekly timetable that allows for their other duties while meeting the hours the institution requires.");
  if (/laptop|computer|internet|data|network/.test(n))
    parts.push("Where the student lacks a suitable machine or connection for a session, arrangements can be made for them to work from our Kampala office.");
  if (/certif|letter|recommend/.test(n))
    parts.push("At the end of the placement the student will receive a completion letter on our letterhead, and we shall be glad to write a recommendation on request.");
  if (parts.length === 0 && district && !/kampala/i.test(district))
    parts.push(`The training is conducted online, so the student may take part from ${district} with a computer and an internet connection, joining the team's daily check-ins and live sessions.`);
  return parts.join(" ");
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const addMonths = (iso: string, n: number) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
};
const long = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function makeRef(name: string, date: string) {
  const seed = [...(name + date)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return `OTU/INT/${date.slice(0, 4)}/${String((seed % 900) + 100)}`;
}

export default function InternshipLettersPage() {
  const [kind, setKind] = useState<LetterKind>("acceptance");
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [programme, setProgramme] = useState("");
  const [regNo, setRegNo] = useState("");
  const [field, setField] = useState(FIELDS[0]);
  const [start, setStart] = useState(todayISO());
  const [end, setEnd] = useState(addMonths(todayISO(), 2));
  const [supervisor, setSupervisor] = useState("Agaba Geofrey");
  const [dated, setDated] = useState(todayISO());
  // What each applicant gave, so every letter speaks to that student.
  const [year, setYear] = useState("");
  const [addressee, setAddressee] = useState("");
  const [district, setDistrict] = useState("");
  const [answer, setAnswer] = useState("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [picked, setPicked] = useState("");
  const [busy, setBusy] = useState(false);
  // Every letter issued is kept on the backend, privately. Before this the
  // only copy was wherever the browser saved the download.
  const [issued, setIssued] = useState<Issued[]>([]);
  const [saved, setSaved] = useState<"" | "ok" | "failed">("");

  async function loadIssued() {
    try {
      const res = await fetch("/api/documents?kind=internship", { cache: "no-store" });
      if (res.ok) setIssued(await res.json());
    } catch {
      /* the list is a convenience; the page works without it */
    }
  }
  useEffect(() => {
    void loadIssued();
    fetch("/api/applications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Applicant[]) =>
        setApplicants((Array.isArray(rows) ? rows : []).filter((a) => /intern/i.test(a.job_title ?? "") || /field wanted:/i.test(a.message ?? ""))),
      )
      .catch(() => {});
  }, []);

  /** Fill the letter from one student's application. */
  function fillFrom(id: string) {
    setPicked(id);
    const a = applicants.find((x) => String(x.id) === id);
    if (!a) return;
    const f = readApplication(a.message);
    setName(a.name.trim());
    setInstitution(f["university"] ?? "");
    setProgramme(f["course"] ?? "");
    setRegNo(f["registration no."] ?? f["registration no"] ?? "");
    setYear(f["year of study"] ?? "");
    if (f["field wanted"]) setField(f["field wanted"]);
    setAddressee(f["letter addressed to"] ?? "");
    setDistrict(f["doing it from"] ?? "");
    const d = readDates(f["dates required by school"] ?? "");
    if (d) {
      setStart(d[0]);
      setEnd(d[1]);
    }
    setAnswer(answerFor(f["note"] ?? "", f["doing it from"] ?? ""));
  }

  async function keepCopy(blob: Blob, filename: string, title: string, reference: string) {
    setSaved("");
    try {
      const fd = new FormData();
      fd.append("file", blob, filename);
      fd.append("kind", `internship-${kind}`);
      fd.append("title", title);
      fd.append("reference", reference);
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      setSaved(res.ok ? "ok" : "failed");
      if (res.ok) void loadIssued();
    } catch {
      setSaved("failed");
    }
  }

  async function removeIssued(d: Issued) {
    if (!confirm(`Delete the stored copy of "${d.filename}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/documents/${d.id}`, { method: "DELETE" });
    if (res.ok) setIssued((list) => list.filter((x) => x.id !== d.id));
  }

  const logo = useRef<HTMLImageElement | null>(null);
  const sign = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    loadImg("/logo-lockup-dark.png").then((i) => (logo.current = i));
    loadImg("/signature.png").then((i) => (sign.current = i));
  }, []);

  const ref = makeRef(name.trim() || "—", dated);

  async function generate(print: boolean) {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210;
      const M = 20;
      const width = W - M * 2;
      let y = 0;

      // ── Letterhead — the house teal, as on the receipt and the site.
      doc.setFillColor(14, 116, 144);
      doc.rect(0, 0, W, 34, "F");
      doc.setFillColor(12, 93, 117);
      doc.triangle(W, 0, W, 34, W - 74, 0, "F");
      if (logo.current) {
        logoPlate(doc, logo.current, M, 8.5, 52, 12.1);
      } else {
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("ONLINE TECH UGANDA", M, 16);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.6);
      doc.setTextColor(215, 240, 247);
      doc.text("Computer Training · IT Services · Software Development", M, 31);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("+256 756 839 270", W - M, 12, { align: "right" });
      doc.setTextColor(206, 235, 243);
      doc.setFontSize(7.6);
      doc.text("onlinetechug@gmail.com", W - M, 17, { align: "right" });
      doc.text("www.onlinetechug.com  ·  Kampala, Uganda", W - M, 22, { align: "right" });

      // Orange rule under the header
      doc.setFillColor(241, 90, 41);
      doc.rect(0, 34, W, 2, "F");

      y = 47;

      // ── Ref + date
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(`Ref: ${ref}`, M, y);
      doc.text(long(dated), W - M, y, { align: "right" });
      y += 12;

      // ── Addressee
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      // To whoever the student's school asked the letter to go to.
      const to = addressee.trim() ? addressee.trim().replace(/\b([a-z])/g, (c) => c.toUpperCase()) : "The Academic Registrar / Internship Coordinator";
      const toLines = doc.splitTextToSize(to, width) as string[];
      doc.text(toLines, M, y);
      y += 5 * toLines.length;
      doc.setFont("helvetica", "normal");
      doc.text(institution.trim() || "________________________________", M, y);
      y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const subject =
        kind === "acceptance"
          ? "RE: ACCEPTANCE FOR INDUSTRIAL TRAINING / INTERNSHIP"
          : "RE: CONFIRMATION OF COMPLETED INDUSTRIAL TRAINING / INTERNSHIP";
      doc.text(subject, M, y);
      doc.setLineWidth(0.3);
      doc.setDrawColor(14, 116, 144);
      doc.line(M, y + 1.5, M + doc.getTextWidth(subject), y + 1.5);
      y += 10;

      // ── Body
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(45, 45, 45);

      const student = name.trim() || "________________";
      const prog = programme.trim() ? `, a ${year.trim() ? `${year.trim()} ` : ""}student pursuing ${programme.trim()}` : "";
      const reg = regNo.trim() ? ` (Registration No. ${regNo.trim()})` : "";
      const where = district.trim() ? ` The training is conducted online; the student will take part from ${district.trim()}, joining our team's daily check-ins and live working sessions.` : "";
      const inst = institution.trim() || "your institution";

      const body =
        kind === "acceptance"
          ? [
              "Dear Sir/Madam,",
              "",
              `Reference is made to the application for industrial training submitted by your student, ${student}${reg}${prog} at ${inst}.`,
              "",
              `We are pleased to inform you that ${student} has been ACCEPTED to undertake industrial training with Online Tech Uganda in the area of ${field}.`,
              "",
              `The training will run from ${long(start)} to ${long(end)}. During this period the student will be attached to our team and will gain practical, supervised experience in ${field}, including real client work where appropriate.${where}`,
              "",
              ...(answer.trim() ? [answer.trim(), ""] : []),
              `The student will be supervised by ${supervisor.trim() || "a member of our senior team"}, and will be assessed on attendance, conduct, initiative and the quality of work produced. We shall be glad to complete any assessment forms your institution requires.`,
              "",
              "We look forward to working with your student and to a continued relationship with your institution.",
            ]
          : [
              "Dear Sir/Madam,",
              "",
              `This is to confirm that ${student}${reg}${prog} at ${inst} has successfully completed industrial training with Online Tech Uganda.`,
              "",
              `The training was undertaken in the area of ${field} and ran from ${long(start)} to ${long(end)}.`,
              "",
              `During this period the student worked under the supervision of ${supervisor.trim() || "our senior team"}, gaining hands-on experience in ${field}. The student attended regularly, conducted themselves professionally, and contributed to live work carried out by our team.`,
              "",
              "We have no hesitation in recommending this student, and we wish them every success in their studies and career.",
            ];

      for (const para of body) {
        if (para === "") {
          y += 4;
          continue;
        }
        const lines = doc.splitTextToSize(para, width);
        doc.text(lines, M, y, { align: "justify", maxWidth: width });
        y += lines.length * 5.2;
      }

      // The signature and the stamp need about 52 mm. If the letter has run
      // long, they go to the top of a second page rather than being squeezed.
      y += 8;
      if (y > 222) {
        doc.addPage();
        y = 30;
      }

      // ── Sign-off on the left
      const top = y;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(45, 45, 45);
      doc.text("Yours faithfully,", M, y);
      y += 4;
      if (sign.current) doc.addImage(sign.current, "PNG", M, y, 50, 10.3);
      y += 16;
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.3);
      doc.line(M, y, M + 72, y);
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(supervisor.trim() || "Agaba Geofrey", M, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text("Internship Supervisor, for Online Tech Uganda", M, y);
      y += 4.5;
      doc.text("+256 756 839 270  ·  onlinetechug@gmail.com", M, y);

      // ── A clear box on the right for the official stamp, 58 × 44 mm
      const bw = 58;
      const bh = 44;
      const bx = W - M - bw;
      const by = top - 2;
      doc.setDrawColor(170, 170, 170);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([1.2, 1.2], 0);
      doc.roundedRect(bx, by, bw, bh, 2, 2, "S");
      doc.setLineDashPattern([], 0);
      doc.setFontSize(7);
      doc.setTextColor(175, 175, 175);
      doc.text("OFFICIAL STAMP", bx + bw / 2, by + bh - 3, { align: "center" });

      // ── Footer
      doc.setFillColor(14, 116, 144);
      doc.rect(0, 283, W, 14, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(255, 255, 255);
      doc.text(
        "Online Tech Uganda  ·  Kampala  ·  +256 756 839 270  ·  onlinetechug@gmail.com  ·  www.onlinetechug.com",
        W / 2,
        290.5,
        { align: "center" },
      );

      const filename = `Internship-${kind}-${student.replace(/\s+/g, "-")}.pdf`;
      // The copy for our records is taken before the print dialogue is added,
      // so the stored file opens as a document rather than straight to print.
      const copy = doc.output("blob");
      if (print) {
        doc.autoPrint();
        window.open(doc.output("bloburl") as unknown as string, "_blank");
      } else {
        doc.save(filename);
      }
      void keepCopy(copy, filename, student, ref);
    } finally {
      setBusy(false);
    }
  }

  const input =
    "mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Internship Letters</h1>
        <p className="text-sm text-ink-600/60">
          Accept a student for industrial training, or confirm they completed it — on your
          letterhead, addressed to their institution.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(["acceptance", "completion"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  kind === k
                    ? "bg-brand-500 text-white"
                    : "border border-ink-600/15 text-ink-600 hover:border-brand-400"
                }`}
              >
                {k === "acceptance" ? "Acceptance letter" : "Completion letter"}
              </button>
            ))}
          </div>

          {/* Fill everything from what the student sent with their application. */}
          <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50/60 p-3">
            <label className="block text-sm font-bold text-ink-700">Fill from an applicant</label>
            <select value={picked} onChange={(e) => fillFrom(e.target.value)} className={`${input} bg-white`}>
              <option value="">— choose a student who applied —</option>
              {applicants.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name.trim()} · {(readApplication(a.message)["university"] ?? "").slice(0, 40) || "no university given"} · {a.status}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-ink-600/65">
              Their university, course, year, registration number, field, dates, who the letter is addressed to and their note are filled in for you. Check and change anything below.
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Student&apos;s full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Okello Brian" className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Institution / University</label>
              <input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Makerere University"
                className={input}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Programme of study</label>
              <input
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                placeholder="e.g. BSc Computer Science"
                className={input}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Registration number</label>
              <input value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="e.g. 21/U/1234" className={input} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Year of study</label>
              <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. Year 3" className={input} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Doing it from (district)</label>
              <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Kikuube" className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Letter addressed to</label>
              <input
                value={addressee}
                onChange={(e) => setAddressee(e.target.value)}
                placeholder="As the student's school asked, e.g. The Dean, Faculty of Science and Technology"
                className={input}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Training area</label>
              <input list="otu-fields" value={field} onChange={(e) => setField(e.target.value)} className={input} />
              <datalist id="otu-fields">
                {FIELDS.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Start date</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={input} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">End date</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={input} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Supervisor</label>
              <input value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className={input} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Letter date</label>
              <input type="date" value={dated} onChange={(e) => setDated(e.target.value)} className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Answer to the student&apos;s request</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                placeholder="Written from the note the student left (supervision and logbook, other duties, working from home…). Change it as you like, or leave it empty."
                className={input}
              />
            </div>
          </div>

          <p className="mt-4 rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-600/70">
            Ref <b className="font-mono text-ink-700">{ref}</b> — printed on the letter so you can
            trace it later.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => generate(true)}
              disabled={busy || !name.trim()}
              className="rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Preparing…" : "🖨️ Print letter"}
            </button>
            <button
              onClick={() => generate(false)}
              disabled={busy || !name.trim()}
              className="rounded-md border border-ink-600/20 px-6 py-2.5 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
            >
              ⬇️ Download PDF
            </button>
          </div>
          {saved === "ok" && (
            <p className="mt-3 text-xs font-semibold text-green-700">
              ✓ A copy is stored under &ldquo;Issued letters&rdquo; below.
            </p>
          )}
          {saved === "failed" && (
            <p className="mt-3 text-xs font-semibold text-red-600">
              The letter was made, but we could not store a copy. Keep the downloaded file safe.
            </p>
          )}
        </section>

        <section className="h-fit rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-ink-600">
            {kind === "acceptance" ? "Acceptance letter" : "Completion letter"}
          </h2>
          <p className="mt-1 text-xs text-ink-600/65">
            {kind === "acceptance"
              ? "Addressed to the Academic Registrar, accepting the student for industrial training and stating the dates, area and supervisor."
              : "Confirms the student completed the training, with dates, area and a recommendation."}
          </p>

          <p className="mt-4 text-xs font-semibold text-ink-700">The letter includes:</p>
          <ul className="mt-1.5 space-y-1 text-xs text-ink-600/70">
            {[
              "Your letterhead and contacts",
              "Reference number and date",
              "Addressed to the institution",
              "Student name, reg no. and programme",
              "Training area and dates",
              "Supervisor and signature",
              "Their own addressee, year, district and request",
              "A clear box for your official stamp",
            ].map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>

          <p className="mt-4 border-t border-ink-600/10 pt-3 text-xs text-ink-600/55">
            Print it, sign and stamp it, then give it to the student or email the PDF.
          </p>
        </section>
      </div>

      {/* ── Issued letters ─────────────────────────────────────── */}
      <section className="mt-6 rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-extrabold text-ink-600">Issued letters</h2>
          <p className="text-xs text-ink-600/55">
            {issued.length} stored · kept privately, only visible here
          </p>
        </div>
        {issued.length === 0 ? (
          <p className="mt-3 rounded-md bg-ink-50 px-3 py-3 text-sm text-ink-600/65">
            No letters stored yet. Every letter you print or download from now on is kept here.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-600/10">
            {issued.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${
                    d.kind.endsWith("completion") ? "bg-green-100 text-green-700" : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {d.kind.replace("internship-", "")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink-700">{d.title || d.filename}</span>
                  <span className="block text-xs text-ink-600/55">
                    {d.reference && <span className="font-mono">{d.reference} · </span>}
                    {long(d.created_at.slice(0, 10))} · {Math.max(1, Math.round(d.size / 1024))} KB
                  </span>
                </span>
                <a
                  href={`/api/documents/${d.id}`}
                  className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-bold text-ink-700 hover:border-brand-500 hover:text-brand-600"
                >
                  ⬇️ Download
                </a>
                <button
                  onClick={() => removeIssued(d)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
