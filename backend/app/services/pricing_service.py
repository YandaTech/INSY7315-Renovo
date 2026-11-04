import asyncio
from typing import Any

import httpx

from app.core.config import settings

_client: httpx.AsyncClient | None = None
_client_loop: asyncio.AbstractEventLoop | None = None


def _shared_client() -> httpx.AsyncClient:
    """One connection pool for every request to the pricing server.

    A new AsyncClient per request cost about 20 ms (it builds an SSL
    context and opens a fresh connection), which was most of the time
    POST /pricing/calculate took. The client belongs to the event loop
    that created it, so a new loop (as in tests) gets a new client.
    """
    global _client, _client_loop
    loop = asyncio.get_running_loop()
    if _client is None or _client_loop is not loop:
        _client = httpx.AsyncClient(timeout=10.0)
        _client_loop = loop
    return _client


class PricingUnavailable(Exception):
    """The pricing server could not be reached or gave no usable answer."""


class PricingService:
    """
    Integration service for communicating with an external MCP (Model Context Protocol)
    or microservice pricing engine over HTTP.
    """

    def __init__(self, mcp_server_url: str | None = None):
        """
        Initialize the pricing service with the endpoint URL.

        :param mcp_server_url: The full HTTP URL of the target pricing engine server.
        """
        self.mcp_server_url = mcp_server_url or settings.PRICING_SERVER_URL

    async def get_quote_from_mcp(self, factors: dict[str, Any]) -> dict[str, Any]:
        """
        Sends job parameters/factors to the external MCP pricing engine and returns quote details.

        :param factors: Dictionary of job parameters (e.g., job scope, urgency, materials).
        :return: The pricing server's JSON payload. Its "status" is "ok" with an
            "estimated_quote", or "error" with a "detail" when the factors can't be priced.
        :raises PricingUnavailable: if the server is unreachable, times out or
            answers with an error status. There is no fallback amount: a failed
            lookup must never turn into an R0 quote.
        """
        try:
            response = await _shared_client().post(self.mcp_server_url, json=factors)
            response.raise_for_status()
            return response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise PricingUnavailable(str(exc)) from exc

    async def get_rules(self) -> dict[str, Any]:
        """Fetches the current pricing rules from the pricing server."""
        response = await _shared_client().get(f"{self.mcp_server_url}/rules")
        response.raise_for_status()
        return response.json()

    async def update_rules(self, rules: dict[str, Any]) -> httpx.Response:
        """Saves new pricing rules; returns the raw response so callers can
        pass validation errors (422) back to the client."""
        return await _shared_client().put(f"{self.mcp_server_url}/rules", json=rules)
