import asyncio

import httpx

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
    result = run_get_quote(
        monkeypatch, lambda request: httpx.Response(200, json=quote)
    )

    assert result == quote
    assert tools.quote_succeeded(result)
