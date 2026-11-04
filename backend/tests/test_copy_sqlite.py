import os
import uuid
from datetime import datetime

import pytest
from sqlalchemy import create_engine, select, text

from app.copy_sqlite import TargetNotEmpty, copy_database
from app.migrate import run_migrations
from app.models.base import Base
from tests.test_migrations import schema_differences

# PostgreSQL tests run when TEST_POSTGRES_URL points at a server where the
# test may create and drop databases (CI starts one; see ci-cd.yml).
POSTGRES_URL = os.getenv("TEST_POSTGRES_URL")
needs_postgres = pytest.mark.skipif(
    not POSTGRES_URL, reason="TEST_POSTGRES_URL not set"
)


def seed(url):
    run_migrations(url, configure_logging=False)
    engine = create_engine(url)
    with engine.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO admin_users (id, username, hashed_password, role,"
                " is_active) VALUES (1, 'admin', 'hash', 'admin', true)"
            )
        )
        conn.execute(
            text(
                "INSERT INTO call_logs (id, call_sid, duration, transcript, outcome,"
                " created_at) VALUES (5, 'CA5', 60, 'hello', 'quoted', :at)"
            ),
            {"at": datetime(2026, 11, 3, 19, 49)},
        )
        conn.execute(
            text(
                "INSERT INTO leads (id, name, contact, job_details, quote, status,"
                " created_at, call_id, job_type, quantity) VALUES (9, 'Thandi',"
                " '+27825550147', '{}', 4250, 'new', :at, 5, 'bath_reenamel', 2)"
            ),
            {"at": datetime(2026, 11, 3, 19, 49)},
        )
        conn.execute(
            text(
                "INSERT INTO notifications (id, type, recipient, message, status,"
                " created_at) VALUES (3, 'sms', '+27825550147', 'Quote', 'sent', :at)"
            ),
            {"at": datetime(2026, 11, 3, 19, 50)},
        )
    engine.dispose()


def check_copy(target_url):
    leads = Base.metadata.tables["leads"]
    calls = Base.metadata.tables["call_logs"]
    engine = create_engine(target_url)
    with engine.connect() as conn:
        lead = conn.execute(
            select(
                leads.c.name,
                leads.c.quote,
                leads.c.job_type,
                leads.c.quantity,
                leads.c.created_at,
                calls.c.call_sid,
            )
            .join(calls, calls.c.id == leads.c.call_id)
            .where(leads.c.id == 9)
        ).one()
    engine.dispose()
    assert tuple(lead) == (
        "Thandi",
        4250,
        "bath_reenamel",
        2,
        datetime(2026, 11, 3, 19, 49),
        "CA5",
    )
    assert schema_differences(target_url) == []


@pytest.fixture
def sqlite_source(tmp_path):
    url = f"sqlite:///{tmp_path / 'source.db'}"
    seed(url)
    return url


def test_copies_every_table_keeping_ids(sqlite_source, tmp_path):
    target = f"sqlite:///{tmp_path / 'target.db'}"

    copied = copy_database(sqlite_source, target)

    assert copied == {
        "admin_users": 1,
        "audit_events": 0,
        "call_logs": 1,
        "leads": 1,
        "notifications": 1,
    }
    check_copy(target)


def test_refuses_a_target_that_already_has_data(sqlite_source, tmp_path):
    target = f"sqlite:///{tmp_path / 'target.db'}"
    copy_database(sqlite_source, target)

    with pytest.raises(TargetNotEmpty):
        copy_database(sqlite_source, target)


@pytest.fixture
def postgres_url():
    """A fresh, empty PostgreSQL database, dropped after the test."""
    name = f"renovo_test_{uuid.uuid4().hex[:8]}"
    admin = create_engine(POSTGRES_URL, isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        conn.execute(text(f'CREATE DATABASE "{name}"'))
    url = POSTGRES_URL.rsplit("/", 1)[0] + f"/{name}"
    yield url
    with admin.connect() as conn:
        conn.execute(text(f'DROP DATABASE "{name}" WITH (FORCE)'))
    admin.dispose()


@needs_postgres
def test_migrations_match_the_models_on_postgres(postgres_url):
    run_migrations(postgres_url, configure_logging=False)
    assert schema_differences(postgres_url) == []


@needs_postgres
def test_copy_into_postgres_moves_id_sequences_past_copied_rows(
    sqlite_source, postgres_url
):
    copy_database(sqlite_source, postgres_url)
    check_copy(postgres_url)

    # A new lead must not collide with the copied id 9
    engine = create_engine(postgres_url)
    with engine.begin() as conn:
        new_id = conn.execute(
            text(
                "INSERT INTO leads (name, contact, status) VALUES ('New', '0821', 'new')"
                " RETURNING id"
            )
        ).scalar()
    engine.dispose()
    assert new_id == 10
