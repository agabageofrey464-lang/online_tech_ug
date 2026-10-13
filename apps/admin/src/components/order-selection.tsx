"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Choosing several orders at once, to remove the ones that are finished.
 *
 * Orders could only be removed one at a time, from each row's own menu, so
 * clearing a month of delivered and cancelled orders meant hunting for them
 * down the list. This adds a tick box to every row and a bar above the table:
 * one press ticks everything that is done — delivered, cancelled or failed —
 * and one more removes them, after saying how many and asking.
 *
 * Nothing is ticked for you until you press, and an order that is still in
 * hand is never picked by the "done" buttons.
 */

export type SelectableOrder = { reference: string; status: string; payment_status: string; customer_name: string; total: number };

/** Finished, one way or another: nothing more will happen to it. */
const GROUPS: { key: string; label: string; match: (o: SelectableOrder) => boolean }[] = [
  { key: "delivered", label: "Delivered", match: (o) => o.status === "delivered" },
  { key: "cancelled", label: "Cancelled", match: (o) => o.status === "cancelled" || o.payment_status === "cancelled" },
  { key: "failed", label: "Failed payment", match: (o) => o.payment_status === "failed" },
];
const isDone = (o: SelectableOrder) => GROUPS.some((g) => g.match(o));

type Ctx = { picked: Set<string>; toggle: (ref: string) => void; on: boolean };
const SelectionCtx = createContext<Ctx>({ picked: new Set(), toggle: () => {}, on: false });

export function OrderSelection({ orders, children }: { orders: SelectableOrder[]; children: ReactNode }) {
  const router = useRouter();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");

  const toggle = (ref: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(ref)) n.delete(ref);
      else n.add(ref);
      return n;
    });
  const pick = (list: SelectableOrder[]) => {
    setOn(true);
    setPicked(new Set(list.map((o) => o.reference)));
    setNote("");
  };

  const chosen = orders.filter((o) => picked.has(o.reference));
  const stillOpen = chosen.filter((o) => !isDone(o));
  const ctx = useMemo(() => ({ picked, toggle, on }), [picked, on]);

  async function remove() {
    if (chosen.length === 0) return;
    const warn = stillOpen.length
      ? `\n\nCAREFUL: ${stillOpen.length} of these ${stillOpen.length === 1 ? "is" : "are"} NOT finished (still pending, paid or on the way): ${stillOpen
          .slice(0, 5)
          .map((o) => o.reference)
          .join(", ")}${stillOpen.length > 5 ? "…" : ""}`
      : "";
    if (!window.confirm(`Remove ${chosen.length} order${chosen.length === 1 ? "" : "s"} for good? This cannot be undone.${warn}`)) return;

    let done = 0;
    const failed: string[] = [];
    for (const o of chosen) {
      setBusy(`Removing ${done + failed.length + 1} of ${chosen.length}…`);
      try {
        const res = await fetch(`/api/orders/${o.reference}`, { method: "DELETE" });
        if (res.ok) done += 1;
        else failed.push(o.reference);
      } catch {
        failed.push(o.reference);
      }
    }
    setBusy("");
    setPicked(new Set(failed));
    setNote(failed.length ? `Removed ${done}. Could not remove: ${failed.join(", ")}.` : `Removed ${done} order${done === 1 ? "" : "s"}.`);
    router.refresh();
  }

  return (
    <SelectionCtx.Provider value={ctx}>
      <div className="mb-3 rounded-2xl border border-ink-600/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-extrabold text-ink-600">Clear finished orders:</span>
          <button onClick={() => pick(orders.filter(isDone))} className="rounded-lg bg-ink-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-ink-600">
            Select all done ({orders.filter(isDone).length})
          </button>
          {GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => pick(orders.filter(g.match))}
              disabled={orders.filter(g.match).length === 0}
              className="rounded-lg border border-ink-600/20 px-3 py-2 text-xs font-bold text-ink-600 hover:bg-ink-50 disabled:opacity-40"
            >
              {g.label} ({orders.filter(g.match).length})
            </button>
          ))}
          <button
            onClick={() => {
              setOn((v) => !v);
              if (on) setPicked(new Set());
            }}
            className="rounded-lg border border-ink-600/20 px-3 py-2 text-xs font-bold text-ink-600 hover:bg-ink-50"
          >
            {on ? "Stop selecting" : "Choose by hand"}
          </button>
        </div>

        {(on || chosen.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-ink-600/10 pt-3">
            <span className="text-sm text-ink-600">
              <b>{chosen.length}</b> selected
              {chosen.length > 0 && <> · USh {chosen.reduce((s, o) => s + o.total, 0).toLocaleString("en-UG")}</>}
            </span>
            {stillOpen.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                {stillOpen.length} not finished yet
              </span>
            )}
            <button
              onClick={remove}
              disabled={chosen.length === 0 || !!busy}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40"
            >
              {busy || `🗑 Remove selected (${chosen.length})`}
            </button>
            {chosen.length > 0 && !busy && (
              <button onClick={() => setPicked(new Set())} className="text-xs font-bold text-ink-600/60 hover:text-ink-600 hover:underline">
                Untick all
              </button>
            )}
          </div>
        )}
        {note && <p className="mt-2 text-sm font-semibold text-ink-600">{note}</p>}
      </div>
      {children}
    </SelectionCtx.Provider>
  );
}

/** The tick box in a row. Hidden until selecting is switched on. */
export function OrderTick({ reference }: { reference: string }) {
  const { picked, toggle, on } = useContext(SelectionCtx);
  if (!on && picked.size === 0) return null;
  return (
    <input
      type="checkbox"
      checked={picked.has(reference)}
      onChange={() => toggle(reference)}
      aria-label={`Select order ${reference}`}
      className="h-4 w-4 shrink-0 accent-[#f15a29]"
    />
  );
}
