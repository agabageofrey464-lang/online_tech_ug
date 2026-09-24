"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, X } from "lucide-react";
import { uploadFile, type Upload } from "@/lib/academy";

/**
 * Attach a file.
 *
 * Uploads as soon as it's chosen, so by the time someone presses Submit the
 * file is already on the server and the button does one quick thing rather
 * than a slow one that can fail. The parent gets the URL through `onDone`.
 */
export function FilePicker({
  onDone,
  label = "Attach a file",
  hint = "PDF, Word, PowerPoint, images or a zip — up to 25MB",
}: {
  onDone: (url: string, name: string) => void;
  label?: string;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<Upload | null>(null);
  const [error, setError] = useState("");

  async function pick(chosen: File | undefined) {
    if (!chosen) return;
    setBusy(true);
    setError("");
    try {
      const up = await uploadFile(chosen);
      setFile(up);
      onDone(up.url, up.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file wouldn't upload.");
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setFile(null);
    setError("");
    onDone("", "");
    if (ref.current) ref.current.value = "";
  }

  if (file) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm">
        <Paperclip size={14} className="shrink-0 text-green-700" />
        <span className="min-w-0 flex-1 truncate font-semibold text-green-800">{file.name}</span>
        <span className="shrink-0 text-[11px] text-green-700/70">{file.size_kb} KB</span>
        <button
          type="button"
          onClick={clear}
          aria-label="Remove file"
          className="shrink-0 rounded p-1 text-green-700 hover:bg-green-100"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <input
        ref={ref}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt,.zip"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        className="press flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-600/25 px-4 py-3 text-sm font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-600 disabled:opacity-60"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />}
        {busy ? "Uploading…" : label}
      </button>
      <p className="mt-1 text-[11px] text-ink-700/50">{error || hint}</p>
    </div>
  );
}
