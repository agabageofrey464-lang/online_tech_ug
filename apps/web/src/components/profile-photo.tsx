"use client";

import { useState } from "react";

/** Shows a profile photo; falls back to initials until the photo file exists. */
export function ProfilePhoto({
  src,
  name,
  className = "",
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src || failed) {
    return (
      <span className={`flex items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800 font-extrabold text-white ${className}`}>
        {initials}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} onError={() => setFailed(true)} className={`object-cover ${className}`} />
  );
}
