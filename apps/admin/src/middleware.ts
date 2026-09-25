import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { makeToken, COOKIE, adminUser, adminSecret } from "@/lib/auth";

const PUBLIC = ["/login", "/api/login", "/api/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE)?.value;
  const expected = await makeToken(adminUser(), adminSecret());

  if (cookie && cookie === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Protect everything except Next internals and the logo asset.
  // sw.js must stay public: a browser fetches a service worker without
  // cookies, so a redirect to /login means it can never register, and
  // without it there are no alerts on the owner's phone. The worker holds
  // no data of its own — the alerts it displays are pushed to it.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|logo.jpeg|logo-mark.png|logo-lockup.png|logo-lockup-dark.png|sw.js).*)"],
};
