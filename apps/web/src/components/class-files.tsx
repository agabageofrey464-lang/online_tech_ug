"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, PlayCircle, Upload, X } from "lucide-react";
import { academy, uploadFile, type Material } from "@/lib/academy";

/**
 * The files for a class, beside the call.
 *
 * A lecturer says "open the handout" and thirty students go looking for it.
 * This is where it is: the notes, slides and recordings shared for the class,
 * one tap from the video, and — for the lecturer — a button to add one while
 * the class is running. Everyone in the room sees it within a few seconds.
 */
export function ClassFiles({ classId, courseSlug, isHost, onClose }: { classId: number; courseSlug: string; isHost: boolean; onClose: () => void }) {
  const [files, setFiles] = useState<Material[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [kind, setKind] = useState<Material["kind"]>("note");

  const load = useCallback(async () => {
    try {
      setFiles(await academy.classFiles(classId));
    } catch {
      /* keep what is shown */
    }
  }, [classId]);

  // A file the lecturer has just added appears without anyone reloading.
  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  async function add(file: File) {
    setBusy(true);
    setMsg("");
    try {
      const up = await uploadFile(file);
      await academy.addMaterial({ course_slug: courseSlug, title: up.name, kind, url: up.url, live_class_id: classId });
      setMsg(`✓ Shared: ${up.name}`);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "That file could not be shared.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col bg-white text-ink-900 shadow-2xl">
      <div className="flex items-center justify-between border-b border-ink-600/10 px-4 py-3">
        <p className="font-extrabold">Class files</p>
        <button onClick={onClose} aria-label="Close files" className="rounded-md p-1.5 text-ink-700/60 hover:bg-ink-50 hover:text-ink-900">
          <X size={18} />
        </button>
      </div>

      {isHost && (
        <div className="border-b border-ink-600/10 bg-ink-50/60 p-3">
          <div className="flex gap-2">
            <select value={kind} onChange={(e) => setKind(e.target.value as Material["kind"])} aria-label="What kind of file" className="rounded-lg border border-ink-600/20 bg-white px-2 py-2 text-xs font-bold">
              <option value="note">Notes</option>
              <option value="slide">Slides</option>
              <option value="resource">Resource</option>
              <option value="recording">Recording</option>
            </select>
            <label className={`press flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-xs font-black text-white hover:bg-brand-600 ${busy ? "opacity-60" : ""}`}>
              <Upload size={14} /> {busy ? "Sharing…" : "Share a file with the class"}
              <input type="file" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void add(f); e.target.value = ""; }} />
            </label>
          </div>
          {msg && <p className="mt-2 text-xs font-semibold text-ink-800">{msg}</p>}
        </div>
      )}

      <ul className="min-h-0 flex-1 divide-y divide-ink-600/10 overflow-y-auto">
        {files.length === 0 && <li className="p-5 text-sm text-ink-700/60">Nothing has been shared for this class yet.</li>}
        {files.map((f) => (
          <li key={f.id}>
            <a href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-ink-50">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                {f.kind === "recording" ? <PlayCircle size={18} /> : <FileText size={18} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{f.title}</span>
                <span className="block text-[11.5px] capitalize text-ink-700/60">
                  {f.kind}
                  {f.live_class_id === classId ? " · shared in this class" : ""}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
