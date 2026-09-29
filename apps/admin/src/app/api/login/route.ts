import { NextResponse } from "next/server";
import { makeToken, safeEqual, COOKIE, adminUser, adminPass, adminSecret } from "@/lib/auth";

// Brute-force guard. In-memory, so it is per server instance rather than
// global — that is weaker than a shared store but still turns an unlimited
// guessing run into a slow one, and the admin password is the only thing
// standing in front of every customer record we hold.
const attempts = new Map<string, { n: number; until: number }>();
const MAX_ATTEMPTS = 8;
const LOCKOUT_MS = 10 * 60 * 1000;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0].trim() || "unknown";
}

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));
  const ip = clientIp(req);
  const now = Date.now();

  const record = attempts.get(ip);
  if (record && record.until > now && record.n >= MAX_ATTEMPTS) {
    const mins = Math.ceil((record.until - now) / 60000);
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${mins} minute(s).` },
      { status: 429 },
    );
  }

  if (!adminPass()) {
    // Said plainly, because the alternative is an admin who cannot sign in and
    // has no idea why. It names the setting, not its value.
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASS is not set on this deployment. Add it in the project settings and redeploy." },
      { status: 500 },
    );
  }

  const okUser = safeEqual(String(username ?? ""), adminUser());
  const okPass = safeEqual(String(password ?? ""), adminPass());

  if (okUser && okPass) {
    attempts.delete(ip);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, await makeToken(adminUser(), adminSecret()), {
      httpOnly: true,
      // Only over HTTPS in production. In local development the admin runs on
      // plain http://localhost, where a `secure` cookie is silently dropped —
      // which looks exactly like a login that does nothing.
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Deliberately no maxAge: closing the browser ends the session, so
      // opening the admin again asks who you are.
    });
    return res;
  }

  const next = record && record.until > now ? record.n + 1 : 1;
  attempts.set(ip, { n: next, until: now + LOCKOUT_MS });
  return NextResponse.json({ ok: false, error: "Invalid username or password." }, { status: 401 });
}
