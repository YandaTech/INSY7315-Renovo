from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "Renovo AI Voice Quotation System"
    ENVIRONMENT: str = Field(default="development", validation_alias="ENVIRONMENT")

    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./demira.db", validation_alias="DATABASE_URL"
    )

    # JWT & Security
    SECRET_KEY: str = Field(
        default="renovo-dev-secret-key-change-in-production-wil-2026",
        validation_alias="SECRET_KEY",
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Integrations
    TWILIO_ACCOUNT_SID: str = Field(default="", validation_alias="TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: str = Field(default="", validation_alias="TWILIO_AUTH_TOKEN")
    ANTHROPIC_API_KEY: str = Field(default="", validation_alias="ANTHROPIC_API_KEY")
    PRICING_SERVER_URL: str = Field(
        default="http://localhost:8001/mcp/pricing",
        validation_alias="PRICING_SERVER_URL",
    )

    # Comma-separated list of origins allowed to call the API from a browser
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173", validation_alias="CORS_ORIGINS"
    )

    # Read backend/.env first, then the repo-root .env shared by every service
    model_config = {"env_file": ("../.env", ".env"), "extra": "ignore"}


settings = Settings()
