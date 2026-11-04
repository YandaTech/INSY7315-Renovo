"""The login rate limit counts each visitor's real IP separately, behind
Caddy and nginx as in production."""

import re
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.core.limiter import limiter
from app.main import app

DOCKERFILE = Path(__file__).resolve().parents[1] / "Dockerfile"
# What a request looks like when it reaches uvicorn: the TCP peer is the
# nginx container, and X-Forwarded-For holds "visitor, caddy".
NGINX = ("172.18.0.5", 41000)
CADDY_IP = "172.18.0.2"


def prod_stage():
    text = DOCKERFILE.read_text()
    return text[text.index("AS prod") :]


def trusted_proxies():
    match = re.search(r'ENV FORWARDED_ALLOW_IPS="([^"]+)"', prod_stage())
    assert match, "prod stage must set FORWARDED_ALLOW_IPS"
    return match.group(1)


@pytest.fixture
def proxied_client(client):
    """The app wrapped the way `uvicorn --proxy-headers` wraps it in prod."""
    client.post("/auth/register", json={"username": "owner", "password": "Owner123"})
    wrapped = ProxyHeadersMiddleware(app, trusted_hosts=trusted_proxies())
    limiter.enabled = True
    limiter.reset()
    yield TestClient(wrapped, client=NGINX)
    limiter.reset()
    limiter.enabled = False


def login(client, password, visitor_ip):
    return client.post(
        "/auth/login",
        data={"username": "owner", "password": password},
        headers={"X-Forwarded-For": f"{visitor_ip}, {CADDY_IP}"},
    )


def test_prod_command_trusts_proxy_headers_and_still_migrates():
    cmd = re.search(r"^CMD (.+)$", prod_stage(), re.M).group(1)
    assert "python -m app.migrate && exec uvicorn" in cmd
    assert "--proxy-headers" in cmd
    assert '--forwarded-allow-ips \\"$FORWARDED_ALLOW_IPS\\"' in cmd
    # Only private Docker ranges are trusted, never everyone
    assert "*" not in trusted_proxies()


def test_repeated_failed_logins_from_one_ip_get_429(proxied_client):
    for _ in range(5):
        assert login(proxied_client, "wrong", "203.0.113.5").status_code == 401
    assert login(proxied_client, "wrong", "203.0.113.5").status_code == 429
    # Even the right password is refused until the window passes
    assert login(proxied_client, "Owner123", "203.0.113.5").status_code == 429


def test_another_ip_is_limited_separately_and_can_still_log_in(proxied_client):
    for _ in range(6):
        login(proxied_client, "wrong", "203.0.113.5")
    assert login(proxied_client, "wrong", "203.0.113.5").status_code == 429

    res = login(proxied_client, "Owner123", "198.51.100.7")
    assert res.status_code == 200
    assert "access_token" in res.cookies


def test_forwarded_header_from_an_untrusted_peer_is_ignored(client):
    """A client talking to uvicorn directly cannot dodge the limit by
    sending a different X-Forwarded-For each time."""
    wrapped = ProxyHeadersMiddleware(app, trusted_hosts=trusted_proxies())
    direct = TestClient(wrapped, client=("8.8.8.8", 5000))
    limiter.enabled = True
    limiter.reset()
    try:
        for i in range(5):
            res = direct.post(
                "/auth/login",
                data={"username": "x", "password": "y"},
                headers={"X-Forwarded-For": f"10.0.0.{i}"},
            )
            assert res.status_code == 401
        res = direct.post(
            "/auth/login",
            data={"username": "x", "password": "y"},
            headers={"X-Forwarded-For": "10.0.0.99"},
        )
        assert res.status_code == 429
    finally:
        limiter.reset()
        limiter.enabled = False
