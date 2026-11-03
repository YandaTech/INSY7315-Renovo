"""Bring the database schema up to date. Run before the API starts:

    python -m app.migrate

A database created before migrations existed (by Base.metadata.create_all)
has the baseline tables but no alembic_version table, so it is stamped at
the baseline first; otherwise Alembic would try to create the tables again.
"""

from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app.db import raw_db_url

BASELINE = "0001_baseline"
ALEMBIC_INI = Path(__file__).resolve().parents[1] / "alembic.ini"


def alembic_config(url: str | None = None, configure_logging: bool = True) -> Config:
    """Alembic config for the app's database, or for `url` if given."""
    config = Config(str(ALEMBIC_INI))
    config.set_main_option("sqlalchemy.url", url or raw_db_url)
    config.attributes["configure_logging"] = configure_logging
    return config


def run_migrations(url: str | None = None, configure_logging: bool = True) -> None:
    config = alembic_config(url, configure_logging)
    engine = create_engine(config.get_main_option("sqlalchemy.url"))
    try:
        tables = set(inspect(engine).get_table_names())
    finally:
        engine.dispose()
    if "alembic_version" not in tables and "leads" in tables:
        command.stamp(config, BASELINE)
    command.upgrade(config, "head")


if __name__ == "__main__":
    run_migrations()
