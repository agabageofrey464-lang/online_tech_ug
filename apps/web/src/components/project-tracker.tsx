"use client";

import { useState } from "react";
import { Search, CheckCircle2, Loader2, Circle, CalendarClock } from "lucide-react";
import { findProject, type Project } from "@/lib/projects";
import { whatsappLink } from "@/lib/site";

export function ProjectTracker() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Project | null | "none">(null);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setResult(findProject(code) ?? "none");
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your project code (e.g. OTU-WEB-001)"
          className="flex-1 rounded-md border border-ink-600/15 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
        >
          <Search size={16} /> Track
        </button>
      </form>

      {result === "none" && (
        <div className="mt-6 rounded-card border border-dashed border-ink-600/20 bg-white p-8 text-center">
          <p className="font-semibold text-ink-700">No project found for that code.</p>
          <p className="mt-1 text-sm text-ink-700/60">
            Double-check the code we sent you, or{" "}
            <a
              href={whatsappLink("Hi, I'd like to check the status of my project.")}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand-600 hover:underline"
            >
              message us on WhatsApp
            </a>
            .
          </p>
        </div>
      )}

      {result && result !== "none" && (
        <div className="mt-6 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-bold text-brand-600">{result.ref}</p>
              <h2 className="mt-1 text-xl font-extrabold text-ink-600">{result.title}</h2>
              <p className="text-sm text-ink-700/60">
                {result.type} · {result.client}
              </p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
              {result.percent}% complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${result.percent}%` }} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-700/60">
            <CalendarClock size={13} /> Started {fmt(result.startedAt)} · Updated {fmt(result.updatedAt)}
          </p>

          {/* Stage timeline */}
          <ol className="mt-5 space-y-4">
            {result.stages.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 shrink-0">
                  {s.state === "done" ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : s.state === "active" ? (
                    <Loader2 size={20} className="animate-spin text-brand-500" />
                  ) : (
                    <Circle size={20} className="text-ink-600/30" />
                  )}
                </span>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      s.state === "pending" ? "text-ink-700/50" : "text-ink-800"
                    }`}
                  >
                    {s.name}
                    {s.state === "active" && (
                      <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-700">
                        In progress
                      </span>
                    )}
                  </p>
                  {s.note && <p className="text-xs text-ink-700/60">{s.note}</p>}
                </div>
              </li>
            ))}
          </ol>

          {result.note && (
            <p className="mt-5 rounded-lg bg-ink-50 p-3 text-sm text-ink-700/80">📝 {result.note}</p>
          )}

          <a
            href={whatsappLink(`Hi, I'd like an update on my project ${result.ref} (${result.title}).`)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            Ask for an update
          </a>
        </div>
      )}
    </div>
  );
}
