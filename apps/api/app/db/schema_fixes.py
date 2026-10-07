"""Targeted column widenings, because this project has no migration tool.

``Base.metadata.create_all()`` creates tables that do not exist. It never
alters one that does. So a column first declared too narrow stays too narrow
on every database that already has the table — which is every deployed one —
no matter what the model says afterwards.

Each entry below is a *widening*: a column that turned out to need more room
than it was originally given. In Postgres, widening a ``varchar(n)`` to
``text`` is a catalogue-only change — no table rewrite and no lock worth
worrying about — and repeating it is harmless, so this runs on every boot
rather than being tracked as a migration. SQLite never enforced the length in
the first place, so there is nothing to do there.

Never put a narrowing, a drop or a rename in here. Those lose data and belong
in a reviewed migration, not in a startup hook.
"""

from __future__ import annotations

import logging

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

# (table, column, target type)
WIDENINGS: list[tuple[str, str, str]] = [
    # A freelancer listing their skills wrote 952 characters into varchar(400)
    # and got back a 500 they could do nothing about — the form just said "try
    # again", which was never going to work. A skills list is prose and has no
    # sensible maximum, so it becomes text.
    ("freelancers", "skills", "TEXT"),
]


# Columns added to a table after it was first created. create_all() will not
# add them to a database that already has the table, so each is added here if
# it is missing. Additive only, and every one has a default or allows NULL, so
# existing rows stay valid and running it again does nothing.
#   (table, column, column definition)
ADDITIONS: list[tuple[str, str, str]] = [
    ("vendor_products", "brand", "VARCHAR(80) NOT NULL DEFAULT ''"),
    ("vendor_products", "condition", "VARCHAR(30) NOT NULL DEFAULT 'Brand New'"),
    ("vendor_products", "old_price_ugx", "INTEGER"),
    ("vendor_products", "specs", "JSON"),
]


def apply_additions(engine: Engine) -> int:
    """Add any column in ADDITIONS that a table is still missing.

    Returns how many were added. Never raises, for the same reason as the
    widenings: a refusal here must not stop the API from starting.
    """
    added = 0
    try:
        inspector = inspect(engine)
        tables = set(inspector.get_table_names())
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not inspect the schema (%s); skipping additions.", exc)
        return 0
    for table, column, definition in ADDITIONS:
        if table not in tables:
            continue  # create_all() will build it complete
        try:
            if column in {c["name"] for c in inspector.get_columns(table)}:
                continue
            with engine.begin() as conn:
                conn.execute(text(f'ALTER TABLE {table} ADD COLUMN "{column}" {definition}'))
            added += 1
            logger.info("Added column %s.%s", table, column)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not add %s.%s (%s).", table, column, exc)
    return added


def apply_widenings(engine: Engine) -> int:
    """Widen any column that is still narrower than the model expects.

    Returns the number of columns actually altered. Never raises: a database
    that refuses one of these must not stop the API from starting.
    """
    if engine.dialect.name == "sqlite":
        return 0  # SQLite ignores varchar lengths, so nothing is ever too narrow

    changed = 0
    try:
        inspector = inspect(engine)
        tables = set(inspector.get_table_names())
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not inspect the schema (%s); skipping widenings.", exc)
        return 0

    for table, column, target in WIDENINGS:
        if table not in tables:
            continue
        try:
            cols = {c["name"]: c for c in inspector.get_columns(table)}
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not read %s columns (%s).", table, exc)
            continue
        if column not in cols:
            continue

        current = str(cols[column]["type"]).upper()
        if current.startswith(target.upper()):
            continue  # already wide enough

        try:
            with engine.begin() as conn:
                conn.execute(
                    text(f'ALTER TABLE "{table}" ALTER COLUMN "{column}" TYPE {target}')
                )
            logger.info("Widened %s.%s from %s to %s.", table, column, current, target)
            changed += 1
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not widen %s.%s (%s).", table, column, exc)

    return changed
