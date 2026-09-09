from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "PARKZ - Park Smarter. Arrive Faster."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    JWT_SECRET: str = "parkz_super_secret_jwt_key_development_2026_secure_hash_string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./parkz.db"
    
    # Payments
    PAYMENT_PROVIDER: str = "mock"  # "mock" or "razorpay"
    RAZORPAY_KEY_ID: Optional[str] = ""
    RAZORPAY_KEY_SECRET: Optional[str] = ""
    
    # Business Rules
    PLATFORM_COMMISSION_RATE: float = 0.20  # 20%
    CANCELLATION_FULL_REFUND_HOURS: float = 2.0  # Full refund if > 2 hrs before start
    CANCELLATION_PARTIAL_REFUND_HOURS: float = 0.0  # Partial refund (50%) if 0-2 hrs before start
    PARTIAL_REFUND_RATE: float = 0.50
    
    # Maps & AI
    MAP_PROVIDER: str = "google"
    MAP_API_KEY: Optional[str] = ""
    GOOGLE_MAPS_API_KEY: Optional[str] = ""
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )

settings = Settings()
