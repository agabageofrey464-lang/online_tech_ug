// Tell search engines which pages exist, or have changed.
//
//   node scripts/indexnow.mjs            every URL in the live sitemap
//   node scripts/indexnow.mjs /learn /   only these paths
//
// IndexNow is the protocol Bing, Yandex, Seznam and Naver share: one request
// reaches all of them. They trust it because the key below is also published
// as a file at the site root (public/<key>.txt), which only the site's owner
// could have put there. Google does not take part — its sitemap is submitted
// once in Search Console, and it re-reads it on its own after that.
//
// Run it after a deploy, never before: it asks crawlers to fetch the live
// pages, so the new version has to be the one that is live.

const SITE = "https://www.onlinetechug.com";
const KEY = "7c43c79ebbcfa3e4ce5d462eae1336df";
const HOST = new URL(SITE).host;

async function sitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`, { cache: "no-store" });
  if (!res.ok) throw new Error(`sitemap returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const paths = process.argv.slice(2);
const urls = paths.length ? paths.map((p) => new URL(p, SITE).href) : await sitemapUrls();
if (urls.length === 0) {
  console.error("Nothing to submit.");
  process.exit(1);
}

// The key file must be live, or every engine rejects the submission.
const keyFile = await fetch(`${SITE}/${KEY}.txt`, { cache: "no-store" });
if (!keyFile.ok || (await keyFile.text()).trim() !== KEY) {
  console.error(`The key file is not live at ${SITE}/${KEY}.txt — deploy first, then run this again.`);
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
});

// 200 = accepted. 202 = accepted, key still being checked. Anything else is a refusal.
const verdict =
  res.status === 200 ? "accepted" : res.status === 202 ? "accepted, key check pending" : `refused: ${await res.text()}`;
console.log(`IndexNow: ${urls.length} URL(s) submitted — ${res.status} ${verdict}`);
if (res.status !== 200 && res.status !== 202) process.exit(1);
