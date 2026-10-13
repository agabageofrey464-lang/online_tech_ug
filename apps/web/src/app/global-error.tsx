"use client";

/**
 * The last resort: shown if the frame of the site itself fails — the header,
 * the fonts, the providers. It cannot lean on any of them, so it is plain
 * markup with its own few styles, a way to try again and a number to call.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif", background: "#f0ede6", color: "#16151d" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d9430f", margin: 0 }}>Online Tech Uganda</p>
          <h1 style={{ fontSize: 30, fontWeight: 600, margin: "14px 0 0" }}>The site did not load properly</h1>
          <p style={{ maxWidth: 420, lineHeight: 1.6, margin: "12px 0 0", color: "#44424d" }}>
            It is a fault on our side. Please try again in a moment. To order or ask anything now, call or WhatsApp 0756 839 270.
          </p>
          <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={reset} style={{ background: "#f15a29", color: "#fff", border: 0, padding: "15px 28px", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}>
              Try again
            </button>
            <a href="/" style={{ border: "1px solid #16151d", color: "#16151d", padding: "14px 28px", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", textDecoration: "none" }}>
              Home page
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
