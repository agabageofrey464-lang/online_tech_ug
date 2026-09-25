"use client";

import { BrandLockup } from "@/components/brand-lockup";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        router.replace(params.get("from") || "/");
        router.refresh();
      } else {
        setError(data.error || "Login failed.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-700 p-4">
      <form
        onSubmit={submit}
        autoComplete="off"
        className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLockup onLight className="scale-110" />
          <h1 className="mt-4 text-lg font-extrabold text-ink-600">Sign in</h1>
          <p className="text-sm text-ink-600/60">Manage your store, courses and orders</p>
        </div>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block font-medium text-ink-600">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            required
            className="w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-medium text-ink-600">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </label>

        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
