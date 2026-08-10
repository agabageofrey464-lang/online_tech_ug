"use client";

import { useEffect, useState } from "react";
import { X, GraduationCap, CheckCircle2, CreditCard } from "lucide-react";
import { whatsappLink, ugx, site } from "@/lib/site";
import { enroll, setLearnerName } from "@/lib/learning";
import { registerForCourse, initCoursePayment, onlinePaymentEnabled } from "@/lib/api";

export function CourseRegister({
  courseSlug,
  courseTitle,
  price,
  label = "Register for this course",
}: {
  courseSlug: string;
  courseTitle: string;
  price: number;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [payingOnline, setPayingOnline] = useState(false);
  const [onlineOn, setOnlineOn] = useState(false);
  const [payErr, setPayErr] = useState("");

  // Only offer "Pay online" when Flutterwave is switched on in the backend.
  useEffect(() => {
    if (!open) return;
    let live = true;
    onlinePaymentEnabled().then((on) => live && setOnlineOn(on));
    return () => {
      live = false;
    };
  }, [open]);

  // Pay now with Mobile Money / card via Flutterwave. On success the learner is
  // emailed their unlock code and lands on the course success page.
  async function payOnline() {
    setPayErr("");
    if (!form.name.trim() || !form.email.trim()) {
      setPayErr("Enter your name and email so we can send your unlock code.");
      return;
    }
    setPayingOnline(true);
    try {
      if (form.name) setLearnerName(form.name);
      enroll(courseSlug);
      const { link } = await initCoursePayment({
        course_slug: courseSlug,
        name: form.name,
        email: form.email,
        phone: form.phone,
      });
      window.location.href = link; // hand off to Flutterwave's hosted checkout
    } catch (err) {
      setPayErr(err instanceof Error ? err.message : "Couldn't start the payment. Try again.");
      setPayingOnline(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    // Record the registration locally so the learner appears on their dashboard.
    try {
      const key = "otu_course_regs";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push({ course: courseTitle, ...form, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
    if (form.name) setLearnerName(form.name);
    enroll(courseSlug); // add to the student's dashboard

    // Register with the backend — this generates the unlock code and emails it to
    // the OWNER (not the learner). The learner never sees the code.
    try {
      await registerForCourse({
        course_slug: courseSlug,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
      });
    } catch {
      // Offline / API down — fall back to the WhatsApp-only flow below.
    }

    setDone(true);
    setBusy(false);
    const msg =
      `Hello Online Tech Uganda! I'd like to REGISTER for the course "${courseTitle}"${
        price ? ` (${ugx(price)})` : ""
      }.\nName: ${form.name}\nPhone: ${form.phone}${form.email ? `\nEmail: ${form.email}` : ""}`;
    window.open(whatsappLink(msg), "_blank");
  }

  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <>
      <button
        onClick={() => {
          setDone(false);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600"
      >
        <GraduationCap size={16} /> {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-ink-600">Course registration</h3>
                <p className="text-sm text-ink-700/60">{courseTitle}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-600/50 hover:text-ink-600">
                <X size={20} />
              </button>
            </div>

            {done ? (
              <div className="py-3 text-center">
                <CheckCircle2 className="mx-auto text-green-600" size={40} />
                <p className="mt-2 font-bold text-ink-700">You&apos;re registered!</p>
                <ol className="mt-3 space-y-1 text-left text-[13px] text-ink-700/75">
                  <li><b>1.</b> Pay {price ? <b>{ugx(price)}</b> : "the course fee"} via Mobile Money to <b>{site.phoneDisplay}</b>.</li>
                  <li><b>2.</b> Send your payment confirmation on WhatsApp (we&apos;ve opened it for you).</li>
                  <li><b>3.</b> We&apos;ll send you your unlock code once payment is confirmed — enter it on the course page to open all lessons.</li>
                </ol>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={input}
                />
                <input
                  required
                  placeholder="Phone (07xx xxx xxx)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={input}
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={input}
                />
                {onlineOn && price > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={payOnline}
                      disabled={payingOnline || busy}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      <CreditCard size={16} />
                      {payingOnline ? "Opening secure checkout…" : `Pay online · ${ugx(price)}`}
                    </button>
                    <p className="text-center text-[11px] text-ink-700/50">
                      MTN &amp; Airtel Money or card — your unlock code is emailed instantly.
                    </p>
                    <div className="flex items-center gap-3 py-0.5 text-[11px] font-semibold text-ink-700/40">
                      <span className="h-px flex-1 bg-ink-600/10" /> or <span className="h-px flex-1 bg-ink-600/10" />
                    </div>
                  </>
                )}
                {payErr && <p className="text-center text-xs font-semibold text-red-500">{payErr}</p>}
                <button
                  type="submit"
                  disabled={busy || payingOnline}
                  className={`w-full rounded-md px-4 py-2.5 text-sm font-bold disabled:opacity-60 ${
                    onlineOn && price > 0
                      ? "border border-ink-600/20 bg-white text-ink-700 hover:bg-ink-50"
                      : "bg-brand-500 text-white hover:bg-brand-600"
                  }`}
                >
                  {busy ? "Registering…" : onlineOn && price > 0 ? "Pay later via WhatsApp" : price ? `Register · ${ugx(price)}` : "Register free"}
                </button>
                <p className="text-center text-[11px] text-ink-700/50">
                  We&apos;ll confirm your spot and payment on WhatsApp.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
