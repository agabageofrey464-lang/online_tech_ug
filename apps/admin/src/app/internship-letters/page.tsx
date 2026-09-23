"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Internship letters.
 *
 * Ugandan institutions ask interns for a letter on company letterhead, both to
 * accept a placement and to confirm it was completed. This generates either,
 * addressed to the school, with a reference number the owner can trace.
 */

type LetterKind = "acceptance" | "completion";

const FIELDS = [
  "Web Development",
  "Graphic Design",
  "IT Support & Networking",
  "Computer Repair & Maintenance",
  "Digital Marketing",
  "Data Entry & Analysis",
  "Video Editing & Photography",
  "Software Development",
];

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
  const [busy, setBusy] = useState(false);

  const logo = useRef<HTMLImageElement | null>(null);
  const sign = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    loadImg("/logo.jpeg").then((i) => (logo.current = i));
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

      // ── Letterhead
      doc.setFillColor(40, 35, 99);
      doc.rect(0, 0, W, 32, "F");
      if (logo.current) doc.addImage(logo.current, "JPEG", M, 6, 20, 20);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("ONLINE TECH UGANDA", M + 25, 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(255, 205, 185);
      doc.text("Computer Training · IT Services · Software Development", M + 25, 20);
      doc.text("Kampala, Uganda  ·  +256 756 839 270  ·  onlinetechug@gmail.com", M + 25, 25);

      // Orange rule under the header
      doc.setFillColor(241, 90, 41);
      doc.rect(0, 32, W, 1.5, "F");

      y = 45;

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
      doc.text("The Academic Registrar / Internship Coordinator", M, y);
      y += 5;
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
      doc.setDrawColor(40, 35, 99);
      doc.line(M, y + 1.5, M + doc.getTextWidth(subject), y + 1.5);
      y += 10;

      // ── Body
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(45, 45, 45);

      const student = name.trim() || "________________";
      const prog = programme.trim() ? ` pursuing ${programme.trim()}` : "";
      const reg = regNo.trim() ? ` (Registration No. ${regNo.trim()})` : "";
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
              `The training will run from ${long(start)} to ${long(end)}. During this period the student will be attached to our team and will gain practical, supervised experience in ${field}, including real client work where appropriate.`,
              "",
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

      y += 10;

      // ── Sign-off
      doc.text("Yours faithfully,", M, y);
      y += 4;
      if (sign.current) doc.addImage(sign.current, "PNG", M, y, 38, 17);
      y += 20;

      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.3);
      doc.line(M, y, M + 70, y);
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(supervisor.trim() || "Agaba Geofrey", M, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text("For: Online Tech Uganda", M, y);

      // Stamp hint on the right of the signature block
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.circle(W - M - 18, y - 12, 16);
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text("OFFICIAL STAMP", W - M - 18, y - 11, { align: "center" });

      // ── Footer
      doc.setDrawColor(230, 230, 230);
      doc.line(M, 280, W - M, 280);
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text("Online Tech Uganda  ·  www.onlinetechug.com  ·  Kampala, Uganda", W / 2, 286, {
        align: "center",
      });

      if (print) {
        doc.autoPrint();
        window.open(doc.output("bloburl") as unknown as string, "_blank");
      } else {
        doc.save(`Internship-${kind}-${student.replace(/\s+/g, "-")}.pdf`);
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
              "Space for your official stamp",
            ].map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>

          <p className="mt-4 border-t border-ink-600/10 pt-3 text-xs text-ink-600/55">
            Print it, sign and stamp it, then give it to the student or email the PDF.
          </p>
        </section>
      </div>
    </div>
  );
}
