"use client";

import { useState } from "react";

// Vercel caps a serverless request body at ~4.5 MB, and phone photos are often
// bigger — so shrink in the browser before sending. Also makes uploads far
// faster on mobile data.
const MAX_EDGE = 1600; // px on the longest side — plenty for a profile/product photo
const SAFE_BYTES = 3 * 1024 * 1024; // stay comfortably under the platform limit

async function shrink(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // can't decode it here — let the server decide
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= SAFE_BYTES) return file; // already small enough

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85),
  );
}

/** File-picker that uploads to the API and returns the stored image URL. */
export function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const blob = await shrink(file);
      if (blob.size > 4 * 1024 * 1024) {
        setErr("That image is too large. Please use one under 4 MB.");
        return;
      }
      // Keep a sensible filename/extension — the API validates on extension.
      const name = blob.type === "image/jpeg" && !/\.(jpe?g)$/i.test(file.name)
        ? `${file.name.replace(/\.[^.]+$/, "")}.jpg`
        : file.name;

      const fd = new FormData();
      fd.append("file", blob, name);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({} as Record<string, unknown>));

      if (res.ok && typeof data.url === "string") {
        onChange(data.url);
      } else {
        const detail = data.error || data.detail;
        setErr(
          typeof detail === "string" && detail
            ? detail
            : res.status === 401
              ? "Not authorised — check the admin key in Settings."
              : res.status === 413
                ? "That image is too large. Please use a smaller one."
                : `Upload failed (error ${res.status}).`,
        );
      }
    } catch {
      setErr("Upload failed — check your connection and try again.");
    } finally {
      setBusy(false);
      e.target.value = ""; // let the same file be re-picked after a failure
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-brand-500 px-3 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50">
          {busy ? "Uploading…" : "📁 Upload from device"}
          <input type="file" accept="image/*" onChange={pick} className="hidden" disabled={busy} />
        </label>
        {value && !busy && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-7 w-7 rounded object-cover" /> Image added
          </span>
        )}
      </div>
      {err && <p className="mt-1 text-xs font-semibold text-red-500">{err}</p>}
    </div>
  );
}
