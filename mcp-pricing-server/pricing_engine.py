import json
from pathlib import Path
from typing import Any

RULES_PATH = Path(__file__).parent / "config" / "pricing_rules.json"

RULE_SECTIONS = {
    "services": "base_price",
    "material_surcharges": "percent",
    "damage_surcharges": "percent",
    "travel_zones": "fee",
}


class RulesError(ValueError):
    pass


def validate_rules(rules: dict[str, Any]) -> None:
    """Raises RulesError unless every section exists with non-negative numbers."""
    if not isinstance(rules.get("currency"), str):
        raise RulesError("currency must be a string")

    for section, number_field in RULE_SECTIONS.items():
        entries = rules.get(section)
        if not isinstance(entries, dict) or not entries:
            raise RulesError(f"{section} must be a non-empty object")
        for key, entry in entries.items():
            value = entry.get(number_field) if isinstance(entry, dict) else None
            if not isinstance(value, (int, float)) or value < 0:
                raise RulesError(
                    f"{section}.{key}.{number_field} must be a non-negative number"
                )


class PricingEngine:
    """
    Quotes Renovo Cape jobs from config/pricing_rules.json:

        base_price x quantity x (1 + material% + damage%) + travel fee

    Material and damage percentages are added to the base rate, matching
    how the business prices them on the dashboard Pricing page.
    """

    def __init__(self, rules_path: Path = RULES_PATH):
        self.rules_path = rules_path
        with open(rules_path) as f:
            self.rules = json.load(f)
        validate_rules(self.rules)

    def update_rules(self, rules: dict[str, Any]) -> dict[str, Any]:
        """Validates, persists and starts using new rules."""
        validate_rules(rules)
        with open(self.rules_path, "w") as f:
            json.dump(rules, f, indent=2)
            f.write("\n")
        self.rules = rules
        return rules

    def _error(self, detail: str) -> dict[str, Any]:
        return {
            "estimated_quote": 0.0,
            "currency": self.rules["currency"],
            "status": "error",
            "detail": detail,
        }

    def calculate_quote(self, factors: dict[str, Any]) -> dict[str, Any]:
        """
        :param factors: {
            "job_type": "bath_reenamel",
            "material": "enamel" (optional),
            "damage_level": "general_wear" (optional, defaults to minor),
            "travel_zone": "southern_suburbs",
            "quantity": 1 (optional)
        }
        """
        service = self.rules["services"].get(factors.get("job_type"))
        if service is None:
            return self._error(f"Unknown job_type: {factors.get('job_type')!r}")

        zone = self.rules["travel_zones"].get(factors.get("travel_zone"))
        if zone is None:
            return self._error(f"Unknown travel_zone: {factors.get('travel_zone')!r}")

        material_key = factors.get("material")
        material = self.rules["material_surcharges"].get(material_key)
        if material_key and material is None:
            return self._error(f"Unknown material: {material_key!r}")

        damage = self.rules["damage_surcharges"].get(
            factors.get("damage_level") or "minor"
        )
        if damage is None:
            return self._error(
                f"Unknown damage_level: {factors.get('damage_level')!r}"
            )

        quantity = factors.get("quantity")
        if not isinstance(quantity, (int, float)) or quantity < 1:
            quantity = 1

        material_percent = material["percent"] if material else 0
        surcharge = (material_percent + damage["percent"]) / 100
        subtotal = service["base_price"] * quantity * (1 + surcharge)
        total = subtotal + zone["fee"]

        return {
            "estimated_quote": round(total, 2),
            "currency": self.rules["currency"],
            "status": "ok",
            "breakdown": {
                "service": service["label"],
                "base_price": service["base_price"],
                "quantity": quantity,
                "material_percent": material_percent,
                "damage_percent": damage["percent"],
                "travel_zone": zone["label"],
                "travel_fee": zone["fee"],
                "subtotal": round(subtotal, 2),
            },
        }
