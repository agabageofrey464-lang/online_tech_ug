"use client";

// Profile picture. Shows the photo linked to the user's email account (Gravatar)
// when they have one, otherwise a stable initials avatar (Gmail-style).

import { useEffect, useState } from "react";

const COLORS = [
  "bg-brand-500",
  "bg-ink-600",
  "bg-ink-600",
  "bg-ink-600",
  "bg-teal-700",
  "bg-brand-600",
  "bg-gold-500",
  "bg-teal-600",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export function Avatar({
  name,
  seed,
  size = 44,
  className = "",
}: {
  name: string;
  seed?: string; // the user's email — used to look up their account photo
  size?: number;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const email = (seed || "").trim().toLowerCase();

  // Derive the Gravatar URL from the email (SHA-256). d=404 → if they have no
  // Gravatar the request 404s and we fall back to the initials avatar.
  useEffect(() => {
    setFailed(false);
    setSrc(null);
    if (!email.includes("@") || typeof crypto === "undefined" || !crypto.subtle) return;
    let alive = true;
    (async () => {
      try {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
        const hex = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        if (alive) setSrc(`https://www.gravatar.com/avatar/${hex}?s=${Math.round(size * 2)}&d=404`);
      } catch {
        /* SubtleCrypto unavailable (e.g. non-HTTPS) — keep initials. */
      }
    })();
    return () => {
      alive = false;
    };
  }, [email, size]);

  const bg = colorFor(seed || name || "?");
  const showPhoto = src && !failed;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold leading-none text-white ${bg} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full rounded-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name || "?")
      )}
    </span>
  );
}
