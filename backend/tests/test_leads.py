import json

from app.services.pricing_service import PricingService


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_lead_with_supplied_quote_skips_pricing(
    client, auth_headers, monkeypatch
):
    async def fail_if_called(self, factors):
        raise AssertionError("pricing server should not be called")

    monkeypatch.setattr(PricingService, "get_quote_from_mcp", fail_if_called)

    client.post(
        "/calls/",
        params={"call_sid": "CA123", "outcome": "quoted"},
        headers=auth_headers,
    )
    response = client.post(
        "/leads/",
        params={
            "name": "Thandi",
            "contact": "+27821234567",
            "call_sid": "CA123",
            "quote": 4250.5,
        },
        json={"job_type": "bath_reenamel", "material": "enamel"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["quote"] == 4250.5

    leads = client.get("/leads/", headers=auth_headers).json()
    assert len(leads) == 1
    assert leads[0]["call_id"] is not None
    assert json.loads(leads[0]["job_details"])["job_type"] == "bath_reenamel"


def test_create_lead_without_quote_asks_pricing_server(
    client, auth_headers, monkeypatch
):
    async def fake_quote(self, factors):
        return {"estimated_quote": 999.0, "currency": "ZAR", "status": "ok"}

    monkeypatch.setattr(PricingService, "get_quote_from_mcp", fake_quote)

    response = client.post(
        "/leads/",
        params={"name": "Sam", "contact": "0821112222", "call_sid": "manual-1"},
        json={"job_type": "sink_reenamel"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["quote"] == 999.0


def test_create_lead_with_status(client, auth_headers):
    client.post(
        "/leads/",
        params={
            "name": "Unknown caller",
            "contact": "+27820000000",
            "call_sid": "CA999",
            "quote": 0,
            "status": "incomplete",
        },
        json={},
        headers=auth_headers,
    )
    leads = client.get(
        "/leads/", params={"status": "incomplete"}, headers=auth_headers
    ).json()
    assert [lead["name"] for lead in leads] == ["Unknown caller"]


def test_get_call_by_sid(client, auth_headers):
    client.post(
        "/calls/",
        params={"call_sid": "CA555", "transcript": "Caller: hi", "duration": 12},
        headers=auth_headers,
    )
    response = client.get("/calls/CA555", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["transcript"] == "Caller: hi"

    assert client.get("/calls/nope", headers=auth_headers).status_code == 404
