import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  const base = light ? "text-white/70" : "text-ink-700/60";
  const link = light ? "hover:text-white" : "hover:text-brand-600";
  const current = light ? "text-white" : "text-ink-800";
  const sep = light ? "text-white/40" : "text-ink-700/40";

  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1 text-sm ${base}`}>
      <Link href="/" className={link}>
        Home
      </Link>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={14} className={sep} />
          {it.href && i < items.length - 1 ? (
            <Link href={it.href} className={link}>
              {it.label}
            </Link>
          ) : (
            <span className={`font-semibold ${current}`}>{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
