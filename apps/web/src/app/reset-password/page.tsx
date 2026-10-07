"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, KeyRound, Lock, Mail } from "lucide-react";
import { BrandLogoFull } from "@/components/brand-logo-full";

/**
 * Choose a new password, without having to ask us.
 *
 * "Forgot password?" used to open WhatsApp, so a customer locked out at night
 * waited until morning for someone to reset it by hand. Two steps now: ask for
 * a code, which is emailed to the account's address; then enter it with a new
 * password. The first step answers the same way whether or not the address
 * has an account, so it cannot be used to find out who shops here.
 */
function ResetInner() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [step, setStep] = useState<"ask" | "code" | "done">("ask");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function post(path: string, body: Record<string, string>) {
    const res = await fetch(`/_api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : res.status === 422
            ? "Check the details and try again. A password needs at least 6 characters."
            : "Something went wrong. Please try again.",
      );
    }
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await post("forgot", { email: email.trim() });
      setStep("code");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await post("reset", { email: email.trim(), code: code.trim(), password });
      setStep("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-lg border border-ink-600/15 bg-white py-3 pl-10 pr-3 text-sm text-ink-900 placeholder:text-ink-700/40 focus:border-brand-500 focus:outline-none";
  const button =
    "press w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-600 disabled:opacity-60";

  return (
    <main className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex justify-center">
          <BrandLogoFull size="sm" flag />
        </Link>

        <div className="rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm sm:p-8">
          {step === "ask" && (
            <>
              <h1 className="text-2xl font-black text-ink-900">Reset your password</h1>
              <p className="mt-1 text-sm text-ink-700/65">
                Enter the email address on your account and we&apos;ll send you a 6-digit code.
              </p>
              <form onSubmit={ask} className="mt-5 space-y-4">
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
                  <input required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
                </div>
                {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
                <button type="submit" disabled={busy} className={button}>
                  {busy ? "Sending…" : "Email me a code"}
                </button>
              </form>
            </>
          )}

          {step === "code" && (
            <>
              <button type="button" onClick={() => { setStep("ask"); setErr(""); }} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-ink-700/60 hover:text-brand-600">
                <ArrowLeft size={14} /> Use a different email
              </button>
              <h1 className="text-2xl font-black text-ink-900">Enter your code</h1>
              <p className="mt-1 text-sm text-ink-700/65">
                If <b className="text-ink-900">{email}</b> has an account, a code is on its way. It works once and
                expires in 20 minutes. Check your spam folder if it hasn&apos;t arrived.
              </p>
              <form onSubmit={reset} className="mt-5 space-y-4">
                <div className="relative">
                  <KeyRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
                  <input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={`${field} font-mono tracking-[0.3em]`} />
                </div>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
                  <input required type="password" autoComplete="new-password" minLength={6} placeholder="New password (6 characters or more)" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
                </div>
                {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
                <button type="submit" disabled={busy} className={button}>
                  {busy ? "Saving…" : "Set new password"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <span className="text-5xl">✅</span>
              <h1 className="mt-3 text-2xl font-black text-ink-900">Password changed</h1>
              <p className="mt-1 text-sm text-ink-700/65">You can sign in with your new password now.</p>
              <Link href="/login" className={`${button} mt-5 inline-block`}>
                Sign in
              </Link>
            </div>
          )}
        </div>

        {step !== "done" && (
          <p className="mt-5 text-center text-sm text-ink-700/60">
            Remembered it?{" "}
            <Link href="/login" className="font-bold text-brand-600 hover:underline">
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-700/60">Loading…</div>}>
      <ResetInner />
    </Suspense>
  );
}
