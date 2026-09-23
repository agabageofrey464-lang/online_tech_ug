import Image from "next/image";

/**
 * Online Tech Uganda admin mark — the globe from the company's own logo,
 * matching the storefront. It replaced an invented "OT" monogram tile, which
 * meant the admin, the storefront and the printed documents were showing three
 * different marks.
 *
 * The artwork is keyed to transparency, so it sits on the dark sidebar and on
 * the white login card without a tile behind it.
 */
export function BrandLogo({
  className = "",
  title = "Online Tech Uganda",
  size = 44,
}: {
  className?: string;
  title?: string;
  size?: number;
}) {
  return (
    <Image
      src="/globe-mark.png"
      alt={title}
      width={size}
      height={Math.round((size * 229) / 256)}
      priority
      className={`select-none ${className}`}
      style={{ width: size, height: "auto" }}
    />
  );
}
