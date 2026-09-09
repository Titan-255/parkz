from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
import app.models.all_models  # Ensure models are registered

# API Routers
from app.api.auth import router as auth_router
from app.api.parking import router as parking_router
from app.api.bookings import router as bookings_router
from app.api.payments import router as payments_router
from app.api.reviews import router as reviews_router
from app.api.complaints import router as complaints_router
from app.api.notifications import router as notifications_router
from app.api.owner import router as owner_router
from app.api.admin import router as admin_router
from app.api.ai import router as ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB Tables on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    # PARKZ - Complete Full-Stack Marketplace API
    **Park smarter. Arrive faster.**
    
    ParkZ converts underused private parking spaces into bookable parking and helps drivers find verified, reliable parking before arrival.
    
    ### Key Features:
    * **Driver Flow**: Search, radius & price filtering, atomic booking, mock payment, instant QR check-in, verified reviews.
    * **Parking Owner Flow**: 9-step listing wizard, availability scheduling, active bookings, net earnings analytics, entrance QR generation.
    * **Admin Dashboard**: Verification engine, user management, system-wide transaction auditing, dispute resolution & fraud monitoring.
    * **Google Maps AI Assistant**: Natural language smart parking advisor and navigation assistant.
    """,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes under /api
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(parking_router, prefix=api_prefix)
app.include_router(bookings_router, prefix=api_prefix)
app.include_router(payments_router, prefix=api_prefix)
app.include_router(reviews_router, prefix=api_prefix)
app.include_router(complaints_router, prefix=api_prefix)
app.include_router(notifications_router, prefix=api_prefix)
app.include_router(owner_router, prefix=api_prefix)
app.include_router(admin_router, prefix=api_prefix)
app.include_router(ai_router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "service": "PARKZ API",
        "tagline": "Park smarter. Arrive faster.",
        "status": "online",
        "docs": "/docs",
        "version": settings.VERSION
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "payment_mode": settings.PAYMENT_PROVIDER
    }
