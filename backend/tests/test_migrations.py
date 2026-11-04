import json
import os

import pytest
from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy import create_engine, inspect, text

from app.migrate import alembic_config, run_migrations
from app.models.base import Base

# The schema the app built with create_all before migrations, as on the
# live server (sqlite3 .schema, 3 Nov 2026), plus a column the old
# add_missing_columns start-up code could have added.
LEGACY_SCHEMA = [
    """CREATE TABLE admin_users (id INTEGER NOT NULL, username VARCHAR(50) NOT NULL,
       hashed_password VARCHAR(255) NOT NULL, first_name VARCHAR(100),
       last_name VARCHAR(100), email VARCHAR(255), PRIMARY KEY (id))""",
    "CREATE INDEX ix_admin_users_id ON admin_users (id)",
    "CREATE UNIQUE INDEX ix_admin_users_username ON admin_users (username)",
    """CREATE TABLE call_logs (id INTEGER NOT NULL, call_sid VARCHAR(100) NOT NULL,
       duration INTEGER, transcript TEXT, outcome VARCHAR(50), created_at DATETIME,
       PRIMARY KEY (id))""",
    "CREATE INDEX ix_call_logs_id ON call_logs (id)",
    "CREATE UNIQUE INDEX ix_call_logs_call_sid ON call_logs (call_sid)",
    """CREATE TABLE leads (id INTEGER NOT NULL, name VARCHAR(100) NOT NULL,
       contact VARCHAR(50) NOT NULL, job_details TEXT, quote FLOAT,
       status VARCHAR(50), created_at DATETIME, call_id INTEGER,
       job_type VARCHAR, scope VARCHAR,
       PRIMARY KEY (id), FOREIGN KEY(call_id) REFERENCES call_logs (id))""",
    "CREATE INDEX ix_leads_id ON leads (id)",
    """CREATE TABLE notifications (id INTEGER NOT NULL, type VARCHAR(20) NOT NULL,
       recipient VARCHAR(255) NOT NULL, subject VARCHAR(255), message TEXT NOT NULL,
       status VARCHAR(50) NOT NULL, provider_id VARCHAR(255),
       created_at DATETIME NOT NULL, PRIMARY KEY (id))""",
    "CREATE INDEX ix_notifications_id ON notifications (id)",
    "CREATE INDEX ix_notifications_type ON notifications (type)",
    "CREATE INDEX ix_notifications_status ON notifications (status)",
]


@pytest.fixture
def db_url(tmp_path):
    return f"sqlite:///{tmp_path / 'renovo.db'}"


def schema_differences(url):
    """What Alembic would still change to make the database match the models."""
    engine = create_engine(url)
    try:
        with engine.connect() as conn:
            return compare_metadata(MigrationContext.configure(conn), Base.metadata)
    finally:
        engine.dispose()


def test_migrations_build_an_empty_database_that_matches_the_models(db_url):
    run_migrations(db_url, configure_logging=False)

    engine = create_engine(db_url)
    tables = set(inspect(engine).get_table_names())
    engine.dispose()
    assert {"admin_users", "call_logs", "leads", "notifications"} <= tables
    assert schema_differences(db_url) == []


def test_existing_database_is_stamped_and_its_job_details_copied_to_columns(db_url):
    engine = create_engine(db_url)
    with engine.begin() as conn:
        for statement in LEGACY_SCHEMA:
            conn.execute(text(statement))
        conn.execute(
            text(
                "INSERT INTO leads (id, name, contact, job_details, quote, status)"
                " VALUES (1, 'Thandi', '+27825550147', :details, 4250, 'new'),"
                " (2, 'Manual', '0215550000', 'not json', NULL, 'new')"
            ),
            {
                "details": json.dumps(
                    {
                        "job_type": "bath_reenamel",
                        "quantity": 2,
                        "material": "cast_iron",
                        "damage_level": "heavy",
                        "travel_zone": "northern_suburbs",
                        "suburb": "Bellville",
                    }
                )
            },
        )
    engine.dispose()

    run_migrations(db_url, configure_logging=False)

    assert schema_differences(db_url) == []
    engine = create_engine(db_url)
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                "SELECT id, name, quote, job_type, quantity, material, damage_level,"
                " travel_zone, suburb FROM leads ORDER BY id"
            )
        ).all()
        columns = {c["name"] for c in inspect(conn).get_columns("leads")}
    engine.dispose()

    assert rows[0] == (
        1,
        "Thandi",
        4250,
        "bath_reenamel",
        2,
        "cast_iron",
        "heavy",
        "northern_suburbs",
        "Bellville",
    )
    # A lead whose job_details isn't JSON keeps it and gets empty columns
    assert rows[1][3:] == (None,) * 6
    assert "scope" not in columns


def test_running_migrations_twice_changes_nothing(db_url):
    run_migrations(db_url, configure_logging=False)
    run_migrations(db_url, configure_logging=False)
    assert schema_differences(db_url) == []


def test_existing_accounts_become_active_admins(db_url):
    engine = create_engine(db_url)
    with engine.begin() as conn:
        for statement in LEGACY_SCHEMA:
            conn.execute(text(statement))
        conn.execute(
            text(
                "INSERT INTO admin_users (id, username, hashed_password)"
                " VALUES (1, 'owner', 'x'), (2, 'helper', 'y')"
            )
        )
    engine.dispose()

    run_migrations(db_url, configure_logging=False)

    assert schema_differences(db_url) == []
    engine = create_engine(db_url)
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    "SELECT username, role, is_active, password_changed_at"
                    " FROM admin_users ORDER BY id"
                )
            ).all()
        # password_changed_at stays empty, so sessions open during the
        # upgrade keep working
        assert [tuple(r) for r in rows] == [
            ("owner", "admin", 1, None),
            ("helper", "admin", 1, None),
        ]

        # A new row must name its role (so it is never an admin by
        # accident), and only the two known roles are allowed
        bad_inserts = [
            "INSERT INTO admin_users (username, hashed_password) VALUES ('a', 'z')",
            "INSERT INTO admin_users (username, hashed_password, role)"
            " VALUES ('b', 'z', 'owner')",
        ]
        for statement in bad_inserts:
            with pytest.raises(Exception):
                with engine.begin() as conn:
                    conn.execute(text(statement))
        with engine.begin() as conn:
            conn.execute(
                text(
                    "INSERT INTO admin_users (username, hashed_password, role)"
                    " VALUES ('c', 'z', 'staff')"
                )
            )
            active = conn.execute(
                text("SELECT is_active FROM admin_users WHERE username = 'c'")
            ).scalar()
        assert active == 1
    finally:
        engine.dispose()


def test_migrations_downgrade_to_an_empty_database(db_url):
    run_migrations(db_url, configure_logging=False)
    command.downgrade(alembic_config(db_url, configure_logging=False), "base")

    engine = create_engine(db_url)
    tables = set(inspect(engine).get_table_names())
    engine.dispose()
    assert tables <= {"alembic_version"}


# Production is moving to PostgreSQL. Point this at an empty throwaway
# database to check every migration there too, e.g.
#   TEST_POSTGRES_URL=postgresql+psycopg2://postgres:test@localhost:55432/renovo
POSTGRES_URL = os.environ.get("TEST_POSTGRES_URL")


@pytest.mark.skipif(not POSTGRES_URL, reason="TEST_POSTGRES_URL not set")
def test_migrations_up_and_down_on_postgres():
    config = alembic_config(POSTGRES_URL, configure_logging=False)
    command.downgrade(config, "base")
    run_migrations(POSTGRES_URL, configure_logging=False)
    try:
        assert schema_differences(POSTGRES_URL) == []
        run_migrations(POSTGRES_URL, configure_logging=False)

        # The audit log refuses edits and deletes in the database itself
        engine = create_engine(POSTGRES_URL)
        try:
            with engine.begin() as conn:
                conn.execute(
                    text(
                        "INSERT INTO audit_events (created_at, event)"
                        " VALUES (now(), 'login_failed')"
                    )
                )
            for statement in (
                "UPDATE audit_events SET event = 'x'",
                "DELETE FROM audit_events",
            ):
                with pytest.raises(Exception, match="append-only"):
                    with engine.begin() as conn:
                        conn.execute(text(statement))
        finally:
            engine.dispose()
    finally:
        command.downgrade(config, "base")
    engine = create_engine(POSTGRES_URL)
    tables = set(inspect(engine).get_table_names())
    engine.dispose()
    assert tables <= {"alembic_version"}
