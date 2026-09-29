// Edge-safe admin session token.
//
// The previous version signed a constant — HMAC("admin:<user>") — and used it
// as the whole cookie. That token never changed, so it never expired and could
// never be revoked: logging out only deleted the local copy, and the same value
// kept working for ever. Anyone who obtained it once, from a shared machine, a
// browser profile sync or a screenshot of devtools, had permanent access to
// customer records. The seven-day `maxAge` was a hint to the browser and
// nothing more; the server accepted the value regardless of age.
//
// Now the token carries its own issue time, expiry and a random nonce, and the
// server checks them. Two separate limits apply:
//
//   IDLE_MINUTES     — how long a session survives without being used. Every
//                      request slides it forward, so continuous work is never
//                      interrupted, but a dashboard left alone locks itself.
//   ABSOLUTE_HOURS   — the longest a session can live no matter how active,
//                      so a stolen cookie cannot be kept alive indefinitely.
//
// The cookie is also a session cookie now: closing the browser ends it, which
// is what the owner asked for — opening the admin should ask who you are.

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  return atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}

/** Compare two strings without leaking where they first differ. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type Session = { u: string; iat: number; exp: number; n: string };

/** Issue a session token. `iat` is carried over when sliding an existing one. */
export async function makeToken(user: string, secret: string, iat?: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(9)));
  const body: Session = {
    u: user,
    iat: iat ?? now,
    exp: now + idleMinutes() * 60,
    n: nonce,
  };
  const payload = b64url(new TextEncoder().encode(JSON.stringify(body)));
  return `${payload}.${await sign(payload, secret)}`;
}

/** Verify a token. Returns the session, or null if forged, expired or too old. */
export async function verifyToken(token: string, secret: string): Promise<Session | null> {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  if (!safeEqual(sig, await sign(payload, secret))) return null;

  let body: Session;
  try {
    body = JSON.parse(b64urlDecode(payload));
  } catch {
    return null;
  }
  if (!body || typeof body.exp !== "number" || typeof body.iat !== "number") return null;

  const now = Math.floor(Date.now() / 1000);
  if (body.exp < now) return null; // idle too long
  if (body.iat + absoluteHours() * 3600 < now) return null; // alive too long overall
  if (body.u !== adminUser()) return null; // username changed since it was issued
  return body;
}

export const COOKIE = "otu_admin";
export const adminUser = () => process.env.ADMIN_USER ?? "admin";
export const adminPass = () => process.env.ADMIN_PASS ?? "";
export const adminSecret = () => process.env.ADMIN_SECRET ?? "dev-insecure-secret";

/** Minutes of inactivity before the dashboard locks. */
export const idleMinutes = () => Number(process.env.ADMIN_IDLE_MINUTES ?? 45) || 45;
/** Hard cap on a session's total life, however busy it is. */
export const absoluteHours = () => Number(process.env.ADMIN_MAX_HOURS ?? 12) || 12;
