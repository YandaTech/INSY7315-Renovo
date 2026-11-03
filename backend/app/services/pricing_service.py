import httpx
from typing import Any
from fastapi import HTTPException

from app.core.config import settings


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

        Uses an asynchronous HTTP client to POST payload data and handles HTTP/network errors
        by explicitly raising an HTTPException rather than returning fallback data.
        
        :param factors: Dictionary of job parameters (e.g., job scope, urgency, materials).
        :return: JSON response payload containing estimated quote details.
        """
        async with httpx.AsyncClient() as client:
            try:
                # POST job factors to the pricing endpoint with a 10-second timeout safeguard
                response = await client.post(
                    self.mcp_server_url, json=factors, timeout=10.0
                )

                # Raise an HTTPStatusError if the response status code is 4xx or 5xx
                response.raise_for_status()

                # Parse and return successful JSON response
                return response.json()
            except httpx.HTTPError as exc:
                # Explicitly raise a FastAPI HTTPException when the pricing service fails or times out
                raise HTTPException(
                    status_code=502,
                    detail=f"Pricing engine communication failed: {str(exc)}"
                )

    async def get_rules(self) -> dict[str, Any]:
        """Fetch current pricing rules from the pricing engine."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.mcp_server_url, timeout=10.0)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as exc:
                raise HTTPException(
                    status_code=502,
                    detail=f"Pricing engine communication failed: {str(exc)}"
                )

    async def update_rules(self, new_rules: dict[str, Any]) -> httpx.Response:
        """Update pricing rules on the pricing engine."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.put(self.mcp_server_url, json=new_rules, timeout=10.0)
                return response
            except httpx.HTTPError as exc:
                raise HTTPException(
                    status_code=502,
                    detail=f"Pricing engine communication failed: {str(exc)}"
                )