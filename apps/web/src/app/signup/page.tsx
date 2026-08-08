"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogoFull } from "@/components/brand-logo-full";
import { Store, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { site } from "@/lib/site";

function SignupInner() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const initialRole = params.get("role") === "vendor" ? "vendor" : "customer";

  const [role, setRole] = useState<"customer" | "vendor">(initialRole);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", business_name: "", business_category: "", location: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const user = await register({ ...form, role });
      // Alert the owner (email + dashboard) when a new vendor registers, so it
      // can be reviewed and approved in the Vendors tab.
      if (role === "vendor") {
        fetch("/_api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            email: form.email,
            subject: "🆕 New vendor application",
            message: `New VENDOR registration — review & approve in the Vendors tab.\nBusiness: ${form.business_name}\nOwner: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}`,
          }),
        }).catch(() => {});
      }
      router.push(role === "vendor" ? "/vendor" : next);
      void user;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <Link href="/" className="mb-5 flex items-center gap-2 text-ink-900">
        <BrandLogoFull size="sm" flag={false} />
      </Link>

      <div className="w-full rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-ink-900">Create your account</h1>

        {/* Role toggle */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-ink-50 p-1">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-bold transition ${role === "customer" ? "bg-white text-brand-600 shadow-sm" : "text-ink-700/60"}`}
          >
            <User size={16} /> Customer
          </button>
          <button
            type="button"
            onClick={() => setRole("vendor")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-bold transition ${role === "vendor" ? "bg-white text-brand-600 shadow-sm" : "text-ink-700/60"}`}
          >
            <Store size={16} /> Sell as vendor
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          {role === "vendor" && (
            <>
              <input
                required
                placeholder="Business / shop name"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                className={input}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  required
                  value={form.business_category}
                  onChange={(e) => setForm({ ...form, business_category: e.target.value })}
                  className={`${input} bg-white`}
                >
                  <option value="">Business category…</option>
                  {[
                    "Computers & Laptops", "Phones & Accessories", "Electronics", "Fashion & Clothing",
                    "Home & Living", "Beauty & Health", "Food & Groceries", "Books & Stationery",
                    "Agriculture", "General / Other",
                  ].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  required
                  placeholder="Location (e.g. Kampala)"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={input}
                />
              </div>
            </>
          )}
          <input required placeholder={role === "vendor" ? "Owner's full name" : "Full name"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
          <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
          <input placeholder="Phone (07xx xxx xxx)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
          <input required type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} />

          {role === "vendor" && (
            <p className="rounded-md bg-brand-50 px-3 py-2 text-[12px] text-ink-700/80">
              Vendor accounts are reviewed before you can list products. We&apos;ll notify you once approved.
            </p>
          )}
          {err && <p className="text-xs font-semibold text-red-500">{err}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? "Creating account…" : role === "vendor" ? "Create vendor account" : "Create account"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm text-ink-700/70">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-700/50">Loading…</div>}>
      <SignupInner />
    </Suspense>
  );
}
