from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db import engine, get_db
from app.models.base import Base
from app.models.user import AdminUser
from app.repositories.call_repository import CallRepository
from app.repositories.lead_repository import LeadRepository
from app.services.lead_service import LeadService
from app.services.pricing_service import PricingService
from app.routes.auth import router as auth_router
from app.core.config import settings
from app.core.dependencies import get_current_user

# ==========================================
# Database Table Initialization
# ==========================================
Base.metadata.create_all(bind=engine)

# ==========================================
# FastAPI Application Configuration
# ==========================================
app = FastAPI(
    title="Renovo Engine API",
    description="Backend orchestration service for automated call logging, lead management, and MCP pricing evaluation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# API Routes & Endpoints
# ==========================================


@app.get("/", tags=["System"])
def read_root():
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
):
    """
    Record a new telephony call log in the database (Public/Webhook).
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
    status: str = "new",
    db: Session = Depends(get_db),
):
    """
    Orchestrate lead creation from a call event (Public/Service).

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


@app.get("/leads/", tags=["Lead Management"])
def list_leads(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Retrieve leads with optional filtering by status (Protected).
    """
    repo = LeadRepository(db)
    return repo.filter_leads(status=status)


@app.patch("/leads/{lead_id}/status", tags=["Lead Management"])
def update_lead_status(
    lead_id: int,
    status: str,
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


@app.post("/pricing/calculate", tags=["Pricing Engine"])
async def calculate_price(factors: dict):
    """
    Proxy endpoint to test and compute price estimates directly via MCP service.
    """
    pricing_service = PricingService()
    return await pricing_service.get_quote_from_mcp(factors)


# ==========================================
# Authentication & Security Routes
# ==========================================
app.include_router(auth_router)
