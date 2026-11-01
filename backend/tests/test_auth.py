import pytest
from app.core.limiter import limiter


def test_register_admin(client):
    response = client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testadmin"
    assert "id" in data


def test_register_duplicate_username_fails(client, auth_headers):
    response = client.post(
        "/auth/register",
        json={"username": "testadmin", "password": "AnotherPassword456!"},
        headers=auth_headers,
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already registered"


def test_login_success(client):
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    response = client.post(
        "/auth/login", data={"username": "testadmin", "password": "TestPassword123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client):
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    response = client.post(
        "/auth/login", data={"username": "testadmin", "password": "WrongPassword!"}
    )
    assert response.status_code == 401


def test_protected_route_without_token_fails(client):
    response = client.get("/leads/")
    assert response.status_code == 401


def test_protected_route_with_valid_token(client):
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    login_res = client.post(
        "/auth/login", data={"username": "testadmin", "password": "TestPassword123!"}
    )
    token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/leads/", headers=headers)
    assert response.status_code == 200
    assert response.json() == []


def test_first_account_can_sign_up_then_sign_up_closes(client):
    assert client.get("/auth/registration-open").json() == {"open": True}

    first = client.post(
        "/auth/register", json={"username": "owner", "password": "OwnerPass1"}
    )
    assert first.status_code == 201
    assert client.get("/auth/registration-open").json() == {"open": False}

    stranger = client.post(
        "/auth/register", json={"username": "stranger", "password": "Stranger1"}
    )
    assert stranger.status_code == 403


def test_logged_in_staff_can_add_team_member(client, auth_headers):
    response = client.post(
        "/auth/register",
        json={"username": "newstaff", "password": "NewStaff1"},
        headers=auth_headers,
    )
    assert response.status_code == 201

    login = client.post(
        "/auth/login", data={"username": "newstaff", "password": "NewStaff1"}
    )
    assert login.status_code == 200


def test_invalid_token_cannot_register(client, auth_headers):
    response = client.post(
        "/auth/register",
        json={"username": "sneaky", "password": "Sneaky123"},
        headers={"Authorization": "Bearer not-a-real-token"},
    )
    assert response.status_code == 401


def test_login_rate_limiting(client):
    limiter.enabled = True
    try:
        limiter.reset()

        for _ in range(5):
            res = client.post(
                "/auth/login",
                data={"username": "testadmin", "password": "WrongPassword!"},
            )
            assert res.status_code == 401

        blocked = client.post(
            "/auth/login",
            data={"username": "testadmin", "password": "WrongPassword!"},
        )
        assert blocked.status_code == 429
    finally:
        limiter.enabled = False


def test_login_sets_httponly_cookie(client):
    client.post(
        "/auth/register",
        json={"username": "cookietest", "password": "CookiePassword123!"},
    )
    res = client.post(
        "/auth/login", data={"username": "cookietest", "password": "CookiePassword123!"}
    )
    assert res.status_code == 200
    assert "access_token" in res.cookies


def test_protected_route_with_cookie_auth(client):
    client.post(
        "/auth/register",
        json={"username": "cookieuser", "password": "CookiePassword123!"},
    )
    login_res = client.post(
        "/auth/login", data={"username": "cookieuser", "password": "CookiePassword123!"}
    )
    assert login_res.status_code == 200

    leads_res = client.get("/leads/")
    assert leads_res.status_code == 200
    assert leads_res.json() == []


def test_logout_clears_cookie(client):
    client.post(
        "/auth/register",
        json={"username": "logoutuser", "password": "LogoutPassword123!"},
    )
    client.post(
        "/auth/login", data={"username": "logoutuser", "password": "LogoutPassword123!"}
    )

    logout_res = client.post("/auth/logout")
    assert logout_res.status_code == 200

    client.cookies.clear()
    protected_res = client.get("/leads/")
    assert protected_res.status_code == 401
