import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user, require_admin_or_service
from app.models.user import AdminUser
from app.services.pricing_service import PricingService, PricingUnavailable

router = APIRouter(prefix="/pricing", tags=["Pricing Engine"])


@router.post("/calculate")
async def calculate_price(
    factors: dict, caller: str = Depends(require_admin_or_service)
):
    """
    Compute a price estimate via the MCP pricing service (Admin or service key).

    Returns 502 if the pricing server is down and 422 if it can't price the
    given factors, so a failed lookup never comes back as an R0 estimate.
    """
    try:
        result = await PricingService().get_quote_from_mcp(factors)
    except PricingUnavailable:
        raise HTTPException(
            status_code=502,
            detail="Pricing server unavailable, so no estimate was calculated",
        )
    if result.get("status") != "ok":
        raise HTTPException(
            status_code=422,
            detail=result.get("detail") or "Could not calculate an estimate",
        )
    return result


@router.get("/rules")
async def get_pricing_rules(current_user: AdminUser = Depends(get_current_user)):
    """
    Current service prices, surcharges and travel fees (Protected).
    """
    try:
        return await PricingService().get_rules()
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Pricing server unavailable")


@router.put("/rules")
async def update_pricing_rules(
    rules: dict, current_user: AdminUser = Depends(get_current_user)
):
    """
    Save new pricing rules; the AI agent quotes with them immediately (Protected).
    """
    try:
        response = await PricingService().update_rules(rules)
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Pricing server unavailable")
    if response.status_code == 422:
        raise HTTPException(status_code=422, detail=response.json().get("detail"))
    if response.is_error:
        raise HTTPException(status_code=502, detail="Pricing server rejected rules")
    return response.json()
