<<<<<<< HEAD
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.base import Base
from app.routers import call, lead, pricing

# Automatically create database tables for all registered models inheriting from Base
=======
from typing import Literal

import httpx
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user, require_admin_or_service
from app.core.limiter import limiter
from app.db import add_missing_columns, engine, get_db
from app.models.base import Base
from app.models.user import AdminUser
from app.repositories.call_repository import CallRepository
from app.repositories.lead_repository import LeadRepository
from app.routes.auth import router as auth_router
from app.routes.notifications import router as notifications_router
from app.routes.voice import router as voice_router
from app.schemas import LeadOut
from app.services.lead_service import LeadService
from app.services.pricing_service import PricingService

# ==========================================
# Database Table Initialization
# ==========================================
>>>>>>> f7ebb5d44e1ea697001fe01b8d54c056581eed99
Base.metadata.create_all(bind=engine)
add_missing_columns(Base)

LeadStatus = Literal["new", "contacted", "confirmed", "closed", "incomplete"]

app = FastAPI(
    title="Renovo Engine API",
    description="Backend orchestration service for automated call logging, lead management, and MCP pricing evaluation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

<<<<<<< HEAD
# Include modular routers with clean prefixes
app.include_router(call.router, prefix="/calls", tags=["Calls"])
app.include_router(lead.router, prefix="/leads", tags=["Leads"])
app.include_router(pricing.router, prefix="/pricing", tags=["Pricing"])

=======
# Attach Limiter and Exception Handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS MIDDLEWARE
>>>>>>> f7ebb5d44e1ea697001fe01b8d54c056581eed99
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
<<<<<<< HEAD
=======

# ==========================================
# API Routes & Endpoints
# ==========================================
>>>>>>> f7ebb5d44e1ea697001fe01b8d54c056581eed99


@app.get("/", tags=["System"])
def read_root():
<<<<<<< HEAD
    return {"message": "Renovo Engine API is operational."}
=======
    """
    Root health-check endpoint to verify API operational status.
    """
    return {"message": "Renovo Engine API is operational."}


@app.get("/health", tags=["System"])
def health():
    """
    Liveness probe used by the docker-compose healthcheck.
    """
    return {"status": "ok"}


@app.post("/calls/", tags=["Call Operations"])
def log_call(
    call_sid: str,
    duration: int = 0,
    transcript: str = "",
    outcome: str = "initiated",
    db: Session = Depends(get_db),
    caller: str = Depends(require_admin_or_service),
):
    """
    Record a new telephony call log in the database (Admin or service key).
    """
    repo = CallRepository(db)
    return repo.create_call_log(
        call_sid=call_sid, duration=duration, transcript=transcript, outcome=outcome
    )


@app.get("/calls/", tags=["Call Operations"])
def list_calls(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Retrieve a paginated list of call logs (Protected).
    """
    repo = CallRepository(db)
    return repo.get_all_calls(skip=skip, limit=limit)


@app.get("/calls/{call_sid}", tags=["Call Operations"])
def get_call(
    call_sid: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Retrieve a single call log, including its transcript (Protected).
    """
    call = CallRepository(db).get_call_by_sid(call_sid)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call


@app.post("/leads/", tags=["Lead Management"])
async def create_lead(
    name: str,
    contact: str,
    call_sid: str,
    job_details: dict,
    quote: float | None = None,
    status: LeadStatus = "new",
    db: Session = Depends(get_db),
    caller: str = Depends(require_admin_or_service),
):
    """
    Orchestrate lead creation from a call event or a manual log
    (Admin or service key).

    Pass `quote` when one was already given on the call; otherwise the
    pricing server is asked for one from `job_details`.
    """
    service = LeadService(db)
    return await service.create_lead_from_call(
        name=name,
        contact=contact,
        call_sid=call_sid,
        job_factors=job_details,
        quote=quote,
        status=status,
    )


@app.get("/leads/", tags=["Lead Management"], response_model=list[LeadOut])
def list_leads(
    status: LeadStatus | None = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Retrieve leads with optional filtering by status (Protected).
    """
    repo = LeadRepository(db)
    return repo.filter_leads(status=status)


@app.get("/leads/{lead_id}", tags=["Lead Management"], response_model=LeadOut)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Retrieve a single lead by ID (Protected).
    """
    lead = LeadRepository(db).get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@app.patch("/leads/{lead_id}/status", tags=["Lead Management"])
def update_lead_status(
    lead_id: int,
    status: LeadStatus,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Update the lifecycle status of a lead by ID (Protected).
    """
    repo = LeadRepository(db)
    updated = repo.update_lead_status(lead_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return updated


@app.delete(
    "/leads/{lead_id}",
    tags=["Lead Management"],
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Permanently delete a lead by ID (Protected). The call log it came
    from is kept.
    """
    if not LeadRepository(db).delete_lead(lead_id):
        raise HTTPException(status_code=404, detail="Lead not found")


@app.post("/pricing/calculate", tags=["Pricing Engine"])
async def calculate_price(
    factors: dict, caller: str = Depends(require_admin_or_service)
):
    """
    Compute a price estimate via the MCP pricing service (Admin or service key).
    """
    pricing_service = PricingService()
    return await pricing_service.get_quote_from_mcp(factors)


@app.get("/pricing/rules", tags=["Pricing Engine"])
async def get_pricing_rules(current_user: AdminUser = Depends(get_current_user)):
    """
    Current service prices, surcharges and travel fees (Protected).
    """
    try:
        return await PricingService().get_rules()
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Pricing server unavailable")


@app.put("/pricing/rules", tags=["Pricing Engine"])
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


# ==========================================
# Authentication & Security Routes
# ==========================================
app.include_router(auth_router)
app.include_router(voice_router)
app.include_router(notifications_router)
>>>>>>> f7ebb5d44e1ea697001fe01b8d54c056581eed99
