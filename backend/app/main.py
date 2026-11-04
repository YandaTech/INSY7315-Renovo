from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import limiter
from app.routes.audit import router as audit_router
from app.routes.auth import router as auth_router
from app.routes.calls import router as calls_router
from app.routes.leads import router as leads_router
from app.routes.notifications import router as notifications_router
from app.routes.pricing import router as pricing_router
from app.routes.users import router as users_router
from app.routes.voice import router as voice_router

# The schema is created and upgraded by Alembic (python -m app.migrate),
# which the container runs before starting the API.

# ==========================================
# FastAPI Application Configuration
# ==========================================
# The interactive docs and the OpenAPI schema map out every endpoint, so
# they are only served outside production.
IS_PRODUCTION = settings.ENVIRONMENT.lower() == "production"

app = FastAPI(
    title="Renovo Engine API",
    description="Backend orchestration service for automated call logging, lead management, and MCP pricing evaluation.",
    version="1.0.0",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

# Attach Limiter and Exception Handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


# ==========================================
# Routers
# ==========================================
app.include_router(calls_router)
app.include_router(leads_router)
app.include_router(pricing_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(audit_router)
app.include_router(voice_router)
app.include_router(notifications_router)
