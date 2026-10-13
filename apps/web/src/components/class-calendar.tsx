"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import type { LiveClass } from "@/lib/academy";

/**
 * The timetable as a month on a wall calendar.
 *
 * The list answers "what is next". A student planning a week, or checking
 * whether Thursday is free, wants to see the month: which days have a class,
 * and at what time. Days with a class are marked; choosing one lists what is
 * on it, with the door to join when it is open.
 */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const time = (iso: string) => new Date(iso.endsWith("Z") ? iso : `${iso}Z`).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const local = (iso: string) => new Date(iso.endsWith("Z") ? iso : `${iso}Z`);

export function ClassCalendar({ classes, courseTitle }: { classes: LiveClass[]; courseTitle: (slug: string) => string }) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [picked, setPicked] = useState<string>(key(today));

  const byDay = useMemo(() => {
    const map = new Map<string, LiveClass[]>();
    for (const c of classes) {
      const k = key(local(c.starts_at));
      map.set(k, [...(map.get(k) ?? []), c]);
    }
    return map;
  }, [classes]);

  // The grid: blanks before the 1st so the week starts on Monday.
  const first = (month.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const onDay = byDay.get(picked) ?? [];
  const move = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="rounded-xl border border-ink-600/10 bg-white p-3.5 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <button onClick={() => move(-1)} aria-label="Previous month" className="press rounded-lg p-2 text-ink-700 hover:bg-ink-50">
          <ChevronLeft size={18} />
        </button>
        <p className="text-base font-extrabold text-ink-900">{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
        <button onClick={() => move(1)} aria-label="Next month" className="press rounded-lg p-2 text-ink-700 hover:bg-ink-50">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {DAYS.map((d) => (
          <span key={d} className="pb-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-700/50">
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`b${i}`} />;
          const k = key(d);
          const has = byDay.get(k) ?? [];
          const isToday = k === key(today);
          const on = k === picked;
          return (
            <button
              key={k}
              onClick={() => setPicked(k)}
              aria-label={`${d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}${has.length ? `, ${has.length} class${has.length > 1 ? "es" : ""}` : ""}`}
              aria-pressed={on}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition ${
                on ? "bg-brand-500 font-extrabold text-white" : has.length ? "bg-brand-50 font-bold text-ink-900 hover:bg-brand-100" : "text-ink-700/70 hover:bg-ink-50"
              } ${isToday && !on ? "ring-2 ring-brand-500" : ""}`}
            >
              {d.getDate()}
              {has.length > 0 && (
                <span className="mt-0.5 flex gap-0.5">
                  {has.slice(0, 3).map((c) => (
                    <span key={c.id} className={`h-1.5 w-1.5 rounded-full ${on ? "bg-white" : c.private_user_id ? "bg-ink-800" : "bg-brand-500"}`} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-t border-ink-600/10 pt-3">
        {onDay.length === 0 ? (
          <p className="text-sm text-ink-700/60">No class on this day.</p>
        ) : (
          <ul className="space-y-2">
            {onDay.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3">
                <span className="w-12 shrink-0 font-mono text-sm font-bold text-brand-600">{time(c.starts_at)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink-900">
                    {c.private_user_id ? <Lock size={12} className="mr-1 inline -translate-y-px" /> : null}
                    {c.title}
                  </span>
                  <span className="block truncate text-[12px] text-ink-700/60">
                    {courseTitle(c.course_slug)} · {c.duration_mins} min{c.lecturer_name ? ` · ${c.lecturer_name}` : ""}
                  </span>
                </span>
                {c.joinable ? (
                  <Link href={`/academy/class/${c.id}`} className="press shrink-0 rounded-lg bg-green-600 px-3.5 py-2 text-xs font-black text-white">
                    JOIN
                  </Link>
                ) : (
                  <span className="shrink-0 text-[11px] font-semibold text-ink-700/50">{c.join_note}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
