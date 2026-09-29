import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, makeToken, COOKIE, adminSecret } from "@/lib/auth";

const PUBLIC = ["/login", "/api/login", "/api/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE)?.value;
  const session = cookie ? await verifyToken(cookie, adminSecret()) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    // Clear whatever was there so a stale or forged cookie is not sent again.
    const res = NextResponse.redirect(url);
    if (cookie) res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }

  const res = NextResponse.next();

  // Slide the session forward while it is being used, keeping the original
  // issue time so the absolute cap still applies. Only past halfway, so we are
  // not re-signing a cookie on every single request.
  const now = Math.floor(Date.now() / 1000);
  const life = session.exp - session.iat;
  if (session.exp - now < life / 2) {
    res.cookies.set(COOKIE, await makeToken(session.u, adminSecret(), session.iat), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      // No maxAge: a session cookie, so closing the browser ends the session.
    });
  }

  return res;
}

export const config = {
  // Protect everything except Next internals and the logo asset.
  // sw.js must stay public: a browser fetches a service worker without
  // cookies, so a redirect to /login means it can never register, and
  // without it there are no alerts on the owner's phone. The worker holds
  // no data of its own — the alerts it displays are pushed to it.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|logo.jpeg|logo-mark.png|logo-lockup.png|logo-lockup-dark.png|sw.js).*)"],
};
