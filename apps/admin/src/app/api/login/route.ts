import { NextResponse } from "next/server";
import { makeToken, COOKIE, adminUser, adminPass, adminSecret } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));

  if (!adminPass()) {
    return NextResponse.json(
      { ok: false, error: "Admin credentials are not configured yet." },
      { status: 500 },
    );
  }

  if (username === adminUser() && password === adminPass()) {
    const token = await makeToken(adminUser(), adminSecret());
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: "Invalid username or password." }, { status: 401 });
}
