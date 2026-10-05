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
    allow_origins=["http://localhost:5173"],
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


@app.post("/leads/", tags=["Lead Management"])
async def create_lead(
    name: str,
    contact: str,
    call_sid: str,
    job_details: dict,
    db: Session = Depends(get_db),
):
    """
    Orchestrate lead creation from a call event (Public/Service).
    """
    service = LeadService(db)
    return await service.create_lead_from_call(
        name=name, contact=contact, call_sid=call_sid, job_factors=job_details
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

@app.delete("/leads/{lead_id}", tags=["Lead Management"])
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    repo = LeadRepository(db)
    lead = repo.get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"message": f"Lead {lead_id} deleted successfully"}

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
