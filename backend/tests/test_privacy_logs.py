import logging

from app.services.pricing_service import PricingService

TRANSCRIPT = "Caller: My bath at 12 Oak Road is stained"
PHONE = "+27821234567"


def test_saving_a_call_and_lead_logs_no_personal_data(
    client, auth_headers, monkeypatch, caplog, capsys
):
    """Transcripts, names and numbers travel in request bodies and are
    never written to logs or request URLs (which access logs record)."""

    async def fail_if_called(self, factors):
        raise AssertionError("pricing server should not be called")

    monkeypatch.setattr(PricingService, "get_quote_from_mcp", fail_if_called)
    caplog.set_level(logging.DEBUG)

    call = client.post(
        "/calls/",
        json={"call_sid": "CA-private", "transcript": TRANSCRIPT, "outcome": "quoted"},
        headers=auth_headers,
    )
    lead = client.post(
        "/leads/",
        json={
            "name": "Thandi Mokoena",
            "contact": PHONE,
            "call_sid": "CA-private",
            "quote": 3370,
            "job_details": {"job_type": "bath_reenamel"},
        },
        headers=auth_headers,
    )

    assert call.status_code == 200
    assert lead.status_code == 200
    for response in (call, lead):
        assert response.request.url.query == b""

    captured = capsys.readouterr()
    output = caplog.text + captured.out + captured.err
    for secret in ("Oak Road", "stained", "Thandi", "821234567"):
        assert secret not in output
