"""Admin and staff roles, and deactivation that ends sessions at once."""

import httpx

from app.models.user import AdminUser
from app.services.pricing_service import PricingService
from tests.conftest import bearer_for

RULES = {"currency": "ZAR", "services": {"bath_reenamel": {"base": 3500}}}


def user_id(client, headers, username):
    users = client.get("/users/", headers=headers).json()
    return next(u["id"] for u in users if u["username"] == username)


def fake_pricing(monkeypatch):
    saved = []

    async def fake_update_rules(self, new_rules):
        saved.append(new_rules)
        return httpx.Response(200, json=new_rules)

    async def fake_get_rules(self):
        return RULES

    monkeypatch.setattr(PricingService, "update_rules", fake_update_rules)
    monkeypatch.setattr(PricingService, "get_rules", fake_get_rules)
    return saved


def test_first_account_is_admin_and_added_accounts_default_to_staff(
    client, auth_headers
):
    me = client.get("/auth/me", headers=auth_headers).json()
    assert me["role"] == "admin" and me["is_active"] is True

    res = client.post(
        "/users/",
        json={"username": "newbie", "password": "Newbie123"},
        headers=auth_headers,
    )
    assert res.status_code == 201
    assert res.json()["role"] == "staff"

    # Adding through /auth/register as an admin also makes staff
    res = client.post(
        "/auth/register",
        json={"username": "other", "password": "Other1234"},
        headers=auth_headers,
    )
    assert res.json()["role"] == "staff"


def test_staff_cannot_add_users(client, staff_headers):
    body = {"username": "sneaky", "password": "Sneaky123"}
    assert client.post("/users/", json=body, headers=staff_headers).status_code == 403
    assert (
        client.post("/auth/register", json=body, headers=staff_headers).status_code
        == 403
    )
    assert (
        client.post(
            "/users/", json={**body, "role": "admin"}, headers=staff_headers
        ).status_code
        == 403
    )


def test_staff_cannot_list_or_change_users(client, auth_headers, staff_headers):
    admin_id = user_id(client, auth_headers, "testadmin")
    assert client.get("/users/", headers=staff_headers).status_code == 403
    res = client.patch(
        f"/users/{admin_id}", json={"is_active": False}, headers=staff_headers
    )
    assert res.status_code == 403
    staff_id = user_id(client, auth_headers, "teststaff")
    res = client.patch(
        f"/users/{staff_id}", json={"role": "admin"}, headers=staff_headers
    )
    assert res.status_code == 403


def test_staff_cannot_change_prices_but_can_view_them(
    client, auth_headers, staff_headers, monkeypatch
):
    saved = fake_pricing(monkeypatch)

    assert client.get("/pricing/rules", headers=staff_headers).json() == RULES
    res = client.put("/pricing/rules", json=RULES, headers=staff_headers)
    assert res.status_code == 403
    assert saved == []

    res = client.put("/pricing/rules", json=RULES, headers=auth_headers)
    assert res.status_code == 200
    assert saved == [RULES]


def test_staff_can_still_work_leads(client, staff_headers):
    assert client.get("/leads/", headers=staff_headers).status_code == 200
    assert client.get("/calls/", headers=staff_headers).status_code == 200


def test_deactivated_users_existing_session_is_rejected_at_once(
    client, auth_headers, staff_headers
):
    assert client.get("/leads/", headers=staff_headers).status_code == 200

    staff_id = user_id(client, auth_headers, "teststaff")
    res = client.patch(
        f"/users/{staff_id}", json={"is_active": False}, headers=auth_headers
    )
    assert res.status_code == 200
    assert res.json()["is_active"] is False

    # Same, unexpired token: refused on the very next request
    assert client.get("/leads/", headers=staff_headers).status_code == 401
    assert client.get("/auth/me", headers=staff_headers).status_code == 401

    # And they cannot log in again
    res = client.post(
        "/auth/login", data={"username": "teststaff", "password": "StaffPass123"}
    )
    assert res.status_code == 401

    # Reactivating restores access
    client.patch(f"/users/{staff_id}", json={"is_active": True}, headers=auth_headers)
    assert client.get("/leads/", headers=staff_headers).status_code == 200


def test_deactivated_cookie_session_is_rejected(client, auth_headers, db_session):
    client.post(
        "/users/",
        json={"username": "cookie", "password": "Cookie123"},
        headers=auth_headers,
    )
    client.post("/auth/login", data={"username": "cookie", "password": "Cookie123"})
    assert client.get("/auth/me").status_code == 200

    user = db_session.query(AdminUser).filter_by(username="cookie").one()
    user.is_active = False
    db_session.commit()

    assert client.get("/auth/me").status_code == 401


def test_role_change_applies_to_an_existing_session(
    client, auth_headers, staff_headers, monkeypatch
):
    fake_pricing(monkeypatch)
    staff_id = user_id(client, auth_headers, "teststaff")

    client.patch(f"/users/{staff_id}", json={"role": "admin"}, headers=auth_headers)
    assert (
        client.put("/pricing/rules", json=RULES, headers=staff_headers).status_code
        == 200
    )

    client.patch(f"/users/{staff_id}", json={"role": "staff"}, headers=auth_headers)
    assert (
        client.put("/pricing/rules", json=RULES, headers=staff_headers).status_code
        == 403
    )


def test_admin_cannot_demote_or_deactivate_themselves(client, auth_headers):
    admin_id = user_id(client, auth_headers, "testadmin")

    res = client.patch(
        f"/users/{admin_id}", json={"role": "staff"}, headers=auth_headers
    )
    assert res.status_code == 400
    res = client.patch(
        f"/users/{admin_id}", json={"is_active": False}, headers=auth_headers
    )
    assert res.status_code == 400

    me = client.get("/auth/me", headers=auth_headers).json()
    assert me["role"] == "admin" and me["is_active"] is True
    # A no-op on their own account is fine
    res = client.patch(
        f"/users/{admin_id}", json={"role": "admin"}, headers=auth_headers
    )
    assert res.status_code == 200


def test_admin_can_manage_another_admin(client, auth_headers):
    client.post(
        "/users/",
        json={"username": "second", "password": "Second123", "role": "admin"},
        headers=auth_headers,
    )
    second = bearer_for(client, "second", "Second123")
    admin_id = user_id(client, auth_headers, "testadmin")

    res = client.patch(f"/users/{admin_id}", json={"role": "staff"}, headers=second)
    assert res.status_code == 200
    assert client.get("/users/", headers=auth_headers).status_code == 403


def test_user_update_validation(client, auth_headers):
    assert (
        client.patch(
            "/users/999", json={"is_active": False}, headers=auth_headers
        ).status_code
        == 404
    )
    staff = client.post(
        "/users/",
        json={"username": "valid", "password": "Valid1234"},
        headers=auth_headers,
    ).json()
    res = client.patch(
        f"/users/{staff['id']}", json={"role": "owner"}, headers=auth_headers
    )
    assert res.status_code == 422
    res = client.post(
        "/users/",
        json={"username": "valid", "password": "Valid1234"},
        headers=auth_headers,
    )
    assert res.status_code == 400


def test_user_list_never_includes_password_hashes(client, auth_headers):
    users = client.get("/users/", headers=auth_headers).json()
    assert users and all("hashed_password" not in u for u in users)
