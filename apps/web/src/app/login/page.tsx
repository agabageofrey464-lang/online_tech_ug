"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/lib/auth";
import { site } from "@/lib/site";

function LoginInner() {
  const { login, verifyLogin } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next");
  // Where to land after login: an explicit ?next wins; otherwise vendors go
  // straight to their dashboard, everyone else to their account.
  const dest = (role?: string) => nextParam || (role === "vendor" ? "/vendor" : "/account");

  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [code, setCode] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await login(form.email, form.password);
      if (res.twofa_required) {
        setOtpStep(true);
      } else {
        router.push(dest(res.user?.role));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const u = await verifyLogin(form.email, code);
      router.push(dest(u.role));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  if (otpStep) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
        <Link href="/" className="mb-5 flex items-center gap-2">
          <BrandLogo className="h-10 w-10 text-ink-600" />
          <span className="font-display text-lg font-extrabold text-ink-900">Online Tech Uganda</span>
        </Link>
        <div className="w-full rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-extrabold text-ink-900">Enter your login code</h1>
          <p className="mt-1 text-sm text-ink-700/60">
            We emailed a 6-digit code to <b>{form.email}</b>. Enter it to finish signing in.
          </p>
          <form onSubmit={submitOtp} className="mt-5 space-y-3">
            <input
              required
              inputMode="numeric"
              autoFocus
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${input} text-center text-lg tracking-[0.4em]`}
            />
            {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Verify & sign in"}
            </button>
            <button
              type="button"
              onClick={() => { setOtpStep(false); setCode(""); setErr(""); }}
              className="w-full text-center text-xs font-semibold text-ink-700/60 hover:underline"
            >
              ← Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <Link href="/" className="mb-5 flex items-center gap-2">
        <BrandLogo className="h-10 w-10 text-ink-600" />
        <span className="font-display text-lg font-extrabold text-ink-900">Online Tech Uganda</span>
      </Link>

      <div className="w-full rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-ink-900">Sign in</h1>
        <p className="mt-1 text-sm text-ink-700/60">Welcome back — sign in to your account.</p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            required
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={input}
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={input}
          />
          {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm text-ink-700/70">
        New to Online Tech Uganda?{" "}
        <Link href={`/signup?next=${encodeURIComponent(nextParam ?? "/account")}`} className="font-bold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-700/50">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
