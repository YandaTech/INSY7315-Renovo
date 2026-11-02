from fastapi import FastAPI, HTTPException
from pricing_engine import PricingEngine, RulesError

app = FastAPI(
    title="Renovo MCP Pricing Server",
    description="Calculates Renovo Cape job quotes from job factors.",
    version="2.0.0",
)

engine = PricingEngine()


@app.get("/", tags=["System"])
def read_root():
    return {"message": "Renovo MCP Pricing Server is operational."}


@app.post("/mcp/pricing", tags=["Pricing"])
def get_quote(factors: dict):
    """
    Matches the contract expected by backend/app/services/pricing_service.py:
    POST a job factors dict, get back {"estimated_quote", "currency", "status", ...}.
    """
    return engine.calculate_quote(factors)


@app.get("/mcp/pricing/rules", tags=["Pricing"])
def get_rules():
    return engine.rules


@app.put("/mcp/pricing/rules", tags=["Pricing"])
def put_rules(rules: dict):
    """Replaces the pricing rules (the dashboard Pricing page saves here)."""
    try:
        return engine.update_rules(rules)
    except RulesError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
