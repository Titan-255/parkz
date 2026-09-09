from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
from app.models.all_models import (
    UserRole, UserStatus, VehicleType, ParkingStatus,
    VerificationStatus, BookingStatus, PaymentStatus, CheckInStatus,
    ComplaintStatus, ComplaintType
)

# ----------------- USER SCHEMAS -----------------

class UserBase(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.DRIVER
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = VehicleType.CAR.value

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    status: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_verified: bool
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

# ----------------- AVAILABILITY SCHEMAS -----------------

class AvailabilityBase(BaseModel):
    day_of_week: int  # 0=Monday, 6=Sunday
    start_time: str = "00:00"
    end_time: str = "23:59"
    available_spaces: int = 1

class AvailabilityCreate(AvailabilityBase):
    pass

class AvailabilityOut(AvailabilityBase):
    id: int
    parking_id: int

    model_config = ConfigDict(from_attributes=True)

# ----------------- PARKING SCHEMAS -----------------

class ParkingImageOut(BaseModel):
    id: int
    image_url: str
    is_primary: bool

    model_config = ConfigDict(from_attributes=True)

class ParkingBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    latitude: float
    longitude: float
    price_per_hour: float
    vehicle_type: str = VehicleType.BOTH.value
    total_spaces: int = 1
    rules: Optional[str] = None
    entrance_instructions: Optional[str] = None

class ParkingCreate(ParkingBase):
    images: Optional[List[str]] = []
    availabilities: Optional[List[AvailabilityCreate]] = []

class ParkingUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_hour: Optional[float] = None
    vehicle_type: Optional[str] = None
    total_spaces: Optional[int] = None
    status: Optional[str] = None
    rules: Optional[str] = None
    entrance_instructions: Optional[str] = None

class ParkingOut(ParkingBase):
    id: int
    owner_id: int
    status: str
    verification_status: str
    created_at: datetime
    images: List[ParkingImageOut] = []
    availabilities: List[AvailabilityOut] = []
    average_rating: Optional[float] = 0.0
    total_reviews: Optional[int] = 0
    available_slots_now: Optional[int] = None
    distance_km: Optional[float] = None
    owner_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ParkingSearchQuery(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = 10.0
    vehicle_type: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "nearest"  # "nearest", "cheapest", "rating"

# ----------------- BOOKING SCHEMAS -----------------

class BookingCalculationRequest(BaseModel):
    parking_id: int
    start_time: datetime
    end_time: datetime

class BookingCalculationOut(BaseModel):
    parking_id: int
    parking_name: str
    price_per_hour: float
    duration_hours: float
    base_price: float
    platform_fee: float
    owner_amount: float
    total_amount: float

class BookingCreate(BaseModel):
    parking_id: int
    start_time: datetime
    end_time: datetime
    vehicle_number: str
    vehicle_type: Optional[str] = VehicleType.CAR.value

class BookingOut(BaseModel):
    id: int
    booking_id: str
    driver_id: int
    parking_id: int
    start_time: datetime
    end_time: datetime
    vehicle_number: str
    vehicle_type: Optional[str]
    amount: float
    base_price: float
    platform_fee: float
    owner_amount: float
    status: str
    payment_status: str
    check_in_status: str
    created_at: datetime
    parking: Optional[ParkingOut] = None
    driver: Optional[UserOut] = None
    can_cancel: Optional[bool] = False
    refund_amount_preview: Optional[float] = 0.0

    model_config = ConfigDict(from_attributes=True)

# ----------------- PAYMENT SCHEMAS -----------------

class PaymentCreate(BaseModel):
    booking_id: str
    provider: str = "mock"

class PaymentVerifyRequest(BaseModel):
    booking_id: str
    provider: str = "mock"
    status: str = "SUCCESS"  # "SUCCESS" or "FAILED"
    transaction_id: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    booking_id: int
    provider: str
    transaction_id: str
    amount: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- QR & CHECK-IN SCHEMAS -----------------

class QRCodeOut(BaseModel):
    id: int
    parking_id: int
    secure_token: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class CheckInRequest(BaseModel):
    booking_id: str
    secure_token: str

class CheckInResponse(BaseModel):
    success: bool
    message: str
    booking_id: str
    parking_name: str
    driver_name: str
    checked_in_at: datetime

# ----------------- REVIEWS -----------------

class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    booking_id: int
    driver_id: int
    parking_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    driver_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- COMPLAINTS / FRAUD -----------------

class ComplaintCreate(BaseModel):
    booking_id: Optional[str] = None
    parking_id: Optional[int] = None
    type: ComplaintType = ComplaintType.OTHER
    description: str

class ComplaintResolveRequest(BaseModel):
    status: ComplaintStatus = ComplaintStatus.RESOLVED
    resolution: str

class ComplaintOut(BaseModel):
    id: int
    booking_id: Optional[int]
    parking_id: Optional[int]
    created_by: int
    type: str
    description: str
    status: str
    resolution: Optional[str]
    created_at: datetime
    creator_name: Optional[str] = None
    creator_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- NOTIFICATIONS -----------------

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    link: Optional[str]
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- DASHBOARD STATS -----------------

class OwnerDashboardStats(BaseModel):
    todays_bookings_count: int
    todays_earnings: float
    total_earnings: float
    total_spaces: int
    active_spaces: int
    utilization_rate: float
    pending_payout: float
    completed_payout: float
    recent_bookings: List[BookingOut] = []
    revenue_chart: List[Dict[str, Any]] = []

class AdminDashboardStats(BaseModel):
    total_users: int
    total_drivers: int
    total_owners: int
    total_parking_spaces: int
    active_parking_spaces: int
    pending_parking_spaces: int
    todays_bookings_count: int
    total_gmv: float
    total_platform_revenue: float
    open_complaints_count: int
    recent_bookings: List[BookingOut] = []
    revenue_chart: List[Dict[str, Any]] = []
    fraud_flags_count: int

# ----------------- AI PARKING ASSISTANT -----------------

class AIChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class AIChatRequest(BaseModel):
    message: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    vehicle_type: Optional[str] = None
    history: Optional[List[AIChatMessage]] = []

class RecommendedParking(BaseModel):
    id: int
    name: str
    address: str
    price_per_hour: float
    distance_km: float
    rating: float
    available_slots: int
    recommendation_reason: str

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []
    recommended_parkings: List[RecommendedParking] = []
