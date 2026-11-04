import asyncio
import json

import httpx

import prompts
import tools


def run_get_quote(monkeypatch, handler):
    """Runs get_quote with the pricing server replaced by `handler`."""
    real_client = httpx.AsyncClient

    def fake_client(*args, **kwargs):
        return real_client(transport=httpx.MockTransport(handler))

    monkeypatch.setattr(tools.httpx, "AsyncClient", fake_client)
    return asyncio.run(
        tools.get_quote({"job_type": "bath_reenamel", "travel_zone": "cbd"})
    )


def test_pricing_server_down_returns_error_with_no_quote(monkeypatch):
    def down(request):
        raise httpx.ConnectError("connection refused", request=request)

    result = run_get_quote(monkeypatch, down)

    assert result["status"] == "error"
    assert "estimated_quote" not in result
    assert "call them back" in result["detail"]
    assert not tools.quote_succeeded(result)


def test_pricing_server_500_returns_error_with_no_quote(monkeypatch):
    result = run_get_quote(monkeypatch, lambda request: httpx.Response(500))

    assert result["status"] == "error"
    assert "estimated_quote" not in result


def test_unpriceable_job_drops_the_zero_placeholder(monkeypatch):
    def engine_error(request):
        return httpx.Response(
            200,
            json={
                "estimated_quote": 0.0,
                "currency": "ZAR",
                "status": "error",
                "detail": "Unknown material: 'gold'",
            },
        )

    result = run_get_quote(monkeypatch, engine_error)

    assert result == {"status": "error", "detail": "Unknown material: 'gold'"}


def test_successful_quote_is_passed_through(monkeypatch):
    quote = {"estimated_quote": 3370.0, "currency": "ZAR", "status": "ok"}
    result = run_get_quote(monkeypatch, lambda request: httpx.Response(200, json=quote))

    assert result == quote
    assert tools.quote_succeeded(result)


def test_email_is_an_optional_get_quote_field():
    schema = tools.GET_QUOTE_TOOL["input_schema"]

    assert schema["properties"]["email"]["type"] == "string"
    assert "email" not in schema["required"]


def test_contact_details_never_reach_the_pricing_server(monkeypatch):
    seen = {}

    def handler(request):
        seen["body"] = json.loads(request.content)
        return httpx.Response(
            200, json={"estimated_quote": 3370.0, "currency": "ZAR", "status": "ok"}
        )

    real_client = httpx.AsyncClient
    monkeypatch.setattr(
        tools.httpx,
        "AsyncClient",
        lambda *a, **k: real_client(transport=httpx.MockTransport(handler)),
    )
    asyncio.run(
        tools.get_quote(
            {
                "job_type": "bath_reenamel",
                "travel_zone": "cbd",
                "caller_name": "James",
                "mobile_number": "0821234567",
                "email": "james@example.com",
            }
        )
    )

    assert seen["body"] == {"job_type": "bath_reenamel", "travel_zone": "cbd"}


def test_the_prompt_asks_for_an_email_and_to_confirm_it():
    prompt = prompts.build_system_prompt(None)

    assert "pass it as email" in prompt
    assert "read it back to confirm" in prompt
