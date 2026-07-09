"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { site } from "@/lib/site";

function LoginInner() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";

  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await login(form.email, form.password);
      router.push(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <Link href="/" className="mb-5 flex items-center gap-2">
        <Image src="/logo.jpeg" alt={site.name} width={40} height={40} className="h-10 w-10 rounded object-cover" />
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
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-bold text-brand-600 hover:underline">
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
