import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, 
    Text, Enum as SAEnum, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    OWNER = "OWNER"
    DRIVER = "DRIVER"

class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    PENDING = "PENDING"

class VehicleType(str, enum.Enum):
    CAR = "CAR"
    TWO_WHEELER = "TWO_WHEELER"
    BOTH = "BOTH"

class ParkingStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    SUSPENDED = "SUSPENDED"

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class BookingStatus(str, enum.Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    REFUNDED = "REFUNDED"
    FAILED = "FAILED"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class CheckInStatus(str, enum.Enum):
    PENDING = "PENDING"
    CHECKED_IN = "CHECKED_IN"

class ComplaintStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_REVIEW = "IN_REVIEW"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class ComplaintType(str, enum.Enum):
    PARKING_UNAVAILABLE = "PARKING_UNAVAILABLE"
    WRONG_LOCATION = "WRONG_LOCATION"
    OWNER_ISSUE = "OWNER_ISSUE"
    DRIVER_ISSUE = "DRIVER_ISSUE"
    PAYMENT_ISSUE = "PAYMENT_ISSUE"
    VEHICLE_DAMAGE = "VEHICLE_DAMAGE"
    FAKE_LISTING = "FAKE_LISTING"
    UNSAFE_PARKING = "UNSAFE_PARKING"
    OTHER = "OTHER"

# ----------------- MODELS -----------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.DRIVER.value, nullable=False, index=True)
    
    # Driver specific
    vehicle_number = Column(String(50), nullable=True)
    vehicle_type = Column(String(30), default=VehicleType.CAR.value, nullable=True)
    
    is_verified = Column(Boolean, default=True)
    status = Column(String(20), default=UserStatus.ACTIVE.value, nullable=False)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    parking_spaces = relationship("ParkingSpace", back_populates="owner", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="driver", foreign_keys="Booking.driver_id")
    reviews = relationship("Review", back_populates="driver")
    complaints = relationship("Complaint", back_populates="creator", foreign_keys="Complaint.created_by")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class ParkingSpace(Base):
    __tablename__ = "parking_spaces"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    price_per_hour = Column(Float, nullable=False)
    vehicle_type = Column(String(30), default=VehicleType.BOTH.value, nullable=False)
    total_spaces = Column(Integer, default=1, nullable=False)
    status = Column(String(20), default=ParkingStatus.ACTIVE.value, nullable=False, index=True)
    verification_status = Column(String(20), default=VerificationStatus.PENDING.value, nullable=False, index=True)
    
    rules = Column(Text, nullable=True)
    entrance_instructions = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    owner = relationship("User", back_populates="parking_spaces")
    images = relationship("ParkingImage", back_populates="parking", cascade="all, delete-orphan")
    availabilities = relationship("Availability", back_populates="parking", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="parking")
    qr_code = relationship("QRCode", back_populates="parking", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="parking")


class ParkingImage(Base):
    __tablename__ = "parking_images"

    id = Column(Integer, primary_key=True, index=True)
    parking_id = Column(Integer, ForeignKey("parking_spaces.id"), nullable=False)
    image_url = Column(String(1000), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    parking = relationship("ParkingSpace", back_populates="images")


class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    parking_id = Column(Integer, ForeignKey("parking_spaces.id"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday or 0-6
    start_time = Column(String(10), nullable=False, default="00:00")  # HH:MM
    end_time = Column(String(10), nullable=False, default="23:59")    # HH:MM
    available_spaces = Column(Integer, nullable=False)

    parking = relationship("ParkingSpace", back_populates="availabilities")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(String(64), unique=True, index=True, nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    parking_id = Column(Integer, ForeignKey("parking_spaces.id"), nullable=False, index=True)
    
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    vehicle_number = Column(String(50), nullable=False)
    vehicle_type = Column(String(30), default=VehicleType.CAR.value)
    
    # Financial breakdown
    amount = Column(Float, nullable=False)         # Total charged to driver
    base_price = Column(Float, default=0.0)       # Base calculation
    platform_fee = Column(Float, nullable=False)   # Commission kept by ParkZ
    owner_amount = Column(Float, nullable=False)   # Net to owner
    
    status = Column(String(30), default=BookingStatus.PENDING_PAYMENT.value, nullable=False, index=True)
    payment_status = Column(String(30), default=PaymentStatus.PENDING.value, nullable=False)
    check_in_status = Column(String(30), default=CheckInStatus.PENDING.value, nullable=False)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    driver = relationship("User", back_populates="bookings", foreign_keys=[driver_id])
    parking = relationship("ParkingSpace", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    payout = relationship("Payout", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    review = relationship("Review", back_populates="booking", uselist=False)
    check_in = relationship("CheckIn", back_populates="booking", uselist=False)
    complaints = relationship("Complaint", back_populates="booking")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    provider = Column(String(50), default="mock", nullable=False)
    transaction_id = Column(String(100), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(30), default=PaymentStatus.PENDING.value, nullable=False)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    booking = relationship("Booking", back_populates="payment")


class Payout(Base):
    __tablename__ = "payouts"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    gross_amount = Column(Float, nullable=False)
    commission = Column(Float, nullable=False)
    net_amount = Column(Float, nullable=False)
    status = Column(String(30), default="COMPLETED", nullable=False)
    
    created_at = Column(DateTime, default=utcnow)

    booking = relationship("Booking", back_populates="payout")


class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True, index=True)
    parking_id = Column(Integer, ForeignKey("parking_spaces.id"), unique=True, nullable=False)
    secure_token = Column(String(128), unique=True, nullable=False, index=True)
    status = Column(String(20), default="ACTIVE", nullable=False)
    
    created_at = Column(DateTime, default=utcnow)

    parking = relationship("ParkingSpace", back_populates="qr_code")


class CheckIn(Base):
    __tablename__ = "check_ins"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    parking_id = Column(Integer, ForeignKey("parking_spaces.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    qr_id = Column(Integer, ForeignKey("qr_codes.id"), nullable=True)
    checked_in_at = Column(DateTime, default=utcnow)
    status = Column(String(20), default="VALID", nullable=False)

    booking = relationship("Booking", back_populates="check_in")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    parking_id = Column(Integer, ForeignKey("parking_spaces.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    driver = relationship("User", back_populates="reviews")
    parking = relationship("ParkingSpace", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    parking_id = Column(Integer, ForeignKey("parking_spaces.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), default=ComplaintType.OTHER.value, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(30), default=ComplaintStatus.OPEN.value, nullable=False)
    resolution = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    creator = relationship("User", back_populates="complaints", foreign_keys=[created_by])
    booking = relationship("Booking", back_populates="complaints")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO", nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
