"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function Inner() {
  const token = useSearchParams().get("token") || "";
  const [state, setState] = useState<"working" | "done" | "failed">("working");

  useEffect(() => {
    if (!token) {
      setState("failed");
      return;
    }
    fetch(`/_api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setState(d?.ok ? "done" : "failed"))
      .catch(() => setState("failed"));
  }, [token]);

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-md rounded-card border border-ink-600/10 bg-white p-8 text-center shadow-sm">
        {state === "working" && (
          <>
            <Loader2 className="mx-auto animate-spin text-brand-500" size={40} />
            <p className="mt-4 text-ink-700/70">Updating your preferences…</p>
          </>
        )}
        {state === "done" && (
          <>
            <CheckCircle2 className="mx-auto text-green-600" size={48} />
            <h1 className="mt-4 text-xl font-extrabold text-ink-900">You&apos;ve been unsubscribed</h1>
            <p className="mt-1 text-sm text-ink-700/70">
              We won&apos;t send you any more offers. You can still shop with us any time.
            </p>
          </>
        )}
        {state === "failed" && (
          <>
            <XCircle className="mx-auto text-gold-500" size={48} />
            <h1 className="mt-4 text-xl font-extrabold text-ink-900">That link didn&apos;t work</h1>
            <p className="mt-1 text-sm text-ink-700/70">
              The link may have expired. Message us on WhatsApp and we&apos;ll remove you right away.
            </p>
          </>
        )}
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="container-page py-20 text-center text-ink-700/50">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}
