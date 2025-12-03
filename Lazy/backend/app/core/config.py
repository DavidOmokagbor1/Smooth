"""
Application Configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Lazy API"
    
    # Database
    # Format: postgresql+asyncpg://user:password@localhost:5432/dbname
    DATABASE_URL: Optional[str] = None
    
    # AI Service API Keys (will be added as we integrate)
    OPENAI_API_KEY: Optional[str] = None
    HUME_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

