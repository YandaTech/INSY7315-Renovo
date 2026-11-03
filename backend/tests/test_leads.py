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
        json={"call_sid": "CA123", "outcome": "quoted"},
        headers=auth_headers,
    )
    response = client.post(
        "/leads/",
        json={
            "name": "Thandi",
            "contact": "+27821234567",
            "call_sid": "CA123",
            "quote": 4250.5,
            "job_details": {"job_type": "bath_reenamel", "material": "enamel"},
        },
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
        json={
            "name": "Sam",
            "contact": "0821112222",
            "call_sid": "manual-1",
            "job_details": {"job_type": "sink_reenamel"},
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["quote"] == 999.0


def test_create_lead_with_status(client, auth_headers):
    client.post(
        "/leads/",
        json={
            "name": "Unknown caller",
            "contact": "+27820000000",
            "call_sid": "CA999",
            "quote": 0,
            "status": "incomplete",
        },
        headers=auth_headers,
    )
    leads = client.get(
        "/leads/", params={"status": "incomplete"}, headers=auth_headers
    ).json()
    assert [lead["name"] for lead in leads] == ["Unknown caller"]


def test_get_call_by_sid(client, auth_headers):
    client.post(
        "/calls/",
        json={"call_sid": "CA555", "transcript": "Caller: hi", "duration": 12},
        headers=auth_headers,
    )
    response = client.get("/calls/CA555", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["transcript"] == "Caller: hi"

    assert client.get("/calls/nope", headers=auth_headers).status_code == 404


def pricing_server_down(monkeypatch):
    """Points the backend at a port nothing listens on."""
    from app.core.config import settings

    monkeypatch.setattr(
        settings, "PRICING_SERVER_URL", "http://127.0.0.1:9/mcp/pricing"
    )


def test_pricing_server_down_saves_lead_with_no_quote(
    client, auth_headers, monkeypatch
):
    pricing_server_down(monkeypatch)

    response = client.post(
        "/leads/",
        json={
            "name": "Sam",
            "contact": "0821112222",
            "call_sid": "manual-2",
            "job_details": {"job_type": "sink_reenamel", "travel_zone": "cbd"},
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["quote"] is None

    leads = client.get("/leads/", headers=auth_headers).json()
    assert leads[0]["quote"] is None


def test_unpriceable_job_saves_lead_with_no_quote(client, auth_headers, monkeypatch):
    async def engine_error(self, factors):
        return {
            "estimated_quote": 0.0,
            "currency": "ZAR",
            "status": "error",
            "detail": "Unknown travel_zone: None",
        }

    monkeypatch.setattr(PricingService, "get_quote_from_mcp", engine_error)

    response = client.post(
        "/leads/",
        json={
            "name": "Sam",
            "contact": "0821112222",
            "call_sid": "manual-3",
            "job_details": {"job_type": "sink_reenamel"},
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["quote"] is None


def test_calculate_returns_502_when_pricing_server_down(
    client, auth_headers, monkeypatch
):
    pricing_server_down(monkeypatch)

    response = client.post(
        "/pricing/calculate",
        json={"job_type": "sink_reenamel", "travel_zone": "cbd"},
        headers=auth_headers,
    )
    assert response.status_code == 502
    assert "Pricing server unavailable" in response.json()["detail"]
    assert "estimated_quote" not in response.json()


def test_calculate_returns_422_when_job_cannot_be_priced(
    client, auth_headers, monkeypatch
):
    async def engine_error(self, factors):
        return {
            "estimated_quote": 0.0,
            "status": "error",
            "detail": "Unknown job_type: 'x'",
        }

    monkeypatch.setattr(PricingService, "get_quote_from_mcp", engine_error)

    response = client.post(
        "/pricing/calculate", json={"job_type": "x"}, headers=auth_headers
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Unknown job_type: 'x'"


def test_incomplete_lead_is_not_priced(client, auth_headers, monkeypatch):
    # A call that hung up before a quote must not get one afterwards: the
    # caller never heard it.
    async def fail_if_called(self, factors):
        raise AssertionError("pricing server should not be called")

    monkeypatch.setattr(PricingService, "get_quote_from_mcp", fail_if_called)

    response = client.post(
        "/leads/",
        json={
            "name": "Unknown caller",
            "contact": "+27821234567",
            "call_sid": "CA-hangup",
            "quote": None,
            "status": "incomplete",
            "job_details": {"job_type": "bath_reenamel"},
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["quote"] is None
