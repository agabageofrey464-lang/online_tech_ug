import { NextResponse } from "next/server";

/**
 * Tells Bing, Yandex, Seznam and Naver every page the site has, once a day.
 *
 * Those engines share one protocol, IndexNow: one request reaches all of them
 * (and through Bing, DuckDuckGo, Yahoo and Ecosia, which use Bing's index).
 * It used to be a script run by hand after a deploy, so a product a vendor
 * listed on a quiet day was not announced until the next time somebody
 * remembered. Vercel now calls this each morning (see vercel.json); the list
 * is the live sitemap, so it always includes whatever was added yesterday.
 *
 * Google does not take part in IndexNow — it reads the sitemap on its own.
 */

const SITE = "https://www.onlinetechug.com";
const KEY = "7c43c79ebbcfa3e4ce5d462eae1336df";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Only the scheduler may set this off; anyone else gets nothing to abuse.
  const agent = req.headers.get("user-agent") ?? "";
  const secret = process.env.CRON_SECRET;
  const allowed = secret ? req.headers.get("authorization") === `Bearer ${secret}` : agent.includes("vercel-cron");
  if (!allowed) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const xml = await (await fetch(`${SITE}/sitemap.xml`, { cache: "no-store" })).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    if (urls.length === 0) return NextResponse.json({ ok: false, reason: "empty sitemap" }, { status: 502 });

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
    });
    return NextResponse.json({ ok: res.status === 200 || res.status === 202, status: res.status, urls: urls.length });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: String(e).slice(0, 200) }, { status: 502 });
  }
}
