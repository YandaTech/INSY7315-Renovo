from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.base import Base
from app.routers import call, lead, pricing

# Automatically create database tables for all registered models inheriting from Base
Base.metadata.create_all(bind=engine)

app = FastAPI(
   title="Renovo Engine API",
    description="Backend orchestration service for automated call logging, lead management, and MCP pricing evaluation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Include modular routers with clean prefixes
app.include_router(call.router, prefix="/calls", tags=["Calls"])
app.include_router(lead.router, prefix="/leads", tags=["Leads"])
app.include_router(pricing.router, prefix="/pricing", tags=["Pricing"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["System"])
def read_root():
    return {"message": "Renovo Engine API is operational."}