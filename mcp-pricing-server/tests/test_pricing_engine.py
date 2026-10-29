import json
import shutil

import pytest

from pricing_engine import RULES_PATH, PricingEngine, RulesError


@pytest.fixture
def engine(tmp_path):
    rules_copy = tmp_path / "pricing_rules.json"
    shutil.copy(RULES_PATH, rules_copy)
    return PricingEngine(rules_copy)


def test_bath_with_material_damage_and_travel(engine):
    quote = engine.calculate_quote(
        {
            "job_type": "bath_reenamel",
            "material": "enamel",
            "damage_level": "general_wear",
            "travel_zone": "southern_suburbs",
        }
    )
    # 2600 x (1 + 10% + 10%) + 250
    assert quote["status"] == "ok"
    assert quote["estimated_quote"] == 3370.0


def test_quantity_and_defaults(engine):
    quote = engine.calculate_quote(
        {"job_type": "sink_reenamel", "travel_zone": "northern_suburbs", "quantity": 2}
    )
    # 1800 x 2, no material, minor damage (0%), + 150
    assert quote["estimated_quote"] == 3750.0


@pytest.mark.parametrize(
    "factors",
    [
        {"job_type": "roofing", "travel_zone": "cbd"},
        {"job_type": "bath_reenamel", "travel_zone": "johannesburg"},
        {"job_type": "bath_reenamel", "travel_zone": "cbd", "material": "gold"},
        {"job_type": "bath_reenamel", "travel_zone": "cbd", "damage_level": "x"},
    ],
)
def test_unknown_factors_error(engine, factors):
    assert engine.calculate_quote(factors)["status"] == "error"


def test_update_rules_persists(engine):
    rules = json.loads(json.dumps(engine.rules))
    rules["services"]["bath_reenamel"]["base_price"] = 3000
    engine.update_rules(rules)

    assert PricingEngine(engine.rules_path).rules["services"]["bath_reenamel"][
        "base_price"
    ] == 3000


def test_update_rules_rejects_negative(engine):
    rules = json.loads(json.dumps(engine.rules))
    rules["travel_zones"]["cbd"]["fee"] = -5
    with pytest.raises(RulesError):
        engine.update_rules(rules)
