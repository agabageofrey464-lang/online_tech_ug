"""Turn a scanned signature into one that can be printed on our documents.

A phone scan arrives as a white page with a blue signature on it, usually
rotated, often with a scanner app's watermark along the bottom. Dropping that
straight onto a receipt gives you a grey rectangle sitting over the ruled line.

This crops to the ink, drops the paper away to transparency, straightens the
image and writes public/signature.png — which the receipts, certificates and
internship letters already look for.

    python scripts/make_signature.py public/signature-raw.jpg
    python scripts/make_signature.py public/signature-raw.jpg --rotate -90

--rotate is applied before anything else, for a scan taken sideways. Run it
once, look at the result, and adjust if the signature is on its side.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "public" / "signature.png"

# Rows this far up from the bottom are where scanner apps put their watermark.
WATERMARK_BAND = 0.08
# A pixel darker than this counts as ink rather than paper.
INK = 205
# Ink is pushed to a near-black ink colour so it prints like a real pen.
PEN = (12, 26, 92)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2

    src = Path(sys.argv[1])
    if not src.exists():
        print(f"Not found: {src}")
        return 1

    rotate = 0
    if "--rotate" in sys.argv:
        rotate = int(sys.argv[sys.argv.index("--rotate") + 1])

    im = Image.open(src).convert("RGB")
    if rotate:
        im = im.rotate(rotate, expand=True, fillcolor=(255, 255, 255))

    w, h = im.size

    # Drop the watermark band before measuring, or the crop keeps the caption.
    cut = int(h * (1 - WATERMARK_BAND))
    im = im.crop((0, 0, w, cut))
    w, h = im.size

    px = im.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()

    min_x, min_y, max_x, max_y = w, h, -1, -1

    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            lum = (r * 299 + g * 587 + b * 114) // 1000
            if lum >= INK:
                continue  # paper
            # Darker ink becomes more opaque, so strokes keep their weight and
            # the feathered edges of a pen stay soft rather than jagged.
            alpha = min(255, int((INK - lum) * 255 / INK * 1.6))
            if alpha < 12:
                continue
            op[x, y] = (PEN[0], PEN[1], PEN[2], alpha)
            if x < min_x: min_x = x
            if y < min_y: min_y = y
            if x > max_x: max_x = x
            if y > max_y: max_y = y

    if max_x < 0:
        print("No ink found — is the scan very light? Try lowering INK.")
        return 1

    pad = 6
    box = (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(w, max_x + pad + 1),
        min(h, max_y + pad + 1),
    )
    out = out.crop(box)

    # A signature is wider than it is tall. If this one isn't, the scan was
    # taken sideways and turning it is almost certainly what was meant.
    ow, oh = out.size
    if oh > ow * 1.3:
        out = out.rotate(-90, expand=True)
        ow, oh = out.size
        print("Rotated -90° — the ink was taller than it was wide.")

    # Keep it small enough to embed in a PDF without bloating the file.
    if ow > 900:
        out = out.resize((900, max(1, round(oh * 900 / ow))), Image.LANCZOS)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT)
    print(f"Wrote {OUT}  ({out.size[0]}x{out.size[1]})")
    print("It appears on receipts, certificates and internship letters.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
