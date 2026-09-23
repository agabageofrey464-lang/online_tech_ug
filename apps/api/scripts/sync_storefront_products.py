"""Copy the storefront catalogue into the API database.

The shop front renders from apps/web/src/lib/data.ts, but an order is priced
and validated against the API's own products table. When a product exists in
one and not the other the customer gets "Product not found" and simply cannot
buy it — a lost sale that leaves no trace except a 400 in the log.

This reads data.ts directly (it is the source of truth for what is on sale)
and upserts every entry, so the two can't drift apart. Prices always come from
data.ts; stock levels already recorded in the database are left alone.

Run from apps/api:  .venv/bin/python scripts/sync_storefront_products.py
Add --dry-run to see what would change without writing.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select  # noqa: E402

from app.db.session import SessionLocal  # noqa: E402
from app.models.product import Product  # noqa: E402

DATA_TS = Path(__file__).resolve().parents[3] / "web" / "src" / "lib" / "data.ts"


def data_path() -> Path:
    """Where data.ts lives — the repo layout locally, or --data on a server
    where only the API is deployed."""
    for i, a in enumerate(sys.argv):
        if a == "--data" and i + 1 < len(sys.argv):
            return Path(sys.argv[i + 1])
    return DATA_TS


def read_products(text: str) -> list[dict]:
    """Pull the product objects out of data.ts.

    Entries are a mix of one-liners and multi-line objects, and `id:` can
    appear anywhere inside one, so brace-match each object rather than
    guessing at line boundaries.
    """
    decl = "export const products: Product[] = ["
    start = text.index(decl) + len(decl) - 1

    out: list[dict] = []
    i = start + 1
    n = len(text)

    while i < n:
        ch = text[i]
        if ch == "]":
            break
        if ch != "{":
            i += 1
            continue

        depth, j = 0, i
        in_str: str | None = None
        while j < n:
            c = text[j]
            if in_str:
                if c == "\\":
                    j += 2
                    continue
                if c == in_str:
                    in_str = None
            elif c in "\"'`":
                in_str = c
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    j += 1
                    break
            j += 1

        obj = text[i:j]
        parsed = parse_object(obj)
        if parsed:
            out.append(parsed)
        i = j

    return out


def _field(obj: str, key: str) -> str | None:
    # A name that itself contains a double quote — 'Apple MacBook Pro 14" M3' —
    # is written with single quotes in data.ts, so accept either style.
    m = re.search(key + r':\s*"((?:[^"\\]|\\.)*)"', obj)
    if not m:
        m = re.search(key + r":\s*'((?:[^'\\]|\\.)*)'", obj)
    if not m:
        return None
    return m.group(1).replace('\\"', '"').replace("\\'", "'").replace("\\\\", "\\")


def _num(obj: str, key: str) -> int | None:
    m = re.search(key + r":\s*([0-9.]+)", obj)
    return int(float(m.group(1))) if m else None


def _float(obj: str, key: str) -> float | None:
    m = re.search(key + r":\s*([0-9.]+)", obj)
    return float(m.group(1)) if m else None


def parse_object(obj: str) -> dict | None:
    slug = _field(obj, "id")
    name = _field(obj, "name")
    category = _field(obj, "category")
    price = _num(obj, "price")
    if not (slug and name and category and price):
        return None

    specs_m = re.search(r"specs:\s*\[(.*?)\]", obj, re.S)
    bullets: list[str] = []
    if specs_m:
        bullets = [
            s.replace('\\"', '"').replace("\\\\", "\\")
            for s in re.findall(r'"((?:[^"\\]|\\.)*)"', specs_m.group(1))
        ]

    # details{} maps straight onto the API's structured specs column.
    details = None
    dm = re.search(r"details:\s*\{", obj)
    if dm:
        d: dict[str, str] = {}
        for key in (
            "type", "processor", "generation", "ram", "storage", "graphics",
            "display", "os", "battery", "ports", "build", "purpose",
        ):
            v = _field(obj[dm.start():], key)
            if v:
                d[key] = v
        if d:
            details = d

    image = _field(obj, "image") or f"/products/{slug}.webp"

    return {
        "slug": slug,
        "name": name,
        "category": category,
        "brand": _field(obj, "brand") or "",
        "condition": _field(obj, "condition") or "Brand New",
        "description": ", ".join(bullets),
        "price_ugx": price,
        "old_price_ugx": _num(obj, "oldPrice"),
        "rating": _float(obj, "rating") or 0.0,
        "image_url": image,
        "specs": details,
    }


def main() -> int:
    dry = "--dry-run" in sys.argv
    text = data_path().read_text(encoding="utf-8")
    rows = read_products(text)
    print(f"read {len(rows)} products from data.ts")

    db = SessionLocal()
    created = updated = unchanged = 0
    try:
        for r in rows:
            existing = db.execute(
                select(Product).where(Product.slug == r["slug"])
            ).scalar_one_or_none()

            if existing is None:
                if not dry:
                    db.add(
                        Product(
                            slug=r["slug"],
                            name=r["name"],
                            category=r["category"],
                            brand=r["brand"],
                            condition=r["condition"],
                            description=r["description"],
                            price_ugx=r["price_ugx"],
                            old_price_ugx=r["old_price_ugx"],
                            rating=r["rating"],
                            in_stock=True,
                            stock_qty=0,
                            image_url=r["image_url"],
                            specs=r["specs"],
                        )
                    )
                created += 1
                print("  + " + r["slug"])
                continue

            changes = []
            for col in ("name", "category", "brand", "condition", "description",
                        "price_ugx", "old_price_ugx", "image_url"):
                new = r[col]
                old = getattr(existing, col)
                if col.endswith("_ugx"):
                    old = int(old) if old is not None else None
                if old != new:
                    changes.append(col)
                    if not dry:
                        setattr(existing, col, new)
            if r["specs"] and not existing.specs:
                changes.append("specs")
                if not dry:
                    existing.specs = r["specs"]

            if changes:
                updated += 1
                print("  ~ %s (%s)" % (r["slug"], ", ".join(changes)))
            else:
                unchanged += 1

        if not dry:
            db.commit()
    finally:
        db.close()

    print(json.dumps({"created": created, "updated": updated, "unchanged": unchanged,
                      "dry_run": dry}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
