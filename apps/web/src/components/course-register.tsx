"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, GraduationCap, CreditCard } from "lucide-react";
import { ugx, site } from "@/lib/site";
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
  const [busy, setBusy] = useState(false);
  const [payingOnline, setPayingOnline] = useState(false);
  const [onlineOn, setOnlineOn] = useState(false);
  const [payErr, setPayErr] = useState("");
  const [regErr, setRegErr] = useState("");
  const router = useRouter();

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
    setRegErr("");
    // Record the registration locally so the learner appears on their dashboard.
    try {
      const key = "otu_course_regs";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push({ course: courseTitle, ...form, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
    if (form.name) setLearnerName(form.name);
    enroll(courseSlug); // add to the student's dashboard

    // Register with the backend. This records the registration, alerts the
    // owner and emails the learner their reference. The unlock code goes to
    // the owner alone — the learner never sees it here.
    try {
      const res = await registerForCourse({
        course_slug: courseSlug,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
      });

      // Somewhere that answers their questions, rather than our WhatsApp inbox.
      const q = new URLSearchParams({
        ...(res.reference ? { ref: res.reference } : {}),
        ...(res.emailed ? { emailed: "1" } : {}),
        ...(form.name ? { name: form.name } : {}),
      });
      router.push(`/learn/${courseSlug}/registered?${q.toString()}`);
      return;
    } catch {
      // It did not reach us, so do not tell them it did.
      setRegErr(
        "We couldn't record your registration. Check your connection and try again, " +
          `or call us on ${site.phoneDisplay}.`,
      );
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-[3px] border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-[3px] bg-brand-500 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-brand-600"
      >
        <GraduationCap size={16} /> {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-sm bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-ink-600">Course registration</h3>
              <p className="text-sm text-ink-700/60">{courseTitle}</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-600/50 hover:text-ink-600">
              <X size={20} />
            </button>
            </div>

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
                    className="flex w-full items-center justify-center gap-2 rounded-[3px] bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
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
              {regErr && <p className="text-center text-xs font-semibold text-red-500">{regErr}</p>}
              <button
                type="submit"
                disabled={busy || payingOnline}
                className={`w-full rounded-[3px] px-4 py-2.5 text-sm font-bold disabled:opacity-60 ${
                  onlineOn && price > 0
                    ? "border border-ink-600/20 bg-white text-ink-700 hover:bg-ink-50"
                    : "bg-brand-500 text-white hover:bg-brand-600"
                }`}
              >
                {busy ? "Registering…" : onlineOn && price > 0 ? "Register and pay later" : price ? `Register · ${ugx(price)}` : "Register free"}
              </button>
              <p className="text-center text-[11px] text-ink-700/50">
                We&apos;ll email your registration reference and how to pay.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
