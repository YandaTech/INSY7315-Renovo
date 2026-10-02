from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Renovo AI Voice Quotation System"
    ENVIRONMENT: str = Field(default="development", validation_alias="ENVIRONMENT")
    
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./demira.db", validation_alias="DATABASE_URL")
    
    # JWT & Security
    SECRET_KEY: str = Field(default="renovo-dev-secret-key-change-in-production-wil-2026", validation_alias="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Integrations
    TWILIO_ACCOUNT_SID: str = Field(default="", validation_alias="TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: str = Field(default="", validation_alias="TWILIO_AUTH_TOKEN")
    ANTHROPIC_API_KEY: str = Field(default="", validation_alias="ANTHROPIC_API_KEY")

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()