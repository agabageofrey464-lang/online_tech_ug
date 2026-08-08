"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { site } from "@/lib/site";

/**
 * "Share this product" — Facebook, X, WhatsApp and copy-link, in the round
 * button style Jumia uses.
 */
export function ShareProduct({
  title,
  path,
  className = "",
}: {
  title: string;
  path: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${site.url}${path}`;
  const text = `${title} — ${site.name}`;

  const links = [
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: <span className="text-[15px] font-black leading-none">f</span>,
    },
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      icon: <span className="text-[13px] font-black leading-none">𝕏</span>,
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      icon: <span className="text-[13px] font-black leading-none">✆</span>,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the share buttons still work */
    }
  }

  return (
    <div className={className}>
      <p className="text-sm font-extrabold uppercase tracking-wide text-ink-900">Share this product</p>
      <div className="mt-2.5 flex items-center gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            aria-label={l.label}
            title={l.label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-600/20 text-ink-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
          >
            {l.icon}
          </a>
        ))}
        <button
          onClick={copy}
          aria-label="Copy link"
          title="Copy link"
          className={`flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${
            copied
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-ink-600/20 text-ink-700 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
          }`}
        >
          {copied ? <Check size={14} /> : <Link2 size={14} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
