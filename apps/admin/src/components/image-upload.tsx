"use client";

import { useState } from "react";

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
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) onChange(data.url);
      else setErr(data.error || "Upload failed");
    } catch {
      setErr("Upload failed — check your connection.");
    } finally {
      setBusy(false);
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
