import httpx
from typing import Any

class PricingService:
    """
    Integration service for communicating with an external MCP (Model Context Protocol) 
    or microservice pricing engine over HTTP.
    """
    def __init__(self, mcp_server_url: str = "http://localhost:8001/mcp/pricing"):
        """
        Initialize the pricing service with the endpoint URL.
        
        :param mcp_server_url: The full HTTP URL of the target pricing engine server.
        """
        self.mcp_server_url = mcp_server_url

    async def get_quote_from_mcp(self, factors: dict[str, Any]) -> dict[str, Any]:
        """
        Sends job parameters/factors to the external MCP pricing engine and returns quote details.
        
        Uses an asynchronous HTTP client to POST payload data and handles HTTP/network errors
        by returning a structured fallback payload instead of raising an unhandled exception.
        
        :param factors: Dictionary of job parameters (e.g., job scope, urgency, materials).
        :return: JSON response payload containing estimated quote details or fallback error data.
        """
        # Create an asynchronous HTTP client context session
        """Sends job parameters/factors to the external MCP pricing engine and returns quote details."""
        async with httpx.AsyncClient() as client:
            try:
                # POST job factors to the pricing endpoint with a 10-second timeout safeguard
                response = await client.post(self.mcp_server_url, json=factors, timeout=10.0)

                # Raise an HTTPStatusError if the response status code is 4xx or 5xx
                response.raise_for_status()

                # Parse and return successful JSON response
                return response.json()
            except httpx.HTTPError as exc:
               # Fallback pricing logic if external service is unreachable, times out, or returns an error status
                return {
                    "estimated_quote": 0.0,
                    "currency": "ZAR",
                    "status": "error",
                    "detail": str(exc)
                }