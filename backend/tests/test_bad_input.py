"""Malformed input gets a clean 4xx, never a 500 (security finding F15).

PostgreSQL refuses NUL characters in text and integers beyond 32 bits,
where SQLite accepts them, so every test runs on SQLite and, when
TEST_POSTGRES_URL is set, again on PostgreSQL. A few cases only fail on
PostgreSQL; those tests are marked needs_postgres.
"""

import logging

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, text
from sqlalchemy.exc import DataError, IntegrityError
from sqlalchemy.orm import Session, sessionmaker

import app.db as db_module
from app.db import get_db
from app.main import app
from app.migrate import run_migrations
from app.models.user import AdminUser
from app.repositories.notification_repository import NotificationRepository
from app.services.pricing_service import PricingService
from tests.test_copy_sqlite import needs_postgres, postgres_url  # noqa: F401

TOO_BIG = 2**31  # one past the largest PostgreSQL INTEGER
ZAP_LEAD_ID = 8661681940182828318  # the ID from the ZAP scan


@pytest.fixture(params=["sqlite", pytest.param("postgres", marks=needs_postgres)])
def backend(request, db_session, monkeypatch):
    """Which database the app talks to. On PostgreSQL the app uses the real
    get_db() (a new session per request) on a freshly migrated database."""
    if request.param == "sqlite":
        yield "sqlite"
        return
    url = request.getfixturevalue("postgres_url")
    run_migrations(url, configure_logging=False)
    engine = create_engine(url)
    monkeypatch.setattr(
        db_module, "SessionLocal", sessionmaker(autoflush=False, bind=engine)
    )
    app.dependency_overrides.pop(get_db, None)
    yield "postgres"
    engine.dispose()


@pytest.fixture
def api(backend):
    return TestClient(app)


def login(api, username, password):
    res = api.post("/auth/login", data={"username": username, "password": password})
    assert res.status_code == 200, res.text
    api.cookies.clear()
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture
def admin(api):
    res = api.post("/auth/register", json={"username": "boss", "password": "Pass1234"})
    assert res.status_code == 201, res.text
    return login(api, "boss", "Pass1234")


@pytest.fixture
def no_pricing(monkeypatch):
    async def no_quote(self, factors):
        return {"status": "ok", "estimated_quote": 100.0}

    monkeypatch.setattr(PricingService, "get_quote_from_mcp", no_quote)


def assert_422(res):
    assert res.status_code == 422, res.text


# ---------------------------------------------------------------- integers


@pytest.mark.parametrize("lead_id", [TOO_BIG, -(2**31) - 1, ZAP_LEAD_ID, 10**30])
def test_lead_id_beyond_32_bits_is_rejected(api, admin, lead_id):
    assert_422(api.get(f"/leads/{lead_id}", headers=admin))
    assert_422(api.patch(f"/leads/{lead_id}/status?status=closed", headers=admin))
    assert_422(api.delete(f"/leads/{lead_id}", headers=admin))


def test_lead_ids_inside_32_bits_still_get_404(api, admin):
    for lead_id in (2**31 - 1, 0, -1):
        assert api.get(f"/leads/{lead_id}", headers=admin).status_code == 404


@pytest.mark.parametrize(
    "path",
    [
        f"/calls/?skip={TOO_BIG}",
        f"/calls/?limit={10**30}",
        "/calls/?skip=-1",
        f"/notifications/?skip={10**30}",
        f"/notifications/?limit={TOO_BIG}",
        "/notifications/?limit=-1",
        f"/audit-events/?actor_id={ZAP_LEAD_ID}",
        f"/audit-events/?offset={TOO_BIG}",
    ],
)
def test_paging_and_filter_numbers_beyond_32_bits_are_rejected(api, admin, path):
    assert_422(api.get(path, headers=admin))


def test_paging_inside_the_range_still_works(api, admin):
    for path in ("/calls/?skip=0&limit=5", "/notifications/?skip=2&limit=0"):
        res = api.get(path, headers=admin)
        assert res.status_code == 200 and res.json() == []
    res = api.get(f"/audit-events/?actor_id={2**31 - 1}", headers=admin)
    assert res.status_code == 200 and res.json()["total"] == 0


def test_call_duration_beyond_32_bits_is_rejected(api, admin):
    body = {"call_sid": "CA1", "duration": TOO_BIG}
    assert_422(api.post("/calls/", json=body, headers=admin))


def test_huge_job_quantity_is_dropped_not_stored(api, admin, no_pricing):
    """quantity comes from the free-form job_details, so a value that does
    not fit the column is left out like any other unusable quantity."""
    res = api.post(
        "/leads/",
        json={
            "name": "Thandi",
            "contact": "0821234567",
            "call_sid": "CA1",
            "job_details": {"job_type": "bath_reenamel", "quantity": 10**20},
        },
        headers=admin,
    )
    assert res.status_code == 200, res.text
    assert res.json()["quantity"] is None
    assert res.json()["job_type"] == "bath_reenamel"


# ---------------------------------------------------------------- NUL bytes


LEAD = {"name": "Thandi", "contact": "0821234567", "call_sid": "CA1"}


@pytest.mark.parametrize(
    "body",
    [
        {**LEAD, "name": "Tha\x00ndi"},
        {**LEAD, "contact": "082\x00"},
        {**LEAD, "call_sid": "CA\x001"},
        {**LEAD, "job_details": {"suburb": "Sea\x00 Point"}},
        {**LEAD, "job_details": {"notes": ["fine", {"deep": "\x00"}]}},
        {**LEAD, "job_details": {"key\x00": "value"}},
    ],
)
def test_nul_in_a_lead_is_rejected(api, admin, no_pricing, body):
    assert_422(api.post("/leads/", json=body, headers=admin))
    assert api.get("/leads/", headers=admin).json() == []


@pytest.mark.parametrize("field", ["call_sid", "transcript", "outcome"])
def test_nul_in_a_call_is_rejected(api, admin, field):
    body = {"call_sid": "CA1", "transcript": "hello", "outcome": "quoted"}
    body[field] += "\x00"
    assert_422(api.post("/calls/", json=body, headers=admin))


def test_nul_in_a_call_sid_path_is_rejected(api, admin):
    assert_422(api.get("/calls/CA%001", headers=admin))
    assert api.get("/calls/CA1", headers=admin).status_code == 404


@pytest.mark.parametrize("field", ["recipient", "message", "subject", "provider_id"])
def test_nul_in_a_notification_is_rejected(api, admin, field):
    body = {
        "type": "sms",
        "recipient": "+27821234567",
        "message": "Your quote",
        "subject": "Quote",
        "provider_id": "SM1",
    }
    body[field] += "\x00"
    assert_422(api.post("/notifications/", json=body, headers=admin))


def test_nul_in_an_audit_filter_is_rejected(api, admin):
    assert_422(api.get("/audit-events/?event=login%00", headers=admin))


def test_nul_in_a_username_is_rejected_everywhere(api, admin):
    bad = {"username": "new\x00user", "password": "Pass1234"}
    assert_422(api.post("/auth/register", json=bad, headers=admin))
    assert_422(api.post("/users/", json={**bad, "role": "staff"}, headers=admin))
    res = api.post("/auth/login", data={"username": "boss\x00", "password": "x"})
    assert_422(res)
    names = [u["username"] for u in api.get("/users/", headers=admin).json()]
    assert names == ["boss"]


@pytest.mark.parametrize("field", ["first_name", "last_name"])
def test_nul_in_the_profile_is_rejected(api, admin, field):
    assert_422(api.patch("/auth/me", json={field: "A\x00"}, headers=admin))


def test_nul_in_a_new_password_is_rejected(api, admin):
    body = {"current_password": "Pass1234", "new_password": "Pass\x001234"}
    assert_422(api.post("/auth/me/password", json=body, headers=admin))


# ---------------------------------------------------------- username races


@pytest.fixture
def username_taken_mid_request():
    """Make the username "racer" appear in the database after create_user()
    has checked it is free but before its insert, as when two requests for
    the same name arrive together."""

    def insert_rival(session, flush_context, instances):
        if any(
            isinstance(obj, AdminUser) and obj.username == "racer"
            for obj in session.new
        ):
            session.connection().execute(
                text(
                    "INSERT INTO admin_users (username, hashed_password, role,"
                    " is_active) VALUES ('racer', 'hash', 'staff', true)"
                )
            )

    event.listen(Session, "before_flush", insert_rival)
    yield
    event.remove(Session, "before_flush", insert_rival)


def test_username_race_on_add_user_is_409(api, admin, username_taken_mid_request):
    body = {"username": "racer", "password": "Pass1234", "role": "staff"}
    res = api.post("/users/", json=body, headers=admin)
    assert res.status_code == 409, res.text
    assert res.json() == {"detail": "Username already registered"}
    # The failed insert was rolled back, rival included, and the API carries on
    names = [u["username"] for u in api.get("/users/", headers=admin).json()]
    assert names == ["boss"]


def test_username_race_on_register_is_409(api, admin, username_taken_mid_request):
    body = {"username": "racer", "password": "Pass1234"}
    res = api.post("/auth/register", json=body, headers=admin)
    assert res.status_code == 409, res.text
    assert res.json() == {"detail": "Username already registered"}


def test_taken_username_still_gets_400(api, admin):
    body = {"username": "boss", "password": "Pass1234", "role": "staff"}
    res = api.post("/users/", json=body, headers=admin)
    assert res.status_code == 400
    assert res.json() == {"detail": "Username already registered"}


# ------------------------------------------------------------- safety net


SECRET_SQL = "INSERT INTO notifications (recipient) VALUES (%(recipient)s)"
SECRET_PARAMS = {"recipient": "+27820000000"}


@pytest.mark.parametrize(
    "error, status, detail",
    [
        (DataError, 422, "A value in the request is not valid"),
        (IntegrityError, 409, "The request conflicts with existing data"),
    ],
)
def test_database_errors_become_a_generic_4xx(
    api, admin, monkeypatch, caplog, error, status, detail
):
    def fail(self, **kwargs):
        raise error(SECRET_SQL, SECRET_PARAMS, Exception("db said no"))

    monkeypatch.setattr(NotificationRepository, "create_notification", fail)
    body = {"type": "sms", "recipient": "+27820000000", "message": "Hi"}
    with caplog.at_level(logging.WARNING, logger="app.db_errors"):
        res = api.post("/notifications/", json=body, headers=admin)

    assert res.status_code == status
    assert res.json() == {"detail": detail}
    # Neither the reply nor the log shows the SQL, its values or the message
    logged = caplog.text
    for secret in ("INSERT", "+27820000000", "db said no"):
        assert secret not in res.text and secret not in logged
    assert [r.levelname for r in caplog.records] == ["WARNING"]
    # The session was rolled back and the next request works
    assert api.get("/notifications/", headers=admin).status_code == 200


@pytest.mark.parametrize("user_id", [TOO_BIG, ZAP_LEAD_ID])
def test_user_id_beyond_32_bits_is_rejected(api, admin, user_id):
    assert_422(api.patch(f"/users/{user_id}", json={"role": "staff"}, headers=admin))
    body = {"new_password": "NewPass1234"}
    assert_422(api.post(f"/users/{user_id}/password", json=body, headers=admin))


@needs_postgres
@pytest.mark.parametrize("backend", ["postgres"], indirect=True)
def test_a_real_postgres_data_error_is_caught_by_the_safety_net(
    api, admin, monkeypatch, caplog
):
    """With the username check switched off, PostgreSQL itself refuses the
    NUL. The global handler turns its DataError into a 422 and a warning."""
    import app.routes.auth as auth_route

    monkeypatch.setattr(auth_route, "contains_nul", lambda value: False)
    body = {"username": "bad\x00name", "password": "Pass1234", "role": "staff"}
    with caplog.at_level(logging.WARNING, logger="app.db_errors"):
        res = api.post("/users/", json=body, headers=admin)
    assert res.status_code == 422, res.text
    assert res.json() == {"detail": "A value in the request is not valid"}
    assert "NUL" not in caplog.text and "bad" not in caplog.text
    assert [r.levelname for r in caplog.records] == ["WARNING"]
    # The session was rolled back and the API carries on
    names = [u["username"] for u in api.get("/users/", headers=admin).json()]
    assert names == ["boss"]


def test_a_nul_in_pricing_rule_keys_is_stored_in_the_audit_log(api, admin, monkeypatch):
    """Pricing rule keys go into the audit log's JSON details. The JSON is
    escaped (\\u0000) and the column is json, not jsonb, so PostgreSQL
    stores it too."""

    class Saved:
        status_code = 200
        is_error = False

        def json(self):
            return {"status": "ok"}

    async def update_rules(self, rules):
        return Saved()

    monkeypatch.setattr(PricingService, "update_rules", update_rules)
    res = api.put("/pricing/rules", json={"bad\x00key": 1}, headers=admin)
    assert res.status_code == 200, res.text
