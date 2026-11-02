import httpx

from app.core.config import settings
from app.services.pricing_service import PricingService

LEAD_PARAMS = {"name": "Sam", "contact": "0821112222", "call_sid": "CA1", "quote": 100}


def test_creating_calls_and_leads_requires_auth(client):
    assert client.post("/calls/", params={"call_sid": "CA1"}).status_code == 401
    assert client.post("/leads/", params=LEAD_PARAMS, json={}).status_code == 401
    assert client.post("/pricing/calculate", json={}).status_code == 401


def test_service_key_can_create_calls_and_leads(client, monkeypatch):
    monkeypatch.setattr(settings, "SERVICE_API_KEY", "bridge-secret")
    headers = {"X-Service-Key": "bridge-secret"}

    assert (
        client.post("/calls/", params={"call_sid": "CA1"}, headers=headers).status_code
        == 200
    )
    assert (
        client.post("/leads/", params=LEAD_PARAMS, json={}, headers=headers).status_code
        == 200
    )


def test_wrong_or_disabled_service_key_rejected(client, monkeypatch):
    monkeypatch.setattr(settings, "SERVICE_API_KEY", "bridge-secret")
    wrong = {"X-Service-Key": "guess"}
    assert (
        client.post("/calls/", params={"call_sid": "CA1"}, headers=wrong).status_code
        == 401
    )

    # An empty SERVICE_API_KEY must not let an empty header through
    monkeypatch.setattr(settings, "SERVICE_API_KEY", "")
    empty = {"X-Service-Key": ""}
    assert (
        client.post("/calls/", params={"call_sid": "CA1"}, headers=empty).status_code
        == 401
    )


def test_service_key_cannot_read_leads(client, monkeypatch):
    monkeypatch.setattr(settings, "SERVICE_API_KEY", "bridge-secret")
    response = client.get("/leads/", headers={"X-Service-Key": "bridge-secret"})
    assert response.status_code == 401


def test_invalid_lead_status_rejected(client, auth_headers):
    params = {**LEAD_PARAMS, "status": "maybe"}
    response = client.post("/leads/", params=params, json={}, headers=auth_headers)
    assert response.status_code == 422

    lead = client.post(
        "/leads/", params=LEAD_PARAMS, json={}, headers=auth_headers
    ).json()
    response = client.patch(
        f"/leads/{lead['lead_id']}/status",
        params={"status": "maybe"},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_get_lead(client, auth_headers):
    lead = client.post(
        "/leads/", params=LEAD_PARAMS, json={}, headers=auth_headers
    ).json()
    response = client.get(f"/leads/{lead['lead_id']}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Sam"
    assert client.get("/leads/999", headers=auth_headers).status_code == 404


def test_update_profile(client, auth_headers):
    response = client.patch(
        "/auth/me",
        json={"first_name": "Dean", "last_name": "Thiart", "email": "dean@example.com"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    me = client.get("/auth/me", headers=auth_headers).json()
    assert (me["first_name"], me["last_name"], me["email"]) == (
        "Dean",
        "Thiart",
        "dean@example.com",
    )

    bad = client.patch("/auth/me", json={"email": "not-an-email"}, headers=auth_headers)
    assert bad.status_code == 422


def test_change_password(client, auth_headers):
    wrong = client.post(
        "/auth/me/password",
        json={"current_password": "nope", "new_password": "NewPassword1"},
        headers=auth_headers,
    )
    assert wrong.status_code == 400

    ok = client.post(
        "/auth/me/password",
        json={"current_password": "TestPassword123!", "new_password": "NewPassword1"},
        headers=auth_headers,
    )
    assert ok.status_code == 204
    login = client.post(
        "/auth/login", data={"username": "testadmin", "password": "NewPassword1"}
    )
    assert login.status_code == 200


def test_pricing_rules_proxy(client, auth_headers, monkeypatch):
    rules = {"currency": "ZAR", "services": {}}

    async def fake_get_rules(self):
        return rules

    async def fake_update_rules(self, new_rules):
        return httpx.Response(422, json={"detail": "services must be non-empty"})

    monkeypatch.setattr(PricingService, "get_rules", fake_get_rules)
    monkeypatch.setattr(PricingService, "update_rules", fake_update_rules)

    assert client.get("/pricing/rules").status_code == 401
    assert client.get("/pricing/rules", headers=auth_headers).json() == rules

    response = client.put("/pricing/rules", json=rules, headers=auth_headers)
    assert response.status_code == 422
    assert response.json()["detail"] == "services must be non-empty"


def test_delete_lead(client, auth_headers, monkeypatch):
    lead = client.post(
        "/leads/", params=LEAD_PARAMS, json={}, headers=auth_headers
    ).json()
    url = f"/leads/{lead['lead_id']}"

    assert client.delete(url).status_code == 401

    # The service key can create leads but not delete them
    monkeypatch.setattr(settings, "SERVICE_API_KEY", "bridge-secret")
    assert (
        client.delete(url, headers={"X-Service-Key": "bridge-secret"}).status_code
        == 401
    )

    assert client.delete(url, headers=auth_headers).status_code == 204
    assert client.get(url, headers=auth_headers).status_code == 404
    assert client.delete(url, headers=auth_headers).status_code == 404


def test_deleting_lead_keeps_call_log(client, auth_headers):
    client.post("/calls/", params={"call_sid": "CA77"}, headers=auth_headers)
    lead = client.post(
        "/leads/",
        params={**LEAD_PARAMS, "call_sid": "CA77"},
        json={},
        headers=auth_headers,
    ).json()

    client.delete(f"/leads/{lead['lead_id']}", headers=auth_headers)
    assert client.get("/calls/CA77", headers=auth_headers).status_code == 200


def test_lead_includes_originating_call_sid(client, auth_headers):
    client.post("/calls/", params={"call_sid": "CA88"}, headers=auth_headers)
    from_call = client.post(
        "/leads/",
        params={**LEAD_PARAMS, "call_sid": "CA88"},
        json={},
        headers=auth_headers,
    ).json()
    manual = client.post(
        "/leads/",
        params={**LEAD_PARAMS, "call_sid": "manual-1"},
        json={},
        headers=auth_headers,
    ).json()

    lead = client.get(f"/leads/{from_call['lead_id']}", headers=auth_headers).json()
    assert lead["call_sid"] == "CA88"
    assert (
        client.get(f"/leads/{manual['lead_id']}", headers=auth_headers).json()[
            "call_sid"
        ]
        is None
    )
    listed = {l["id"]: l for l in client.get("/leads/", headers=auth_headers).json()}
    assert listed[from_call["lead_id"]]["call_sid"] == "CA88"
