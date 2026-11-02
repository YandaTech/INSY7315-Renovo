import httpx
from typing import Any

from app.core.config import settings


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
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.mcp_server_url, json=factors, timeout=10.0
                )
                response.raise_for_status()
                return response.json()
            except (httpx.HTTPError, ValueError) as exc:
                raise PricingUnavailable(str(exc)) from exc

    async def get_rules(self) -> dict[str, Any]:
        """Fetches the current pricing rules from the pricing server."""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.mcp_server_url}/rules", timeout=10.0)
            response.raise_for_status()
            return response.json()

    async def update_rules(self, rules: dict[str, Any]) -> httpx.Response:
        """Saves new pricing rules; returns the raw response so callers can
        pass validation errors (422) back to the client."""
        async with httpx.AsyncClient() as client:
            return await client.put(
                f"{self.mcp_server_url}/rules", json=rules, timeout=10.0
            )
