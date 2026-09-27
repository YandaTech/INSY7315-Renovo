from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.base import Base
from app.repositories.call_repository import CallRepository
from app.repositories.lead_repository import LeadRepository
from app.services.lead_service import LeadService
from app.services.pricing_service import PricingService

# ==========================================
# Database Configuration & Initialization
# ==========================================

# Create database engine
# `connect_args={"check_same_thread": False}` is required for SQLite to allow multiple threads per request
SQLALCHEMY_DATABASE_URL = "sqlite:///./demira.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Create a configurable Session factory bound to the SQLite engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Automatically create database tables for all registered models inheriting from Base
Base.metadata.create_all(bind=engine)

# ==========================================
# FastAPI Application Configuration
# ==========================================
app = FastAPI(
   title="Renovo Engine API",
    description="Backend orchestration service for automated call logging, lead management, and MCP pricing evaluation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

#CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ==========================================
# Dependency Injection
# ==========================================
def get_db():
    """
    FastAPI dependency yielding a transactional database session per request.
    
    Ensures that the database connection is reliably closed after processing 
    a request, even if an exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
def log_call(call_sid: str, duration: int = 0, transcript: str = "", outcome: str = "initiated", db: Session = Depends(get_db)):
    """
    Record a new telephony call log in the database.
    
    Delegates persistence logic to CallRepository.
    """
    repo = CallRepository(db)
    return repo.create_call_log(call_sid=call_sid, duration=duration, transcript=transcript, outcome=outcome)

@app.get("/calls/", tags=["Call Operations"])
def list_calls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a paginated list of call logs.
    """
    repo = CallRepository(db)
    return repo.get_all_calls(skip=skip, limit=limit)

@app.post("/leads/", tags=["Lead Management"])
async def create_lead(name: str, contact: str, call_sid: str, job_details: dict, db: Session = Depends(get_db)):
    """
    Orchestrate lead creation from a call event.
    
    Asynchronously queries the external MCP pricing engine to generate a quote, 
    associates the record with matching call logs, and persists the lead.
    """
    service = LeadService(db)
    return await service.create_lead_from_call(name=name, contact=contact, call_sid=call_sid, job_factors=job_details)

@app.get("/leads/", tags=["Lead Management"])
def list_leads(status: str | None = None, db: Session = Depends(get_db)):
    """
    Retrieve leads with optional filtering by status (e.g., 'new', 'contacted', 'closed').
    """
    repo = LeadRepository(db)
    return repo.filter_leads(status=status)

@app.patch("/leads/{lead_id}/status", tags=["Lead Management"])
def update_lead_status(lead_id: int, status: str, db: Session = Depends(get_db)):
    """
    Update the lifecycle status of a lead by ID.
    
    Raises HTTP 404 Not Found if the lead record does not exist.
    """
    repo = LeadRepository(db)
    updated = repo.update_lead_status(lead_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return updated

@app.post("/pricing/calculate", tags=["Pricing Engine"])
async def calculate_price(factors: dict):
    """
    Proxy endpoint to test and compute price estimates directly via the external MCP pricing service.
    """
    # Instantiate the PricingService and delegate the quote calculation
    pricing_service = PricingService()
    return await pricing_service.get_quote_from_mcp(factors)