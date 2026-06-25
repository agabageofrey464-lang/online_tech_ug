"use client";

import { useEffect, useState } from "react";
import { progressPct, isEnrolled } from "@/lib/learning";

export function CourseProgress({ slug, total }: { slug: string; total: number }) {
  const [pct, setPct] = useState(0);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      setPct(progressPct(slug, total));
      setEnrolled(isEnrolled(slug));
    };
    update();
    window.addEventListener("otu-learning", update);
    return () => window.removeEventListener("otu-learning", update);
  }, [slug, total]);

  if (!enrolled && pct === 0) return null;

  return (
    <div className="mt-6 rounded-card border border-ink-600/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-ink-700">Your progress</span>
        <span className="font-bold text-brand-600">{pct}%</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      {pct === 100 && (
        <p className="mt-2 text-xs font-semibold text-green-600">🎉 Course complete — take the quiz for your certificate!</p>
      )}
    </div>
  );
}
