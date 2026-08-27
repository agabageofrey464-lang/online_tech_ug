"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

// Base64url (VAPID) -> Uint8Array, the format the Push API expects.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

const DISMISS_KEY = "otu_push_dismissed";
const supported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

/**
 * Asks the shopper if they'd like alerts about new stock and offers.
 *
 * Deliberately NOT shown the moment the page loads — a permission prompt with no
 * context gets denied, and a denial is permanent. We wait until they've browsed
 * a little, explain the value in our own UI first, and only call the browser
 * prompt once they tap "Yes".
 */
export function PushOptIn() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supported()) return;
    if (Notification.permission !== "default") return; // already allowed or blocked
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* storage blocked — still fine to ask */
    }

    // Register the worker up front so a later "Allow" is instant.
    navigator.serviceWorker.register("/sw.js").catch(() => {});

    // Only ask after some real engagement.
    const onScroll = () => {
      if (window.scrollY > 1200) {
        setShow(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(() => setShow(true), 25000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function enable() {
    setBusy(true);
    try {
      const keyRes = await fetch("/_api/push/public-key").then((r) => r.json());
      if (!keyRes?.enabled || !keyRes?.key) {
        dismiss();
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        dismiss();
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyRes.key) as BufferSource,
      });
      await fetch("/_api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      setDone(true);
      setTimeout(() => setShow(false), 2200);
    } catch {
      dismiss();
    } finally {
      setBusy(false);
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-[70] mx-auto max-w-sm rounded-2xl border border-ink-600/10 bg-white p-4 shadow-2xl md:bottom-5 md:left-5 md:right-auto md:mx-0">
      {done ? (
        <p className="py-1 text-center text-sm font-bold text-green-600">
          ✓ You&apos;re subscribed — we&apos;ll let you know about new deals.
        </p>
      ) : (
        <>
          <button
            onClick={dismiss}
            aria-label="No thanks"
            className="absolute right-2 top-2 rounded p-1 text-ink-700/40 hover:text-ink-700"
          >
            <X size={16} />
          </button>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Bell size={20} />
            </span>
            <div className="min-w-0 pr-4">
              <p className="text-sm font-extrabold text-ink-900">Get our deals first</p>
              <p className="mt-0.5 text-xs text-ink-700/70">
                New stock, offers and discounts — straight to your phone. No spam, turn off any time.
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={enable}
              disabled={busy}
              className="press flex-1 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? "Enabling…" : "Yes, notify me"}
            </button>
            <button
              onClick={dismiss}
              className="rounded-md border border-ink-600/20 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              Not now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
