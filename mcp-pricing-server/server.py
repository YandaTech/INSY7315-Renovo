from fastapi import FastAPI
from pricing_engine import PricingEngine

app = FastAPI(
    title="Renovo MCP Pricing Server",
    description="Calculates renovation job quotes from job factors.",
    version="1.0.0",
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
