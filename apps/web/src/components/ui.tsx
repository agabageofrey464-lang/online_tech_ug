import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-500">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink-600 text-balance-pretty sm:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-base leading-relaxed text-ink-700/70">{subtitle}</p>}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  external?: boolean;
  className?: string;
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
  secondary: "bg-ink-600 text-white hover:bg-ink-700 shadow-sm",
  outline: "border border-ink-600/20 text-ink-700 hover:bg-ink-50",
  ghost: "text-ink-700 hover:bg-ink-50",
};

export function Button({ href, children, variant = "primary", external, className = "" }: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Badge({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "ink" | "muted" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    ink: "bg-ink-50 text-ink-700",
    muted: "bg-ink-600/5 text-ink-700/70",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-brand-500" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
      <span className="ml-1 text-xs font-medium text-ink-700/60">{rating.toFixed(1)}</span>
    </span>
  );
}
