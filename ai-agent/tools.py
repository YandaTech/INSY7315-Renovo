import os
from typing import Any

import httpx

PRICING_SERVER_URL = os.environ.get(
    "PRICING_SERVER_URL", "http://localhost:8001/mcp/pricing"
)

GET_QUOTE_TOOL = {
    "name": "get_quote",
    "description": (
        "Calculate a Renovo Cape job estimate from the factors collected so far. "
        "Call this once job_type and travel_zone are known, plus material and "
        "damage_level where they apply to the job."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "job_type": {
                "type": "string",
                "enum": [
                    "bath_reenamel",
                    "sink_reenamel",
                    "kitchen_cupboard_respray",
                    "bedroom_cupboard_respray",
                    "tile_resurfacing",
                    "shower_tray_resurfacing",
                    "sanitaryware_polishing",
                    "sanitaryware_restoration",
                    "countertop_restoration",
                    "vanity_restoration",
                ],
            },
            "material": {
                "type": "string",
                "enum": [
                    "acrylic",
                    "enamel",
                    "steel",
                    "cast_iron",
                    "fibreglass",
                    "porcelain",
                    "ceramic_tile",
                    "composite",
                ],
                "description": "Leave out for cupboard respraying or if unknown.",
            },
            "damage_level": {
                "type": "string",
                "enum": ["minor", "general_wear", "heavy"],
            },
            "travel_zone": {
                "type": "string",
                "enum": [
                    "cbd",
                    "southern_suburbs",
                    "northern_suburbs",
                    "atlantic_seaboard",
                    "hout_bay",
                    "far_outlying",
                ],
            },
            "quantity": {
                "type": "integer",
                "minimum": 1,
                "description": "How many of the item, e.g. 2 sinks. Defaults to 1.",
            },
            "suburb": {
                "type": "string",
                "description": "The suburb the caller named, as they said it.",
            },
            "caller_name": {
                "type": "string",
                "description": "The caller's name, if they gave it.",
            },
            "mobile_number": {
                "type": "string",
                "description": (
                    "The mobile number the caller wants the quote texted to, "
                    "digits as they said them, e.g. 0821234567."
                ),
            },
            "email": {
                "type": "string",
                "description": (
                    "The email address the caller wants the quote emailed to, "
                    "only if they gave one and confirmed it when read back. "
                    "Write it as an address, e.g. james.smith@gmail.com."
                ),
            },
        },
        "required": ["job_type", "travel_zone"],
    },
}

END_CALL_TOOL = {
    "name": "end_call",
    "description": (
        "Call this once the conversation is genuinely finished - the caller has "
        "said goodbye, declined further help, or there's nothing left to do. "
        "Say your goodbye in the same turn as calling this; the call will be "
        "hung up right after your reply is spoken."
    ),
    "input_schema": {"type": "object", "properties": {}},
}

TOOLS = [GET_QUOTE_TOOL, END_CALL_TOOL]


PRICING_UNAVAILABLE = (
    "No quote could be calculated because the pricing system is unavailable. "
    "Don't give the caller any figure; tell them the team will call them back "
    "with a price."
)


def quote_succeeded(result: dict[str, Any]) -> bool:
    """True only for a real priced quote, never for an error result."""
    return result.get("status") == "ok" and (result.get("estimated_quote") or 0) > 0


# Collected with the job factors for the voice-bridge (lead, SMS, email),
# but never sent to the pricing server.
CONTACT_FIELDS = frozenset({"caller_name", "mobile_number", "email"})


def pricing_factors(factors: dict[str, Any]) -> dict[str, Any]:
    """The job factors without the caller's contact details."""
    return {k: v for k, v in factors.items() if k not in CONTACT_FIELDS}


async def get_quote(factors: dict[str, Any]) -> dict[str, Any]:
    """Calls the MCP pricing server and returns its quote payload.

    On failure it returns an error result with no estimated_quote, so the
    agent can never read "zero rand" to the caller.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                PRICING_SERVER_URL, json=pricing_factors(factors), timeout=10.0
            )
            response.raise_for_status()
            result = response.json()
        except (httpx.HTTPError, ValueError):
            return {"status": "error", "detail": PRICING_UNAVAILABLE}

    if not quote_succeeded(result):
        # The server couldn't price these factors; drop its 0.0 placeholder.
        return {
            "status": "error",
            "detail": result.get("detail") or PRICING_UNAVAILABLE,
        }
    return result


async def end_call(_args: dict[str, Any]) -> dict[str, Any]:
    return {"status": "ending"}


TOOL_HANDLERS = {
    "get_quote": get_quote,
    "end_call": end_call,
}
