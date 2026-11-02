# Renovo MCP Pricing Server

Calculates Renovo Cape job estimates from job factors: service, material,
damage level, quantity, and travel zone.

```
base_price x quantity x (1 + material% + damage%) + travel fee
```

## Run

```
pip install -e .
python server.py
```

Serves on `http://localhost:8001`. `backend/app/services/pricing_service.py`
calls `POST /mcp/pricing` by default.

## API

- `POST /mcp/pricing` - quote from job factors
- `GET /mcp/pricing/rules` - current rules
- `PUT /mcp/pricing/rules` - validate, save and apply new rules (the
  dashboard Pricing page saves here through the backend)

```
curl -X POST http://localhost:8001/mcp/pricing \
  -H "Content-Type: application/json" \
  -d '{"job_type": "bath_reenamel", "material": "enamel", "damage_level": "general_wear", "travel_zone": "southern_suburbs"}'
```

## Config

Service prices, material and damage surcharges, and travel zone fees live
in `config/pricing_rules.json`. Staff edit them from the dashboard Pricing
page; keys (e.g. `bath_reenamel`) must stay in sync with the enums in
`ai-agent/tools.py`.

## Test

```
python -m pytest tests
```
