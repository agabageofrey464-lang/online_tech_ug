"use client";

import { useCallback, useEffect, useState } from "react";

/** Base64url (VAPID) -> Uint8Array, the format the Push API expects. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

const supported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

/**
 * Alerts on this phone.
 *
 * The owner used to learn about an order because the customer sent it to them
 * on WhatsApp. This replaces that with a notification the server sends itself,
 * needing no third-party account and no key to copy — just Allow, once.
 */
export function PhoneAlerts() {
  const [devices, setDevices] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [blocked, setBlocked] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/push/alerts/devices", { cache: "no-store" });
      const d = await r.json();
      setDevices(typeof d.devices === "number" ? d.devices : 0);
    } catch {
      setDevices(0);
    }
  }, []);

  useEffect(() => {
    load();
    if (supported() && Notification.permission === "denied") setBlocked(true);
  }, [load]);

  async function turnOn() {
    if (!supported()) {
      setMsg("This browser can't show alerts. Use Chrome on Android, or Safari on iPhone with the admin added to your Home Screen.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setBlocked(permission === "denied");
        setMsg(
          permission === "denied"
            ? "Alerts are blocked for this site. Allow notifications in your browser settings, then try again."
            : "Alerts weren't allowed.",
        );
        return;
      }

      // The VAPID public key is public by design — it identifies us to the
      // browser's push service and cannot be used to send anything.
      const pk = await fetch("/api/push/alerts/key", { cache: "no-store" }).then((r) =>
        r.json(),
      );
      if (!pk?.key) {
        setMsg("Push isn't switched on for the server yet.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(pk.key) as BufferSource,
        }));

      const res = await fetch("/api/push/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) throw new Error("save failed");

      setMsg("✓ Alerts are on for this phone.");
      load();
    } catch {
      setMsg("Couldn't switch alerts on. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/push/alerts/test", { method: "POST" });
      const d = await r.json();
      setMsg(
        d.sent > 0
          ? `✓ Test sent to ${d.sent} device${d.sent === 1 ? "" : "s"} — check your phone.`
          : "No devices are set up yet. Tap “Turn on alerts” first.",
      );
    } catch {
      setMsg("Couldn't send the test.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-ink-600/10 bg-white p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-ink-900">Alerts on this phone</h2>
      <p className="mt-1 text-sm text-ink-700/70">
        Get a notification the moment an order, registration, application or request
        arrives — the same way WhatsApp would, without anyone having to message you.
      </p>

      <p className="mt-3 text-sm">
        {devices === null ? (
          <span className="text-ink-700/50">Checking…</span>
        ) : devices > 0 ? (
          <span className="font-bold text-green-700">
            ● On for {devices} device{devices === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="font-bold text-amber-700">● Not set up yet</span>
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={turnOn}
          disabled={busy}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? "Working…" : "Turn on alerts for this phone"}
        </button>
        {devices !== null && devices > 0 && (
          <button
            onClick={sendTest}
            disabled={busy}
            className="rounded-lg border border-ink-600/20 px-5 py-2.5 text-sm font-bold text-ink-800 hover:bg-ink-50 disabled:opacity-60"
          >
            Send me a test
          </button>
        )}
      </div>

      {msg && <p className="mt-3 text-sm font-semibold text-ink-800">{msg}</p>}

      {blocked && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
          Notifications are blocked for this site in your browser. Open the padlock or
          site settings, allow notifications, then tap the button again.
        </p>
      )}

      <p className="mt-4 border-t border-ink-600/10 pt-3 text-[12px] leading-relaxed text-ink-700/55">
        On iPhone this only works if you add the admin to your Home Screen first
        (Share → Add to Home Screen) and open it from there — Apple does not allow
        notifications from Safari tabs. On Android it works straight away.
      </p>
    </div>
  );
}
