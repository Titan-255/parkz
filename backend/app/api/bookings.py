from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.all_models import (
    Booking, BookingStatus, ParkingSpace, User, UserRole
)
from app.schemas.all_schemas import (
    BookingCreate, BookingOut, BookingCalculationRequest, BookingCalculationOut,
    CheckInRequest, CheckInResponse
)
from app.api.deps import get_current_user, require_driver
from app.services.booking_service import BookingService
from app.services.payment_service import PaymentService
from app.services.qr_service import QRService
from app.api.parking import enrich_parking_out

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def enrich_booking_out(b: Booking) -> BookingOut:
    policy = BookingService.evaluate_cancellation_policy(b)
    refund_preview = round(b.amount * policy["refund_rate"], 2) if policy["can_cancel"] else 0.0

    parking_data = enrich_parking_out(b.parking) if b.parking else None

    return BookingOut(
        id=b.id,
        booking_id=b.booking_id,
        driver_id=b.driver_id,
        parking_id=b.parking_id,
        start_time=b.start_time,
        end_time=b.end_time,
        vehicle_number=b.vehicle_number,
        vehicle_type=b.vehicle_type,
        amount=b.amount,
        base_price=b.base_price,
        platform_fee=b.platform_fee,
        owner_amount=b.owner_amount,
        status=b.status,
        payment_status=b.payment_status,
        check_in_status=b.check_in_status,
        created_at=b.created_at,
        parking=parking_data,
        driver=b.driver,
        can_cancel=policy["can_cancel"],
        refund_amount_preview=refund_preview
    )

@router.post("/calculate", response_model=BookingCalculationOut)
def calculate_booking_price(
    calc_in: BookingCalculationRequest,
    db: Session = Depends(get_db)
):
    parking = db.query(ParkingSpace).filter(ParkingSpace.id == calc_in.parking_id).first()
    if not parking:
        raise HTTPException(status_code=404, detail="Parking space not found")
    
    if calc_in.end_time <= calc_in.start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    duration_seconds = (calc_in.end_time - calc_in.start_time).total_seconds()
    duration_hours = max(0.5, duration_seconds / 3600.0)

    pricing = PaymentService.calculate_breakdown(
        price_per_hour=parking.price_per_hour,
        duration_hours=duration_hours
    )

    return BookingCalculationOut(
        parking_id=parking.id,
        parking_name=parking.name,
        price_per_hour=parking.price_per_hour,
        duration_hours=pricing["duration_hours"],
        base_price=pricing["base_price"],
        platform_fee=pricing["platform_fee"],
        owner_amount=pricing["owner_amount"],
        total_amount=pricing["total_amount"]
    )

@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_driver)
):
    booking = BookingService.create_booking(
        db=db,
        driver=current_user,
        parking_id=booking_in.parking_id,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        vehicle_number=booking_in.vehicle_number,
        vehicle_type=booking_in.vehicle_type or "CAR"
    )
    return enrich_booking_out(booking)

@router.get("", response_model=List[BookingOut])
def get_user_bookings(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Booking)
    if current_user.role == UserRole.DRIVER.value:
        query = query.filter(Booking.driver_id == current_user.id)
    elif current_user.role == UserRole.OWNER.value:
        query = query.join(ParkingSpace).filter(ParkingSpace.owner_id == current_user.id)
    # Admin sees all
    
    if status_filter:
        query = query.filter(Booking.status == status_filter.upper())
        
    bookings = query.order_by(Booking.created_at.desc()).all()
    return [enrich_booking_out(b) for b in bookings]

@router.get("/{booking_identifier}", response_model=BookingOut)
def get_booking_details(
    booking_identifier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Booking)
    if booking_identifier.isdigit():
        booking = query.filter(Booking.id == int(booking_identifier)).first()
    else:
        booking = query.filter(Booking.booking_id == booking_identifier).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Authorization
    if current_user.role == UserRole.DRIVER.value and booking.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden access to booking")
    if current_user.role == UserRole.OWNER.value and booking.parking.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden access to booking")

    return enrich_booking_out(booking)

@router.post("/{booking_identifier}/cancel")
def cancel_booking(
    booking_identifier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(
        (Booking.booking_id == booking_identifier) | (Booking.id == (int(booking_identifier) if booking_identifier.isdigit() else -1))
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role == UserRole.DRIVER.value and booking.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    return BookingService.cancel_booking(db, booking, current_user)

@router.post("/{booking_identifier}/check-in", response_model=CheckInResponse)
def check_in_booking(
    booking_identifier: str,
    check_in_data: CheckInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return QRService.process_check_in(
        db=db,
        booking_id=booking_data_id if (booking_data_id := check_in_data.booking_id) else booking_identifier,
        secure_token=check_in_data.secure_token,
        driver=current_user
    )

@router.post("/{booking_identifier}/complete", response_model=BookingOut)
def complete_booking(
    booking_identifier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(
        (Booking.booking_id == booking_identifier) | (Booking.id == (int(booking_identifier) if booking_identifier.isdigit() else -1))
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    completed_booking = BookingService.complete_booking(db, booking, current_user)
    return enrich_booking_out(completed_booking)
