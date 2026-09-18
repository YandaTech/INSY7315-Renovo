import os
from typing import Any

import httpx

PRICING_SERVER_URL = os.environ.get(
    "PRICING_SERVER_URL", "http://localhost:8001/mcp/pricing"
)

GET_QUOTE_TOOL = {
    "name": "get_quote",
    "description": (
        "Calculate a renovation job quote from the factors collected so far. "
        "Call this once job_type, scope, urgency, materials_grade, and travel_zone "
        "are all known."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "job_type": {
                "type": "string",
                "enum": [
                    "kitchen_renovation",
                    "bathroom_renovation",
                    "painting",
                    "flooring",
                    "roofing",
                    "general_repair",
                ],
            },
            "scope": {"type": "string", "enum": ["small", "medium", "large"]},
            "urgency": {
                "type": "string",
                "enum": ["standard", "urgent", "emergency"],
            },
            "materials_grade": {
                "type": "string",
                "enum": ["budget", "standard", "premium"],
            },
            "travel_zone": {
                "type": "string",
                "enum": ["zone_1", "zone_2", "zone_3", "out_of_area"],
            },
            "square_meters": {"type": "number"},
        },
        "required": ["job_type", "scope", "urgency", "materials_grade", "travel_zone"],
    },
}

TOOLS = [GET_QUOTE_TOOL]


async def get_quote(factors: dict[str, Any]) -> dict[str, Any]:
    """Calls the MCP pricing server and returns its quote payload."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(PRICING_SERVER_URL, json=factors, timeout=10.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            return {
                "estimated_quote": 0.0,
                "currency": "ZAR",
                "status": "error",
                "detail": str(exc),
            }


TOOL_HANDLERS = {
    "get_quote": get_quote,
}
