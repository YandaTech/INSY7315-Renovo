# Renovo MCP Pricing Server

Calculates renovation job quotes from job factors (job type, scope, urgency,
materials grade, travel zone).

## Run

```
pip install -e .
python server.py
```

Serves on `http://localhost:8001`. `backend/app/services/pricing_service.py`
calls `POST /mcp/pricing` by default.

## Test

```
curl -X POST http://localhost:8001/mcp/pricing \
  -H "Content-Type: application/json" \
  -d '{"job_type": "bathroom_renovation", "scope": "medium", "urgency": "standard", "materials_grade": "standard", "travel_zone": "zone_1", "square_meters": 12}'
```

## Config

Base rates, multipliers, and travel zone fees live in
`config/pricing_rules.json`. Edit that file to tune pricing without touching
code.
