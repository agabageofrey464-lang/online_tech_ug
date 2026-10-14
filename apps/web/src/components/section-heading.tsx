import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Every section's heading the same way across the site: the name in the serif
// on the left, and the way on in small capitals with a long arrow on the right.
export function SectionHeading({
  title,
  href,
  linkLabel = "See all →",
  className = "",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-[26px] leading-tight text-ink-900 sm:text-[32px]">{title}</h2>
      {href && (
        <Link href={href} className="group flex shrink-0 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-900 underline underline-offset-4 hover:text-brand-600 sm:text-[13px]">
          {linkLabel.replace(/\s*[→›]\s*$/, "")} <ArrowRight size={20} strokeWidth={1.1} className="transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
