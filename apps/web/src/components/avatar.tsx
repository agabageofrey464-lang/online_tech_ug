// Initials-based profile picture (Gmail-style). A consistent colour is derived
// from the name/email so each user gets a stable avatar without a photo upload.

const COLORS = [
  "bg-brand-500",
  "bg-ink-600",
  "bg-emerald-600",
  "bg-blue-600",
  "bg-violet-600",
  "bg-pink-600",
  "bg-amber-500",
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
  seed?: string;
  size?: number;
  className?: string;
}) {
  const bg = colorFor(seed || name || "?");
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold leading-none text-white ${bg} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden
    >
      {initials(name || "?")}
    </span>
  );
}
