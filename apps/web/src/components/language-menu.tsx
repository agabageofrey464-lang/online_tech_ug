"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { UgandaFlag } from "@/components/uganda-flag";

// World languages (Amazon-style). Codes are Google-Translate language codes.
const LANGS = [
  { code: "en", label: "English", tag: "EN" },
  { code: "sw", label: "Kiswahili", tag: "SW" },
  { code: "fr", label: "français", tag: "FR" },
  { code: "es", label: "español", tag: "ES" },
  { code: "ar", label: "العربية", tag: "AR" },
  { code: "de", label: "Deutsch", tag: "DE" },
  { code: "pt", label: "português", tag: "PT" },
  { code: "zh-CN", label: "中文 (简体)", tag: "ZH" },
  { code: "ko", label: "한국어", tag: "KO" },
  { code: "he", label: "עברית", tag: "HE" },
];

function readLang(): string {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/googtrans=\/[^/]+\/([a-zA-Z-]+)/);
  return m ? m[1] : "en";
}

// Set the Google-Translate cookie across domain variants, then reload so the
// whole page is translated (or cleared back to English).
function applyLang(code: string) {
  const host = location.hostname;
  const domains = ["", `;domain=${host}`];
  const parts = host.split(".");
  if (parts.length > 1) domains.push(`;domain=.${parts.slice(-2).join(".")}`);
  domains.forEach((d) => {
    document.cookie =
      code === "en"
        ? `googtrans=;path=/${d};expires=Thu, 01 Jan 1970 00:00:00 GMT`
        : `googtrans=/en/${code};path=/${d}`;
  });
  location.reload();
}

export function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => setLang(readLang()), []);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="relative notranslate">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Change language"
        className="flex items-center gap-1 rounded px-1.5 py-1.5 text-white hover:outline hover:outline-1 hover:outline-white/60"
      >
        <UgandaFlag className="h-4 w-6 rounded-sm ring-1 ring-white/30" />
        <span className="text-sm font-bold">{current.tag}</span>
        <ChevronDown size={14} className={`hidden text-white/70 transition sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <button aria-hidden className="fixed inset-0 z-[80] cursor-default" onClick={() => setOpen(false)} />
          {/* Mobile: pinned top-right so it never runs off-screen. Desktop: normal dropdown. */}
          <div className="fixed right-2 top-14 z-[90] w-56 max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg bg-white py-1.5 text-ink-800 shadow-2xl ring-1 ring-black/10 md:absolute md:right-0 md:top-full md:mt-1 md:w-72 md:py-2">
            <p className="px-4 pb-1 text-sm font-bold text-ink-900">Change language</p>
            <div className="max-h-[55vh] overflow-y-auto">
              {LANGS.map((l) => {
                const active = l.code === lang;
                return (
                  <button
                    key={l.code}
                    onClick={() => applyLang(l.code)}
                    className="flex w-full items-center gap-3 px-4 py-1.5 text-sm hover:bg-ink-50"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        active ? "border-brand-500" : "border-ink-600/30"
                      }`}
                    >
                      {active && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                    </span>
                    <span className="flex-1 text-left">
                      {l.label} <span className="text-ink-700/50">- {l.tag}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-1 border-t border-ink-600/10 px-4 pt-2 text-[11px] text-ink-700/60">
              <p className="font-semibold text-ink-800">Currency</p>
              <p>UGX — Ugandan Shilling</p>
            </div>
            <div className="mt-2 flex items-center gap-2 border-t border-ink-600/10 px-4 pt-2 text-[11px] text-ink-700/60">
              <UgandaFlag className="h-4 w-6 rounded-sm ring-1 ring-ink-600/10" /> You are shopping on onlinetechug.com
            </div>
          </div>
        </>
      )}
    </div>
  );
}
