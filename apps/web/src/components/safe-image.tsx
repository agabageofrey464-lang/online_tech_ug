"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { fallbackImage } from "@/lib/image-fallback";

/**
 * next/image that falls back to a local web-image MATCHING the item's name
 * when the source is missing or fails to load — so no item ever renders as a
 * broken/blank image, and the fallback still looks relevant.
 *
 * Photos also fade in as they decode. A grid that snaps into place image by
 * image is the roughest edge on a shop page, and it is the one thing a
 * visitor notices before they notice anything about the products.
 */
export function SafeImage({ src, alt = "", fill, className, ...rest }: ImageProps) {
  const [failed, setFailed] = useState(!src);
  const [loaded, setLoaded] = useState(false);
  const fallback = fallbackImage(typeof alt === "string" ? alt : "");

  if (failed || !src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fallback}
        alt={alt}
        className={className}
        style={
          fill
            ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }
            : { width: "100%", height: "auto", objectFit: "contain" }
        }
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={`img-in${loaded ? " is-loaded" : ""}${className ? ` ${className}` : ""}`}
      onError={() => setFailed(true)}
      // Fires for a cached image too, so a returning visitor never sees a
      // photo stuck at zero opacity.
      onLoad={() => setLoaded(true)}
      {...rest}
    />
  );
}
