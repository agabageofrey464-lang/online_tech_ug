import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Illustrated empty states. Hand-drawn inline SVG (no image requests) in the
 * Online Tech Uganda palette — indigo linework with an orange accent — so an
 * empty screen still feels like part of the shop and points somewhere useful.
 */

const stroke = "#282363";
const accent = "#f15a29";
const soft = "#e6e8ef";

function CartArt() {
  return (
    <svg viewBox="0 0 220 160" className="h-36 w-auto" role="img" aria-label="Empty cart">
      <ellipse cx="110" cy="140" rx="78" ry="10" fill={soft} />
      <path
        d="M34 34h20l16 62h84l16-44H70"
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="82" cy="118" r="10" fill="none" stroke={stroke} strokeWidth="6" />
      <circle cx="146" cy="118" r="10" fill="none" stroke={stroke} strokeWidth="6" />
      {/* the "missing" item, floating in */}
      <rect x="120" y="18" width="46" height="34" rx="5" fill={accent} opacity="0.15" />
      <rect x="120" y="18" width="46" height="34" rx="5" fill="none" stroke={accent} strokeWidth="5" />
      <path d="M143 28v14M136 35h14" stroke={accent} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function SearchArt() {
  return (
    <svg viewBox="0 0 220 160" className="h-36 w-auto" role="img" aria-label="Nothing found">
      <ellipse cx="110" cy="140" rx="78" ry="10" fill={soft} />
      <circle cx="98" cy="70" r="40" fill="#fff" stroke={stroke} strokeWidth="6" />
      <circle cx="98" cy="70" r="40" fill={accent} opacity="0.07" />
      <path d="M128 100l28 28" stroke={stroke} strokeWidth="8" strokeLinecap="round" />
      {/* a shrug: empty inside the lens */}
      <path d="M84 62h.01M112 62h.01" stroke={stroke} strokeWidth="7" strokeLinecap="round" />
      <path d="M84 86c8-7 22-7 30 0" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function HeartArt() {
  return (
    <svg viewBox="0 0 220 160" className="h-36 w-auto" role="img" aria-label="Empty wishlist">
      <ellipse cx="110" cy="140" rx="78" ry="10" fill={soft} />
      <path
        d="M110 122S60 94 60 62a26 26 0 0150-12 26 26 0 0150 12c0 32-50 60-50 60z"
        fill={accent}
        opacity="0.12"
      />
      <path
        d="M110 122S60 94 60 62a26 26 0 0150-12 26 26 0 0150 12c0 32-50 60-50 60z"
        fill="none"
        stroke={accent}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M92 44l6 6M128 44l-6 6" stroke={stroke} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function BoxArt() {
  return (
    <svg viewBox="0 0 220 160" className="h-36 w-auto" role="img" aria-label="No orders yet">
      <ellipse cx="110" cy="140" rx="78" ry="10" fill={soft} />
      <path d="M62 62l48-24 48 24-48 22-48-22z" fill="#fff" stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
      <path d="M62 62v44l48 22V84" fill={accent} opacity="0.1" />
      <path d="M62 62v44l48 22V84L62 62z" fill="none" stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
      <path d="M158 62v44l-48 22V84l48-22z" fill="none" stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
      <path d="M96 46l48 24" stroke={accent} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

const ART = { cart: CartArt, search: SearchArt, wishlist: HeartArt, orders: BoxArt } as const;

export function EmptyState({
  art = "search",
  title,
  message,
  actionLabel,
  actionHref,
  children,
}: {
  art?: keyof typeof ART;
  title: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  children?: ReactNode;
}) {
  const Art = ART[art];
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-ink-600/15 bg-white px-6 py-10 text-center">
      <Art />
      <h2 className="mt-4 text-lg font-extrabold text-ink-900">{title}</h2>
      {message && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-700/65">{message}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="press mt-5 inline-block rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600"
        >
          {actionLabel}
        </Link>
      )}
      {children}
    </div>
  );
}
