"use client";

import { useState } from "react";
import { videos } from "@/lib/videos";

export function VideoGrid() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {videos.map((v, i) => (
          <button
            key={v.src}
            onClick={() => setActive(i)}
            className="group relative aspect-[9/16] overflow-hidden rounded-lg border border-white/10 bg-black text-left shadow-lg ring-1 ring-white/5 transition hover:ring-brand-500/60"
          >
            <video
              src={`${v.src}#t=0.1`}
              preload="metadata"
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:scale-105 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11103a]/90 via-transparent to-transparent" />
            {/* Play badge */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/90 text-white shadow-lg transition group-hover:scale-110">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-2.5">
              <p className="text-xs font-bold text-white drop-shadow">{v.title}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                OnlineTech Studio
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Player modal */}
      {active !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            ×
          </button>
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <video
              src={videos[active].src}
              controls
              autoPlay
              playsInline
              className="max-h-[82vh] w-full rounded-lg bg-black shadow-2xl"
            />
            <p className="mt-3 text-center text-sm font-semibold text-white">
              {videos[active].title}{" "}
              <span className="text-brand-300">· Online Tech Uganda</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
