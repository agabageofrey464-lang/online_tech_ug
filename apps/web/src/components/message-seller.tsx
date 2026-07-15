"use client";

import { useState } from "react";
import { MessageSquare, X, CheckCircle2 } from "lucide-react";

/** Lets a customer send a message/enquiry to a vendor about a product. */
export function MessageSeller({ vendorId, vendorName, product }: { vendorId: number; vendorName: string; product: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`/_api/vendor/${vendorId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, product }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const input = "w-full rounded-md border border-ink-600/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <>
      <button
        onClick={() => { setOpen(true); setStatus("idle"); }}
        className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-ink-600/20 px-2 py-1.5 text-[11px] font-bold text-ink-700 transition hover:border-brand-300 hover:text-brand-600"
      >
        <MessageSquare size={13} /> Message seller
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink-900">Message {vendorName}</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-600/50 hover:text-ink-900"><X size={18} /></button>
            </div>
            {status === "done" ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto text-green-600" size={40} />
                <p className="mt-2 font-bold text-ink-900">Message sent!</p>
                <p className="mt-1 text-sm text-ink-700/60">{vendorName} will get back to you.</p>
                <button onClick={() => setOpen(false)} className="mt-4 rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600">Done</button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-3 space-y-2.5">
                <p className="text-xs text-ink-700/60">About: <b>{product}</b></p>
                <input required placeholder="Your name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={input} />
                <input required placeholder="Your phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className={input} />
                <input type="email" placeholder="Email (optional)" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className={input} />
                <textarea required rows={3} placeholder="Your message / question" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={input} />
                {status === "error" && <p className="text-xs font-semibold text-red-500">Couldn&apos;t send. Please try again.</p>}
                <button type="submit" disabled={status === "sending"} className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
