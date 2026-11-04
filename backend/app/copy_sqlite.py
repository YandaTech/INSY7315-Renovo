"""One-off copy of the SQLite database into the database in DATABASE_URL
(PostgreSQL in production), used for the move off SQLite:

    python -m app.copy_sqlite sqlite:////data/renovo.db

Both databases are first brought to the latest migration (a source that is
already there is only read, so it can be on a read-only mount). The copy
is one transaction, and it refuses to run if the
target already holds data, so running it twice can't duplicate rows. Row
ids are kept, so leads still point at their calls, and PostgreSQL's id
sequences are moved past the copied ids.
"""

import sys

from sqlalchemy import create_engine, func, select, text
from sqlalchemy.engine import Engine

from app.db import raw_db_url
from app.migrate import run_migrations
from app.models import call, lead, notification, user  # noqa: F401 (registers tables)
from app.models.base import Base


class TargetNotEmpty(RuntimeError):
    pass


def _counts(engine: Engine) -> dict[str, int]:
    with engine.connect() as conn:
        return {
            table.name: conn.execute(select(func.count()).select_from(table)).scalar()
            for table in Base.metadata.sorted_tables
        }


def copy_database(source_url: str, target_url: str) -> dict[str, int]:
    """Copy every table from source to target. Returns rows copied per table."""
    run_migrations(source_url, configure_logging=False)
    run_migrations(target_url, configure_logging=False)

    source = create_engine(source_url)
    target = create_engine(target_url)
    try:
        existing = {name: n for name, n in _counts(target).items() if n}
        if existing:
            raise TargetNotEmpty(f"Target already has rows: {existing}")

        copied: dict[str, int] = {}
        with source.connect() as src, target.begin() as dst:
            # sorted_tables puts parents first (call_logs before leads)
            for table in Base.metadata.sorted_tables:
                rows = [dict(r) for r in src.execute(select(table)).mappings()]
                if rows:
                    dst.execute(table.insert(), rows)
                copied[table.name] = len(rows)

            if dst.dialect.name == "postgresql":
                for table in Base.metadata.sorted_tables:
                    dst.execute(
                        text(
                            f"SELECT setval(pg_get_serial_sequence('{table.name}', 'id'),"
                            f" COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM {table.name}"
                        )
                    )

        if _counts(target) != copied:
            raise RuntimeError("Row counts differ after the copy")
        return copied
    finally:
        source.dispose()
        target.dispose()


def main(argv: list[str]) -> int:
    if len(argv) != 2 or not argv[1].startswith("sqlite"):
        print("Usage: python -m app.copy_sqlite sqlite:////path/to/renovo.db")
        return 2
    if raw_db_url.startswith("sqlite"):
        print("DATABASE_URL points at SQLite; set it to the PostgreSQL database")
        return 2
    copied = copy_database(argv[1], raw_db_url)
    for name, count in copied.items():
        print(f"{name}: {count} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
