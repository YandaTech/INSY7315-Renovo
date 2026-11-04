"""Security events are written append-only with actor, time and IP."""

import json
from datetime import datetime, timedelta, timezone

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.main import app
from app.migrate import run_migrations
from app.models.audit import AuditEvent, AuditLogIsAppendOnly
from app.services.audit import record_event
from app.services.pricing_service import PricingService
from tests.conftest import bearer_for

VISITOR = ("203.0.113.9", 50000)
LEAD_BODY = {
    "name": "Thandi Mokoena",
    "contact": "+27825550147",
    "call_sid": "CA-audit",
    "job_details": {},
    "quote": 1500,
}


@pytest.fixture
def visitor(client):
    """A client with a fixed IP, standing in for the real visitor IP that
    uvicorn's proxy headers give the app in production."""
    return TestClient(app, client=VISITOR)


@pytest.fixture
def admin(visitor):
    visitor.post("/auth/register", json={"username": "boss", "password": "BossPass123"})
    res = visitor.post(
        "/auth/login", data={"username": "boss", "password": "BossPass123"}
    )
    visitor.cookies.clear()
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def events(db_session, name=None):
    db_session.expire_all()
    query = db_session.query(AuditEvent).order_by(AuditEvent.id)
    if name:
        query = query.filter(AuditEvent.event == name)
    return query.all()


def assert_stamped(event, actor_username):
    assert event.actor_username == actor_username
    assert event.ip_address == VISITOR[0]
    age = datetime.now(timezone.utc).replace(tzinfo=None) - event.created_at
    assert timedelta(0) <= age < timedelta(minutes=1)


def test_successful_and_failed_logins_are_logged(visitor, admin, db_session):
    (ok,) = events(db_session, "login_succeeded")
    assert_stamped(ok, "boss")
    assert ok.actor_id is not None

    visitor.post("/auth/login", data={"username": "boss", "password": "nope"})
    visitor.post("/auth/login", data={"username": "MyS3cretPassw0rd", "password": "x"})
    bad_password, unknown = events(db_session, "login_failed")
    assert_stamped(bad_password, "boss")
    assert bad_password.details == {"reason": "bad_password"}
    # An unknown username is not recorded: it may be a mistyped password
    assert unknown.actor_id is None and unknown.actor_username is None
    assert unknown.ip_address == VISITOR[0]
    assert unknown.details == {"reason": "unknown_user"}


def test_logout_is_logged(visitor, admin, db_session):
    visitor.post("/auth/login", data={"username": "boss", "password": "BossPass123"})
    visitor.post("/auth/logout")
    (event,) = events(db_session, "logout")
    assert_stamped(event, "boss")


def test_user_changes_are_logged(visitor, admin, db_session):
    staff = visitor.post(
        "/users/",
        json={"username": "sipho", "password": "Sipho1234"},
        headers=admin,
    ).json()
    visitor.patch(f"/users/{staff['id']}", json={"role": "admin"}, headers=admin)
    visitor.patch(f"/users/{staff['id']}", json={"is_active": False}, headers=admin)
    visitor.patch(f"/users/{staff['id']}", json={"is_active": True}, headers=admin)
    # A change to the same value is not an event
    visitor.patch(f"/users/{staff['id']}", json={"role": "admin"}, headers=admin)

    created = events(db_session, "user_created")
    assert [e.details for e in created] == [
        {"username": "boss", "role": "admin"},
        {"username": "sipho", "role": "staff"},
    ]
    assert_stamped(created[1], "boss")
    assert created[1].target_type == "user"
    assert created[1].target_id == str(staff["id"])

    (role,) = events(db_session, "user_role_changed")
    assert role.details == {"username": "sipho", "from": "staff", "to": "admin"}
    assert_stamped(role, "boss")
    (off,) = events(db_session, "user_deactivated")
    (on,) = events(db_session, "user_reactivated")
    assert_stamped(off, "boss")
    assert off.target_id == on.target_id == str(staff["id"])


def test_profile_and_password_changes_are_logged(visitor, admin, db_session):
    visitor.patch(
        "/auth/me", json={"first_name": "Lerato", "email": "l@x.co"}, headers=admin
    )
    visitor.post(
        "/auth/me/password",
        json={"current_password": "wrong", "new_password": "NewPass123"},
        headers=admin,
    )
    visitor.post(
        "/auth/me/password",
        json={"current_password": "BossPass123", "new_password": "NewPass123"},
        headers=admin,
    )

    (profile,) = events(db_session, "profile_updated")
    assert profile.details == {"fields": ["email", "first_name"]}
    assert_stamped(profile, "boss")
    (failed,) = events(db_session, "password_change_failed")
    (changed,) = events(db_session, "password_changed")
    assert_stamped(failed, "boss")
    assert_stamped(changed, "boss")


def test_lead_delete_is_logged(visitor, admin, db_session):
    lead = visitor.post("/leads/", json=LEAD_BODY, headers=admin).json()
    assert visitor.delete(f"/leads/{lead['lead_id']}", headers=admin).status_code == 204
    visitor.delete("/leads/999", headers=admin)  # not found: no event

    (event,) = events(db_session, "lead_deleted")
    assert_stamped(event, "boss")
    assert (event.target_type, event.target_id) == ("lead", str(lead["lead_id"]))


def test_pricing_edit_is_logged(visitor, admin, db_session, monkeypatch):
    async def fake_update(self, rules):
        return httpx.Response(200, json=rules)

    async def fake_rejected(self, rules):
        return httpx.Response(422, json={"detail": "bad"})

    rules = {"currency": "ZAR", "services": {"bath": {"base": 1}}}
    monkeypatch.setattr(PricingService, "update_rules", fake_update)
    assert visitor.put("/pricing/rules", json=rules, headers=admin).status_code == 200
    monkeypatch.setattr(PricingService, "update_rules", fake_rejected)
    visitor.put("/pricing/rules", json=rules, headers=admin)

    (event,) = events(db_session, "pricing_updated")
    assert_stamped(event, "boss")
    assert event.details == {"sections": ["currency", "services"]}


def test_events_never_hold_secrets_or_personal_data(
    visitor, admin, db_session, monkeypatch
):
    token = admin["Authorization"].split()[1]
    visitor.post("/auth/login", data={"username": "boss", "password": "WrongPass9"})
    visitor.post(
        "/auth/me/password",
        json={"current_password": "BossPass123", "new_password": "Brand-New-77"},
        headers=admin,
    )
    # The change ended the old session; log in again with the new password
    admin = bearer_for(visitor, "boss", "Brand-New-77")
    visitor.patch("/auth/me", json={"email": "boss@renovo.test"}, headers=admin)
    lead = visitor.post("/leads/", json=LEAD_BODY, headers=admin).json()
    visitor.delete(f"/leads/{lead['lead_id']}", headers=admin)
    staff = visitor.post(
        "/users/",
        json={"username": "sipho", "password": "Sipho1234"},
        headers=admin,
    ).json()
    visitor.post(
        f"/users/{staff['id']}/password",
        json={"new_password": "Reset-Temp-55"},
        headers=admin,
    )

    dumped = json.dumps(visitor.get("/audit-events/?limit=500", headers=admin).json())
    assert "password_reset" in dumped
    for secret in (
        "BossPass123",
        "WrongPass9",
        "Brand-New-77",
        "Sipho1234",
        "Reset-Temp-55",
        token,
        "boss@renovo.test",
        "+27825550147",
        "Thandi",
        "$2b$",  # bcrypt hash prefix
    ):
        assert secret not in dumped


def test_record_event_refuses_sensitive_detail_keys(db_session):
    for details in (
        {"password": "x"},
        {"new_password": "x"},
        {"access_token": "x"},
        {"contact": "+27"},
        {"phone_number": "+27"},
        {"transcript": "hello"},
        {"changes": {"email": "a@b.c"}},
    ):
        with pytest.raises(ValueError):
            record_event(db_session, None, "test", details=details)


def test_api_cannot_edit_or_delete_events(visitor, admin, db_session):
    (event,) = events(db_session, "login_succeeded")
    for method in ("put", "patch", "delete"):
        for url in ("/audit-events/", f"/audit-events/{event.id}"):
            res = getattr(visitor, method)(url, headers=admin)
            assert res.status_code in (404, 405), (method, url)
    assert visitor.post("/audit-events/", json={}, headers=admin).status_code == 405

    # No route anywhere in the app writes to the log except by recording
    for route in app.routes:
        if getattr(route, "path", "").startswith("/audit-events"):
            assert route.methods <= {"GET", "HEAD"}

    assert len(events(db_session)) >= 2  # nothing was removed


def test_orm_refuses_update_and_delete(admin, db_session):
    event = events(db_session)[0]
    event.event = "tampered"
    with pytest.raises(AuditLogIsAppendOnly):
        db_session.commit()
    db_session.rollback()

    db_session.delete(events(db_session)[0])
    with pytest.raises(AuditLogIsAppendOnly):
        db_session.commit()
    db_session.rollback()
    assert events(db_session)[0].event == "user_created"


def test_database_refuses_update_and_delete_after_migration(tmp_path):
    url = f"sqlite:///{tmp_path / 'audit.db'}"
    run_migrations(url, configure_logging=False)
    engine = create_engine(url)
    try:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "INSERT INTO audit_events (created_at, event)"
                    " VALUES ('2026-11-04 10:00:00', 'login_failed')"
                )
            )
        for statement in (
            "UPDATE audit_events SET event = 'x'",
            "DELETE FROM audit_events",
        ):
            with pytest.raises(Exception, match="append-only"):
                with engine.begin() as conn:
                    conn.execute(text(statement))
        with engine.connect() as conn:
            assert conn.execute(text("SELECT event FROM audit_events")).all() == [
                ("login_failed",)
            ]
    finally:
        engine.dispose()


# ── Reading the log ────────────────────────────────────────────────────────


def add_event(db_session, when, actor_id, username, name="login_succeeded"):
    db_session.add(
        AuditEvent(
            created_at=when,
            event=name,
            actor_id=actor_id,
            actor_username=username,
            ip_address="198.51.100.1",
        )
    )


def test_admin_filters_events_by_user_and_date_range(client, auth_headers, db_session):
    staff = client.post(
        "/users/",
        json={"username": "zanele", "password": "Zanele123"},
        headers=auth_headers,
    ).json()
    base = datetime(2026, 10, 1, 8, 0)
    for day in range(5):
        add_event(db_session, base + timedelta(days=day), staff["id"], "zanele")
    db_session.commit()

    def get(**params):
        res = client.get("/audit-events/", params=params, headers=auth_headers)
        assert res.status_code == 200, res.text
        return res.json()

    mine = get(actor_id=staff["id"])
    assert mine["total"] == 5
    assert {e["actor_username"] for e in mine["items"]} == {"zanele"}
    # Newest first, with an explicit UTC offset
    assert mine["items"][0]["created_at"] == "2026-10-05T08:00:00+00:00"

    # 2 to 3 October in South Africa (UTC+2): midnight SAST is 22:00 UTC
    ranged = get(
        actor_id=staff["id"],
        start="2026-10-02T00:00:00+02:00",
        end="2026-10-04T00:00:00+02:00",
    )
    assert [e["created_at"][:10] for e in ranged["items"]] == [
        "2026-10-03",
        "2026-10-02",
    ]

    # Without a user filter the admin's own events show too
    everyone = get(start="2026-10-01T00:00:00Z")
    assert everyone["total"] > 5
    assert "testadmin" in {e["actor_username"] for e in everyone["items"]}

    page = get(actor_id=staff["id"], limit=2, offset=2)
    assert page["total"] == 5 and len(page["items"]) == 2

    assert (
        client.get(
            "/audit-events/",
            params={"start": "2026-10-05T00:00:00Z", "end": "2026-10-01T00:00:00Z"},
            headers=auth_headers,
        ).status_code
        == 422
    )


def test_only_admins_read_the_log(client, staff_headers):
    assert client.get("/audit-events/").status_code == 401
    assert client.get("/audit-events/", headers=staff_headers).status_code == 403
