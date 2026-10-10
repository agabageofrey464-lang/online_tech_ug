"""Every product photograph made the same, whatever it was taken or sent with.

A phone sends a tall 12-megapixel picture lying on its side with a note
saying which way is up; a laptop sends a small wide one saved from a website;
a screenshot comes as a PNG with a see-through background. Shown as they
arrive, one vendor's products look sharp and upright and another's look
sideways, tiny or slow.

So a photograph is put through this once, when it is uploaded: turned the
right way up, laid on a white square, brought to one size and saved in one
format. After that a product looks the same on the site however, and on
whatever, it was added.
"""

from __future__ import annotations

from io import BytesIO

from PIL import Image, ImageOps, UnidentifiedImageError

# The square every photograph ends up on. Large enough for the zoomed view on
# a product's page, small enough to load quickly on mobile data.
SIDE = 1200
# A picture smaller than this is not stretched up to SIDE, which would only
# blur it; it sits on a square of at least this size instead.
SMALLEST = 600
QUALITY = 86

# Phones now take pictures far larger than a product photo needs. Anything a
# camera produces is accepted; a file built to exhaust memory is not.
Image.MAX_IMAGE_PIXELS = 80_000_000


class NotAPhoto(ValueError):
    """The file is not a picture we can read."""


def standardise(content: bytes) -> bytes:
    """A photograph as an upright JPEG on a white square of a standard size."""
    try:
        img = Image.open(BytesIO(content))
        img.load()
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
        raise NotAPhoto("That file is not a photo we can read. Please upload a JPG, PNG or WebP picture.") from exc

    # A phone stores the picture as the sensor saw it and notes the rotation.
    img = ImageOps.exif_transpose(img)

    # See-through parts become white, as the square behind them will be.
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        white = Image.new("RGBA", img.size, (255, 255, 255, 255))
        img = Image.alpha_composite(white, img)
    img = img.convert("RGB")

    img.thumbnail((SIDE, SIDE), Image.LANCZOS)
    side = max(SMALLEST, img.width, img.height)
    square = Image.new("RGB", (side, side), (255, 255, 255))
    square.paste(img, ((side - img.width) // 2, (side - img.height) // 2))

    out = BytesIO()
    square.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    return out.getvalue()
