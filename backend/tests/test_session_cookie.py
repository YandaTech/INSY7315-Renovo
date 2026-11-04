"""The dashboard session lives in an httpOnly, SameSite=Strict cookie."""

from app.core.config import settings
from app.core.security import create_access_token

CREDENTIALS = {"username": "owner", "password": "OwnerPass1"}


def register_and_login(client):
    client.post("/auth/register", json=CREDENTIALS)
    return client.post("/auth/login", data=CREDENTIALS)


def cookie_header(response):
    headers = [
        h
        for h in response.headers.get_list("set-cookie")
        if h.startswith("access_token=")
    ]
    assert len(headers) == 1
    return headers[0]


def attributes(header):
    return {part.strip().split("=")[0].lower() for part in header.split(";")[1:]}


def test_login_sets_httponly_samesite_strict_cookie(client):
    res = register_and_login(client)
    assert res.status_code == 200

    header = cookie_header(res)
    assert "samesite=strict" in header.lower()
    assert {"httponly", "path", "max-age"} <= attributes(header)
    # Not Secure outside production, so it works over http://localhost
    assert "secure" not in attributes(header)
    # The cookie holds the bare token, nothing to unquote
    assert header.startswith(f"access_token={res.json()['access_token']};")


def test_cookie_is_secure_in_production(client, monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    res = register_and_login(client)
    assert "secure" in attributes(cookie_header(res))

    logout = client.post("/auth/logout")
    assert "secure" in attributes(cookie_header(logout))


def test_cookie_alone_opens_protected_routes(client):
    register_and_login(client)
    # No Authorization header: only the cookie jar
    assert client.get("/leads/").status_code == 200
    assert client.get("/auth/me").json()["username"] == "owner"


def test_logout_clears_the_cookie_and_the_session_ends(client):
    register_and_login(client)
    assert client.get("/auth/me").status_code == 200

    res = client.post("/auth/logout")
    assert res.status_code == 200
    header = cookie_header(res)
    assert "max-age=0" in header.lower()
    assert "samesite=strict" in header.lower()
    assert "httponly" in attributes(header)

    # The client honours the deletion like a browser would
    assert "access_token" not in client.cookies
    assert client.get("/auth/me").status_code == 401
    assert client.get("/leads/").status_code == 401


def test_tampered_or_foreign_cookie_is_rejected(client):
    register_and_login(client)
    client.cookies.set("access_token", "not-a-jwt")
    assert client.get("/auth/me").status_code == 401

    client.cookies.set("access_token", create_access_token("someone-else"))
    assert client.get("/auth/me").status_code == 401


def test_old_bearer_prefixed_cookie_still_accepted(client):
    token = register_and_login(client).json()["access_token"]
    client.cookies.clear()
    client.cookies.set("access_token", f'"Bearer {token}"')
    assert client.get("/auth/me").status_code == 200


def test_service_key_still_works_without_a_session(client, monkeypatch):
    monkeypatch.setattr(settings, "SERVICE_API_KEY", "bridge-secret")
    res = client.post(
        "/calls/",
        json={"call_sid": "CA-cookie", "transcript": ""},
        headers={"X-Service-Key": "bridge-secret"},
    )
    assert res.status_code in (200, 201)
