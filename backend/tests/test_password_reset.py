"""Admin password reset, sessions that end when a password changes (F11),
and the 8-character minimum for new passwords (F13)."""

from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.audit import AuditEvent
from app.models.user import AdminUser
from tests.conftest import bearer_for

VISITOR = ("203.0.113.9", 50000)


def staff_id(db_session, username="teststaff"):
    db_session.expire_all()
    return db_session.query(AdminUser).filter_by(username=username).one().id


def reset(client, user_id, password, headers):
    return client.post(
        f"/users/{user_id}/password", json={"new_password": password}, headers=headers
    )


# ── Admin reset ─────────────────────────────────────────────────────────────


def test_admin_resets_a_staff_password(client, auth_headers, staff_headers, db_session):
    res = reset(client, staff_id(db_session), "Temp-Pass-42", auth_headers)
    assert res.status_code == 204, res.text
    assert res.content == b""

    old = client.post(
        "/auth/login", data={"username": "teststaff", "password": "StaffPass123"}
    )
    assert old.status_code == 401
    bearer_for(client, "teststaff", "Temp-Pass-42")


def test_admin_can_reset_another_admin(client, auth_headers, db_session):
    client.post(
        "/users/",
        json={"username": "second", "password": "Second123", "role": "admin"},
        headers=auth_headers,
    )
    res = reset(client, staff_id(db_session, "second"), "Fresh-777", auth_headers)
    assert res.status_code == 204
    bearer_for(client, "second", "Fresh-777")


def test_staff_cannot_reset_passwords(client, auth_headers, staff_headers, db_session):
    admin_id = staff_id(db_session, "testadmin")
    res = reset(client, admin_id, "Hijacked-1", staff_headers)
    assert res.status_code == 403
    # Not even their own: staff change theirs on the Profile page
    res = reset(client, staff_id(db_session), "Hijacked-1", staff_headers)
    assert res.status_code == 403
    bearer_for(client, "testadmin", "TestPassword123!")


def test_reset_needs_a_login(client, auth_headers, db_session):
    res = reset(client, staff_id(db_session, "testadmin"), "Whatever1", {})
    assert res.status_code == 401


def test_reset_of_a_missing_user_is_404(client, auth_headers):
    res = reset(client, 9999, "Temp-Pass-42", auth_headers)
    assert res.status_code == 404
    assert res.json()["detail"] == "User not found"


def test_admin_cannot_reset_their_own_password(client, auth_headers, db_session):
    res = reset(client, staff_id(db_session, "testadmin"), "Temp-Pass-42", auth_headers)
    assert res.status_code == 400
    assert "Profile" in res.json()["detail"]
    bearer_for(client, "testadmin", "TestPassword123!")


def test_reset_writes_an_audit_event_without_the_password(
    client, auth_headers, staff_headers, db_session
):
    visitor = TestClient(app, client=VISITOR)
    target = staff_id(db_session)
    assert reset(visitor, target, "Temp-Pass-42", auth_headers).status_code == 204

    db_session.expire_all()
    (event,) = db_session.query(AuditEvent).filter_by(event="password_reset").all()
    assert event.actor_username == "testadmin"
    assert event.actor_id == staff_id(db_session, "testadmin")
    assert event.ip_address == VISITOR[0]
    assert (event.target_type, event.target_id) == ("user", str(target))
    assert event.details == {"username": "teststaff"}

    # A refused reset (wrong role, missing user, too short) is not logged
    reset(visitor, target, "Other-Pass-1", staff_headers)
    reset(visitor, 9999, "Other-Pass-1", auth_headers)
    reset(visitor, target, "short", auth_headers)
    db_session.expire_all()
    assert db_session.query(AuditEvent).filter_by(event="password_reset").count() == 1


# ── Sessions end when the password changes ──────────────────────────────────


def test_reset_ends_the_target_sessions(
    client, auth_headers, staff_headers, db_session
):
    assert client.get("/auth/me", headers=staff_headers).status_code == 200
    reset(client, staff_id(db_session), "Temp-Pass-42", auth_headers)

    assert client.get("/auth/me", headers=staff_headers).status_code == 401
    assert client.get("/leads/", headers=staff_headers).status_code == 401
    # The admin who reset it stays logged in
    assert client.get("/auth/me", headers=auth_headers).status_code == 200
    # A new login with the new password works
    fresh = bearer_for(client, "teststaff", "Temp-Pass-42")
    assert client.get("/auth/me", headers=fresh).status_code == 200


def test_reset_ends_a_cookie_session_too(
    client, auth_headers, staff_headers, db_session
):
    browser = TestClient(app)
    browser.post(
        "/auth/login", data={"username": "teststaff", "password": "StaffPass123"}
    )
    assert browser.get("/auth/me").status_code == 200
    reset(client, staff_id(db_session), "Temp-Pass-42", auth_headers)
    assert browser.get("/auth/me").status_code == 401


def test_self_change_ends_other_sessions_but_keeps_this_one(client, staff_headers):
    browser = TestClient(app)
    login = browser.post(
        "/auth/login", data={"username": "teststaff", "password": "StaffPass123"}
    )
    old_token = login.json()["access_token"]
    other_device = {"Authorization": f"Bearer {old_token}"}
    assert client.get("/auth/me", headers=other_device).status_code == 200

    res = browser.post(
        "/auth/me/password",
        json={"current_password": "StaffPass123", "new_password": "Changed-99"},
    )
    assert res.status_code == 204, res.text
    assert "access_token=" in res.headers["set-cookie"]
    assert "httponly" in res.headers["set-cookie"].lower()

    # The browser that changed it is still logged in with the fresh cookie
    assert browser.cookies.get("access_token") != old_token
    me = browser.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["username"] == "teststaff"
    # Every token from before the change is refused
    assert client.get("/auth/me", headers=other_device).status_code == 401
    assert client.get("/auth/me", headers=staff_headers).status_code == 401


def test_failed_self_change_keeps_sessions(client, staff_headers):
    res = client.post(
        "/auth/me/password",
        json={"current_password": "wrong", "new_password": "Changed-99"},
        headers=staff_headers,
    )
    assert res.status_code == 400
    assert "set-cookie" not in res.headers
    assert client.get("/auth/me", headers=staff_headers).status_code == 200


def test_password_change_time_is_recorded_in_utc(
    client, auth_headers, staff_headers, db_session
):
    before = datetime.now(timezone.utc).replace(tzinfo=None)
    reset(client, staff_id(db_session), "Temp-Pass-42", auth_headers)
    db_session.expire_all()
    user = db_session.get(AdminUser, staff_id(db_session))
    after = datetime.now(timezone.utc).replace(tzinfo=None)
    assert before <= user.password_changed_at <= after


def test_tokens_carry_iat_and_unchanged_accounts_keep_old_tokens(
    client, auth_headers, db_session
):
    token = auth_headers["Authorization"].split()[1]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert isinstance(payload["iat"], (int, float))

    # An account whose password never changed (NULL, as after the
    # migration) accepts a token from well before now
    old = create_access_token(
        "testadmin", issued_at=datetime.now(timezone.utc) - timedelta(minutes=30)
    )
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {old}"})
    assert res.status_code == 200


def test_token_without_iat_is_refused_once_the_password_changed(
    client, auth_headers, staff_headers, db_session
):
    reset(client, staff_id(db_session), "Temp-Pass-42", auth_headers)
    no_iat = jwt.encode(
        {
            "sub": "teststaff",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {no_iat}"})
    assert res.status_code == 401


# ── Minimum length 8 for new passwords ──────────────────────────────────────


@pytest.mark.parametrize("password", ["", "short", "seven77"])
def test_short_passwords_are_rejected_everywhere(
    client, auth_headers, staff_headers, db_session, password
):
    target = staff_id(db_session)
    responses = [
        client.post(
            "/users/",
            json={"username": "newbie", "password": password},
            headers=auth_headers,
        ),
        client.post(
            "/auth/register",
            json={"username": "newbie", "password": password},
            headers=auth_headers,
        ),
        client.post(
            "/auth/me/password",
            json={"current_password": "StaffPass123", "new_password": password},
            headers=staff_headers,
        ),
        reset(client, target, password, auth_headers),
    ]
    assert [r.status_code for r in responses] == [422, 422, 422, 422]
    # Nothing changed: the old password still works
    bearer_for(client, "teststaff", "StaffPass123")


def test_first_account_needs_8_characters(client):
    res = client.post(
        "/auth/register", json={"username": "owner", "password": "abc1234"}
    )
    assert res.status_code == 422
    res = client.post(
        "/auth/register", json={"username": "owner", "password": "abcd1234"}
    )
    assert res.status_code == 201


def test_eight_characters_is_enough(client, auth_headers, staff_headers, db_session):
    assert (
        reset(client, staff_id(db_session), "eight888", auth_headers).status_code == 204
    )
    res = client.post(
        "/users/",
        json={"username": "newbie", "password": "eight888"},
        headers=auth_headers,
    )
    assert res.status_code == 201


def test_existing_short_passwords_still_log_in(client, auth_headers, db_session):
    # An account made under the old 6-character rule
    db_session.add(
        AdminUser(
            username="oldtimer",
            hashed_password=get_password_hash("abc123"),
            role="staff",
            is_active=True,
        )
    )
    db_session.commit()
    headers = bearer_for(client, "oldtimer", "abc123")
    assert client.get("/auth/me", headers=headers).status_code == 200
