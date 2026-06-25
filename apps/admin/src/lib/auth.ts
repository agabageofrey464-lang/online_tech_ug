// Edge-safe admin session token: HMAC-SHA256(user) signed with ADMIN_SECRET.
// Used by both the middleware (verify) and the login route (issue).

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function makeToken(user: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`admin:${user}`));
  return b64url(new Uint8Array(sig));
}

export const COOKIE = "otu_admin";
export const adminUser = () => process.env.ADMIN_USER ?? "admin";
export const adminPass = () => process.env.ADMIN_PASS ?? "";
export const adminSecret = () => process.env.ADMIN_SECRET ?? "dev-insecure-secret";
