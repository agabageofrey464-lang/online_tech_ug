"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Download } from "lucide-react";
import { learnerName, setLearnerName } from "@/lib/learning";

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function Certificate({ courseTitle }: { courseTitle: string }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const logo = useRef<HTMLImageElement | null>(null);
  const sign = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setName(learnerName());
    loadImg("/logo.webp").then((i) => (logo.current = i));
    loadImg("/signature.webp").then((i) => (sign.current = i));
  }, []);

  async function download() {
    const learner = name.trim();
    if (!learner) return;
    setLearnerName(learner);
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = 297;
      const cx = W / 2;
      const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

      // Borders (ink outer, brand inner)
      doc.setDrawColor(40, 35, 99);
      doc.setLineWidth(3);
      doc.rect(6, 6, W - 12, 210 - 12);
      doc.setDrawColor(241, 90, 41);
      doc.setLineWidth(0.6);
      doc.rect(11, 11, W - 22, 210 - 22);

      if (logo.current) doc.addImage(logo.current, "JPEG", cx - 11, 20, 22, 22);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(241, 90, 41);
      doc.text("ONLINE TECH UGANDA", cx, 50, { align: "center" });

      doc.setFont("times", "bold");
      doc.setFontSize(30);
      doc.setTextColor(40, 35, 99);
      doc.text("Certificate of Completion", cx, 66, { align: "center" });

      // Ornamental divider under the title: rule · diamond · rule
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
      doc.text("has successfully completed the course", cx, 114, { align: "center" });

      doc.setFont("times", "bold");
      doc.setFontSize(17);
      doc.setTextColor(50, 50, 50);
      doc.text(courseTitle, cx, 124, { align: "center" });

      /* ── Footer: Date and Signature as two matching horizontal blocks ──
         Both rules sit on the same baseline so the row reads level across the
         page, with the signature resting on its line and the name beneath. */
      const RULE_Y = 168; // shared baseline for both rules
      const HALF = 42; // half-width of each rule
      const leftX = 74;
      const rightX = 223;

      /* Signature sits ON the rule. The PNG is transparent and trimmed to the
         ink, so dropping its baseline 1.5mm below the line lets the descenders
         cross it the way a real signature does. Width is capped to the rule so
         a wide scan can never overhang. */
      if (sign.current && sign.current.width > 0) {
        const ratio = sign.current.width / sign.current.height;
        let h = 16;
        let w = h * ratio;
        const maxW = HALF * 2 - 8;
        if (w > maxW) {
          w = maxW;
          h = w / ratio;
        }
        doc.addImage(sign.current, "PNG", rightX - w / 2, RULE_Y - h + 1.5, w, h);
      }

      // The two horizontal rules
      doc.setDrawColor(40, 35, 99);
      doc.setLineWidth(0.5);
      doc.line(leftX - HALF, RULE_Y, leftX + HALF, RULE_Y);
      doc.line(rightX - HALF, RULE_Y, rightX + HALF, RULE_Y);

      // Date under the left rule
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(40, 35, 99);
      doc.text(date, leftX, RULE_Y + 7, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("DATE ISSUED", leftX, RULE_Y + 13, { align: "center" });

      // Director under the right rule — name and title on separate lines
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(40, 35, 99);
      doc.text("Mr. Agaba Geofrey", rightX, RULE_Y + 7, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("DIRECTOR", rightX, RULE_Y + 13, { align: "center" });

      /* ── Seal, centred between the two signature blocks ── */
      const sealY = RULE_Y - 4;
      doc.setFillColor(241, 90, 41);
      doc.circle(cx, sealY, 13, "F");
      doc.setFillColor(255, 255, 255);
      doc.circle(cx, sealY, 10.5, "F");
      doc.setDrawColor(241, 90, 41);
      doc.setLineWidth(0.5);
      doc.circle(cx, sealY, 12, "S");
      doc.setFont("times", "bold");
      doc.setFontSize(8);
      doc.setTextColor(241, 90, 41);
      doc.text("CERTIFIED", cx, sealY - 1, { align: "center" });
      doc.setFontSize(6.5);
      doc.setTextColor(40, 35, 99);
      doc.text("ONLINE TECH", cx, sealY + 3.5, { align: "center" });
      doc.text("UGANDA", cx, sealY + 6.5, { align: "center" });

      /* ── Decorative corner brackets ── */
      doc.setDrawColor(241, 90, 41);
      doc.setLineWidth(1.2);
      const C = 16; // bracket arm length
      const m = 16; // inset from page edge
      const B = 210 - m; // bottom
      const R = W - m; // right
      // top-left, top-right, bottom-left, bottom-right
      doc.line(m, m, m + C, m); doc.line(m, m, m, m + C);
      doc.line(R - C, m, R, m); doc.line(R, m, R, m + C);
      doc.line(m, B - C, m, B); doc.line(m, B, m + C, B);
      doc.line(R - C, B, R, B); doc.line(R, B - C, R, B);

      /* ── Verification footer ── */
      const certId = `OTU-${new Date().getFullYear()}-${Math.abs(
        [...(learner + courseTitle)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7),
      )
        .toString(36)
        .toUpperCase()
        .slice(0, 6)}`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      // y=189 keeps this clear of the corner brackets, which sit on y=194.
      doc.text(`Certificate No: ${certId}`, 20, 189);
      doc.text("Verify at onlinetechug.com/contact", W - 20, 189, { align: "right" });

      doc.save(`Certificate-${learner.replace(/\s+/g, "-")}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-brand-700">
        <Award size={18} /> Your certificate is ready!
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name as it should appear"
          className="flex-1 rounded-md border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={download}
          disabled={!name.trim() || busy}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          <Download size={16} /> {busy ? "Preparing…" : "Download PDF"}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-ink-700/50">Downloads a print-ready A4 PDF certificate.</p>
    </div>
  );
}
