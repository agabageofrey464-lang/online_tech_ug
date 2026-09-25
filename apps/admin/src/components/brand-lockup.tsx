/**
 * The Online Tech Uganda lockup, for the admin.
 *
 * The admin used a different mark entirely from the storefront — an orbit
 * glyph beside plain text — so the two halves of the business did not look
 * like the same company. This is the same lockup the site uses, with "Admin"
 * in place of "Uganda".
 *
 * Kept in step with apps/web/src/components/brand-logo-full.tsx.
 */
export function BrandLockup({
  className = "",
  tag = "Admin",
  onLight = false,
}: {
  className?: string;
  tag?: string;
  onLight?: boolean;
}) {
  const nameColor = onLight ? "text-ink-700" : "text-white";
  const techColor = onLight ? "text-brand-600" : "text-brand-400";
  const tagColor = onLight ? "text-ink-600/55" : "text-white/70";

  return (
    <span className={`inline-flex items-stretch text-left ${className}`} aria-label={`Online Tech ${tag}`}>
      {/* The monogram, squared on the inner edge so it docks against the name. */}
      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-l-[10px] rounded-r-[3px] bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 shadow-md ring-1 ring-black/5">
        <span className="inline-flex items-start text-[17px] font-black leading-none tracking-[-0.04em] text-white">
          OT
          <span
            className="ml-[1px] mt-[3px] h-[3.5px] w-[3.5px] shrink-0 rounded-full"
            style={{ background: "#FCDC04" }}
          />
        </span>
      </span>

      {/* The name, held to the monogram's height so the two read as one object. */}
      <span className="-ml-[5px] flex flex-col justify-between pl-[10px]">
        <span
          className={`text-[17px] font-black uppercase leading-none tracking-[0.01em] ${nameColor}`}
        >
          ONLINE<span className={techColor}>&nbsp;TECH</span>
        </span>

        {/* The connector: runs from behind the tile to the end of the name. */}
        <span
          className="-ml-[10px] h-[2px] w-[calc(100%+10px)] rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
          aria-hidden="true"
        />

        <span
          className={`text-[8px] font-bold uppercase leading-none tracking-[0.34em] ${tagColor}`}
        >
          {tag}
        </span>
      </span>
    </span>
  );
}
