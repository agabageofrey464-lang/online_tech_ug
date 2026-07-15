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
    loadImg("/logo.png").then((i) => (logo.current = i));
    loadImg("/signature.png").then((i) => (sign.current = i));
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

      doc.setFont("times", "normal");
      doc.setFontSize(13);
      doc.setTextColor(90, 90, 90);
      doc.text("This certifies that", cx, 82, { align: "center" });

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

      // Date (left)
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(90, 90, 90);
      doc.text("Date", 62, 168, { align: "center" });
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(40, 35, 99);
      doc.text(date, 62, 174, { align: "center" });

      // Signature (right)
      if (sign.current && sign.current.width > 0) {
        const h = 20;
        const w = h * (sign.current.width / sign.current.height);
        doc.addImage(sign.current, "PNG", 235 - w / 2, 149, w, h);
      }
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(40, 35, 99);
      doc.text("Mr. Agaba Geofrey — Director", 235, 174, { align: "center" });

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
