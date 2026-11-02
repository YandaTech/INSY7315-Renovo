from fastapi import APIRouter
from app.services.pricing_service import PricingService

router = APIRouter(tags=["Pricing"])

@router.post("/calculate")
async def calculate_price(factors: dict):
    pricing_service = PricingService()
    return await pricing_service.get_quote_from_mcp(factors)