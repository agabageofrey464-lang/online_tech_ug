import Link from "next/link";

// Consistent section heading: bold title with an orange accent bar + optional link.
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
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
        <span className="h-5 w-1.5 rounded-full bg-brand-500" /> {title}
      </h2>
      {href && (
        <Link href={href} className="text-sm font-semibold text-brand-600 hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
