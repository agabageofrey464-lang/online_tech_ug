"""The look of every email we send.

Our mail went out as bare HTML — a heading, a paragraph, a borderless table
of figures. Next to the receipts and quotations the same customer gets, it
read like it came from somewhere else.

This is the shell all of them now use: our logo, the house teal, the content,
and a footer carrying the numbers to call. It is built the way email has to be
built — tables and inline styles, no external stylesheet, no background images
— because Gmail, Outlook and the rest strip anything cleverer.

Nothing here sends: it only returns HTML.
"""

from __future__ import annotations

from html import escape
from urllib.parse import quote

from app.core.config import settings

LOGO = f"{settings.site_url.rstrip('/')}/logo-full.png"

TEAL = "#0e7490"
TEAL_DARK = "#0c5d75"
TEAL_PALE = "#eefafd"
ORANGE = "#f15a29"
INK = "#222222"
MUTED = "#6e6e6e"
RULE = "#e2e8ea"
CANVAS = "#eef1f5"


def money(amount: int | float) -> str:
    return f"UGX {int(amount):,}"


def product_image(image_url: str) -> str:
    """A small, absolute URL for a product photo.

    Two things have to be true for a photo to show in an email. It must be
    absolute — an email client has no page to resolve "/products/x.jpg"
    against — and it must be small: our stored photos run to 300KB each, which
    on Ugandan mobile data is a thumbnail nobody waits for. The site's image
    optimiser turns that into about 4KB at the 56px we display.
    """
    url = (image_url or "").strip()
    site = settings.site_url.rstrip("/")

    if not url:
        return f"{site}/icon-192.png"
    if url.startswith("http://") or url.startswith("https://"):
        return url  # a vendor's own upload, already hosted elsewhere
    return f"{site}/_next/image?url={quote(url, safe='')}&w=128&q=70"


def button(label: str, href: str, colour: str = ORANGE) -> str:
    """A call to action that survives Outlook, which ignores padding on <a>."""
    return f"""
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px auto 4px">
      <tr>
        <td align="center" bgcolor="{colour}" style="border-radius:8px">
          <a href="{escape(href, quote=True)}"
             style="display:inline-block;padding:13px 30px;font-family:Arial,Helvetica,sans-serif;
                    font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px">
            {escape(label)}
          </a>
        </td>
      </tr>
    </table>"""


def items_table(rows: list[dict]) -> str:
    """The things being bought, with a picture of each.

    A customer checking an order wants to see the item, not read its name back
    — the thumbnail is what tells them at a glance that we picked the right one.
    """
    if not rows:
        return ""

    cells = []
    for r in rows:
        img = product_image(r.get("image_url", ""))
        name = escape(str(r.get("name", "")))
        qty = int(r.get("quantity", 1) or 1)
        line = money(r.get("line_total", 0))
        unit = money(r.get("unit_price", 0))

        cells.append(f"""
        <tr>
          <td width="66" style="padding:12px 10px 12px 0;vertical-align:top">
            <img src="{img}" alt="{name}" width="56" height="56"
                 style="width:56px;height:56px;object-fit:contain;border:1px solid {RULE};
                        border-radius:6px;background:#ffffff;display:block" />
          </td>
          <td style="padding:12px 8px 12px 0;vertical-align:top;font-family:Arial,Helvetica,sans-serif">
            <div style="font-size:14px;font-weight:bold;color:{INK};line-height:1.35">{name}</div>
            <div style="font-size:12px;color:{MUTED};padding-top:3px">{qty} × {unit}</div>
          </td>
          <td align="right" style="padding:12px 0;vertical-align:top;font-family:Arial,Helvetica,sans-serif;
                                   font-size:14px;font-weight:bold;color:{INK};white-space:nowrap">{line}</td>
        </tr>
        <tr><td colspan="3" style="border-top:1px solid {RULE};font-size:0;line-height:0">&nbsp;</td></tr>""")

    return f"""
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
           style="border-collapse:collapse;margin:6px 0 0">
      {''.join(cells)}
    </table>"""


def totals_table(rows: list[tuple[str, str]], grand: tuple[str, str] | None = None) -> str:
    """Subtotal, delivery, discount — then the figure that matters, in teal."""
    lines = "".join(
        f"""
        <tr>
          <td style="padding:3px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{MUTED}">{escape(label)}</td>
          <td align="right" style="padding:3px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{INK}">{escape(value)}</td>
        </tr>"""
        for label, value in rows
    )

    total = ""
    if grand:
        total = f"""
        <tr>
          <td style="padding:10px 12px;background:{TEAL};border-radius:6px 0 0 6px;
                     font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff">{escape(grand[0])}</td>
          <td align="right" style="padding:10px 12px;background:{TEAL};border-radius:0 6px 6px 0;
                     font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#ffffff">{escape(grand[1])}</td>
        </tr>"""

    return f"""
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
           style="border-collapse:separate;border-spacing:0 2px;margin-top:10px">
      {lines}{total}
    </table>"""


def panel(title: str, body_html: str, accent: str = TEAL) -> str:
    """A tinted block for an address, a note or a set of instructions."""
    return f"""
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
           style="margin:16px 0 0;border-collapse:collapse">
      <tr>
        <td style="border-left:3px solid {accent};background:{TEAL_PALE};padding:12px 14px;border-radius:0 6px 6px 0">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;
                      letter-spacing:.06em;text-transform:uppercase;color:{MUTED}">{escape(title)}</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:13.5px;color:{INK};
                      line-height:1.55;padding-top:5px">{body_html}</div>
        </td>
      </tr>
    </table>"""


def shell(*, heading: str, intro: str = "", body_html: str = "", show_phones: bool = True) -> str:
    """Wrap content in the company's letterhead, header to footer."""
    phone = settings.company_phone
    phone_alt = settings.company_phone_alt
    tel = phone.replace(" ", "")
    tel_alt = phone_alt.replace(" ", "")

    call_block = (
        f"""
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
               style="margin:18px 0 0;border-collapse:collapse">
          <tr>
            <td align="center" style="background:{TEAL_PALE};border-radius:8px;padding:14px">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{MUTED}">
                Questions? Call us and we&rsquo;ll help straight away.
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;padding-top:4px">
                <a href="tel:{tel}" style="color:{TEAL_DARK};text-decoration:none">{phone}</a>
                <span style="color:{MUTED}">&nbsp;&middot;&nbsp;</span>
                <a href="tel:{tel_alt}" style="color:{TEAL_DARK};text-decoration:none">{phone_alt}</a>
              </div>
            </td>
          </tr>
        </table>"""
        if show_phones
        else ""
    )

    intro_html = (
        f'<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14.5px;'
        f'line-height:1.6;color:{MUTED}">{intro}</p>'
        if intro
        else ""
    )

    site = settings.site_url.rstrip("/")

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>{escape(heading)}</title></head>
<body style="margin:0;padding:0;background:{CANVAS}">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{CANVAS}">
    <tr><td align="center" style="padding:22px 12px">

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"
             style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 2px 6px rgba(20,16,46,.08)">

        <!-- Letterhead -->
        <tr>
          <td align="center" style="padding:22px 24px 6px">
            <a href="{site}" style="text-decoration:none">
              <img src="{LOGO}" alt="Online Tech Uganda" width="210"
                   style="width:210px;max-width:72%;height:auto;display:block;border:0" />
            </a>
          </td>
        </tr>
        <tr><td style="padding:0 24px"><div style="height:3px;background:{TEAL};border-radius:2px"></div></td></tr>

        <!-- Content -->
        <tr>
          <td style="padding:20px 24px 4px">
            <h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:21px;
                       line-height:1.3;color:{TEAL_DARK}">{escape(heading)}</h1>
            {intro_html}
            {body_html}
            {call_block}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 24px 24px">
            <div style="border-top:1px solid {RULE};padding-top:14px;text-align:center;
                        font-family:Arial,Helvetica,sans-serif;font-size:11.5px;color:{MUTED};line-height:1.7">
              <b style="color:{INK}">Online Tech Uganda</b><br />
              Computers &amp; Accessories &middot; IT Services &middot; Software Development &middot; Computer Training<br />
              Kampala, Uganda &middot;
              <a href="mailto:{settings.contact_inbox}" style="color:{TEAL};text-decoration:none">{settings.contact_inbox}</a><br />
              <a href="{site}" style="color:{TEAL};text-decoration:none">{site.replace('https://', '')}</a>
            </div>
          </td>
        </tr>
      </table>

    </td></tr>
  </table>
</body></html>"""
