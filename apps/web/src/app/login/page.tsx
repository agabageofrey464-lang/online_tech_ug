"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Truck, GraduationCap, ArrowLeft } from "lucide-react";
import { BrandLogoFull } from "@/components/brand-logo-full";
import { useAuth } from "@/lib/auth";

const field =
  "w-full rounded-lg border border-ink-600/15 bg-white py-3 pl-10 pr-3 text-sm text-ink-900 placeholder-ink-700/40 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

// Left brand panel — the Jumia-style coloured welcome column (desktop only).
function BrandPanel() {
  const bullets = [
    { icon: Truck, title: "Fast, tracked delivery", body: "Genuine computers & accessories, delivered across Uganda." },
    { icon: ShieldCheck, title: "Secure account", body: "Your orders, wishlist and course codes in one safe place." },
    { icon: GraduationCap, title: "Learn & earn", body: "Access paid courses, notes and certificates you own." },
  ];
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-ink-700 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
      {/* soft decorative glows */}
      <span className="animate-blob pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <span className="animate-blob-slow pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-ink-900/25 blur-2xl" />

      <Link href="/" className="relative z-10 inline-flex w-fit">
        <BrandLogoFull size="md" flag />
      </Link>

      <div className="relative z-10 max-w-sm">
        <h2 className="text-3xl font-black leading-tight xl:text-4xl">
          Welcome back to <span className="text-white">Online Tech</span> Uganda
        </h2>
        <p className="mt-3 text-sm text-white/85">
          Sign in to shop, track orders, and unlock your courses — all from one account.
        </p>

        <ul className="mt-8 space-y-4">
          {bullets.map((b) => (
            <li key={b.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <b.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-bold">{b.title}</p>
                <p className="text-xs text-white/75">{b.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-white/60">© {new Date().getFullYear()} Online Tech Uganda</p>
    </aside>
  );
}

function LoginInner() {
  const { login, verifyLogin } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next");
  // Where to land after login: an explicit ?next wins; otherwise vendors go
  // straight to their dashboard, everyone else to their account.
  const dest = (role?: string) => nextParam || (role === "vendor" ? "/vendor" : "/account");

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
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

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <BrandPanel />

      {/* Form column */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo (brand panel is desktop-only) */}
          <Link href="/" className="mb-6 flex justify-center lg:hidden">
            <BrandLogoFull size="sm" flag />
          </Link>

          <div className="rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm sm:p-8">
            {otpStep ? (
              <>
                <button
                  type="button"
                  onClick={() => { setOtpStep(false); setCode(""); setErr(""); }}
                  className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-ink-700/60 hover:text-brand-600"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <h1 className="text-2xl font-black text-ink-900">Enter your login code</h1>
                <p className="mt-1 text-sm text-ink-700/60">
                  We emailed a 6-digit code to <b className="text-ink-800">{form.email}</b>.
                </p>
                <form onSubmit={submitOtp} className="mt-6 space-y-4">
                  <input
                    required
                    inputMode="numeric"
                    autoFocus
                    placeholder="••••••"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full rounded-lg border border-ink-600/15 bg-white px-3 py-3 text-center text-xl font-bold tracking-[0.5em] text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
                  <button
                    type="submit"
                    disabled={busy}
                    className="press w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-600 disabled:opacity-60"
                  >
                    {busy ? "Verifying…" : "Verify & sign in"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-black text-ink-900">Sign in</h1>
                <p className="mt-1 text-sm text-ink-700/60">
                  Welcome back — sign in to your Online Tech Uganda account.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-ink-800">Email address</label>
                    <div className="relative">
                      <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={field}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="block text-xs font-bold text-ink-800">Password</label>
                      <Link
                        href={`/reset-password${form.email ? `?email=${encodeURIComponent(form.email)}` : ""}`}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
                      <input
                        required
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className={`${field} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        aria-label={showPw ? "Hide password" : "Show password"}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-ink-700/50 hover:text-ink-800"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {err && <p className="text-xs font-semibold text-red-500">{err}</p>}

                  <button
                    type="submit"
                    disabled={busy}
                    className="press w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-600 disabled:opacity-60"
                  >
                    {busy ? "Signing in…" : "Sign in"}
                  </button>
                </form>

                <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-ink-700/40">
                  <span className="h-px flex-1 bg-ink-600/10" /> New here? <span className="h-px flex-1 bg-ink-600/10" />
                </div>

                <Link
                  href={`/signup?next=${encodeURIComponent(nextParam ?? "/account")}`}
                  className="press flex w-full items-center justify-center rounded-lg border-2 border-brand-500 px-4 py-2.5 text-sm font-bold text-brand-600 transition hover:bg-brand-50"
                >
                  Create an account
                </Link>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-ink-700/50">
            By continuing you agree to Online Tech Uganda&apos;s{" "}<Link href="/terms" className="underline hover:text-brand-600">terms</Link> &amp;{" "}<Link href="/privacy" className="underline hover:text-brand-600">privacy policy</Link>.
          </p>
        </div>
      </main>
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
