import json
from pathlib import Path
from typing import Any

RULES_PATH = Path(__file__).parent / "config" / "pricing_rules.json"


class PricingEngine:
    """
    Calculates a renovation job quote from a set of job factors, using
    base rates, multipliers, and travel zone fees loaded from
    config/pricing_rules.json.
    """

    def __init__(self, rules_path: Path = RULES_PATH):
        with open(rules_path) as f:
            self.rules = json.load(f)

    def calculate_quote(self, factors: dict[str, Any]) -> dict[str, Any]:
        """
        :param factors: {
            "job_type": "bathroom_renovation",
            "scope": "medium",
            "urgency": "standard",
            "materials_grade": "standard",
            "travel_zone": "zone_1",
            "square_meters": 15 (optional)
        }
        """
        job_type = factors.get("job_type")
        base_rate = self.rules["base_rates"].get(job_type)

        if base_rate is None:
            return {
                "estimated_quote": 0.0,
                "currency": self.rules["currency"],
                "status": "error",
                "detail": f"Unknown job_type: {job_type!r}",
            }

        scope_multiplier = self.rules["scope_multipliers"].get(
            factors.get("scope", "small"), 1.0
        )
        urgency_multiplier = self.rules["urgency_multipliers"].get(
            factors.get("urgency", "standard"), 1.0
        )
        materials_multiplier = self.rules["materials_multipliers"].get(
            factors.get("materials_grade", "standard"), 1.0
        )
        travel_fee = self.rules["travel_zones"].get(
            factors.get("travel_zone", "zone_1"), 0
        )

        square_meters = factors.get("square_meters")
        size_factor = square_meters if isinstance(square_meters, (int, float)) and square_meters > 0 else 1

        subtotal = (
            base_rate
            * size_factor
            * scope_multiplier
            * urgency_multiplier
            * materials_multiplier
        )
        total = max(subtotal + travel_fee, self.rules["minimum_quote"])

        return {
            "estimated_quote": round(total, 2),
            "currency": self.rules["currency"],
            "status": "ok",
            "breakdown": {
                "base_rate": base_rate,
                "size_factor": size_factor,
                "scope_multiplier": scope_multiplier,
                "urgency_multiplier": urgency_multiplier,
                "materials_multiplier": materials_multiplier,
                "travel_fee": travel_fee,
                "subtotal": round(subtotal, 2),
            },
        }
