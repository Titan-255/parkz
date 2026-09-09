import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
from app.core.config import settings
from app.models.all_models import (
    Booking, BookingStatus, ParkingSpace, ParkingStatus, VerificationStatus,
    PaymentStatus, User, Payout, Notification
)
from app.services.payment_service import PaymentService

class BookingService:
    @staticmethod
    def generate_booking_code() -> str:
        # e.g., PKZ-872910
        random_digits = uuid.uuid4().int % 1000000
        return f"PKZ-{random_digits:06d}"

    @staticmethod
    def check_availability_and_lock(
        db: Session,
        parking_id: int,
        start_time: datetime,
        end_time: datetime,
        vehicle_type: str = "CAR"
    ) -> ParkingSpace:
        # Fetch parking with row lock if postgres or standard query
        parking = db.query(ParkingSpace).filter(ParkingSpace.id == parking_id).first()
        if not parking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parking space not found"
            )
        
        if parking.verification_status != VerificationStatus.APPROVED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This parking location has not been verified by Admin"
            )
            
        if parking.status != ParkingStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This parking location is currently {parking.status.lower()}"
            )
            
        if parking.vehicle_type != "BOTH" and parking.vehicle_type != vehicle_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This parking spot only accepts {parking.vehicle_type.replace('_', ' ')} vehicles"
            )

        if end_time <= start_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End time must be after start time"
            )

        # Count active overlapping bookings
        active_statuses = [
            BookingStatus.CONFIRMED.value,
            BookingStatus.CHECKED_IN.value,
            BookingStatus.PENDING_PAYMENT.value
        ]
        
        # Overlapping condition: (booking.start_time < end_time) and (booking.end_time > start_time)
        overlapping_count = db.query(Booking).filter(
            Booking.parking_id == parking_id,
            Booking.status.in_(active_statuses),
            and_(
                Booking.start_time < end_time,
                Booking.end_time > start_time
            )
        ).count()

        if overlapping_count >= parking.total_spaces:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Parking space is fully booked for the requested time interval. Please choose another time or location."
            )

        return parking

    @staticmethod
    def create_booking(
        db: Session,
        driver: User,
        parking_id: int,
        start_time: datetime,
        end_time: datetime,
        vehicle_number: str,
        vehicle_type: str = "CAR"
    ) -> Booking:
        # Atomic availability check
        parking = BookingService.check_availability_and_lock(
            db=db,
            parking_id=parking_id,
            start_time=start_time,
            end_time=end_time,
            vehicle_type=vehicle_type
        )

        duration_seconds = (end_time - start_time).total_seconds()
        duration_hours = max(0.5, duration_seconds / 3600.0)
        
        pricing = PaymentService.calculate_breakdown(
            price_per_hour=parking.price_per_hour,
            duration_hours=duration_hours
        )

        booking_code = BookingService.generate_booking_code()
        
        booking = Booking(
            booking_id=booking_code,
            driver_id=driver.id,
            parking_id=parking.id,
            start_time=start_time,
            end_time=end_time,
            vehicle_number=vehicle_number,
            vehicle_type=vehicle_type,
            base_price=pricing["base_price"],
            platform_fee=pricing["platform_fee"],
            owner_amount=pricing["owner_amount"],
            amount=pricing["total_amount"],
            status=BookingStatus.PENDING_PAYMENT.value,
            payment_status=PaymentStatus.PENDING.value
        )

        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def evaluate_cancellation_policy(booking: Booking):
        now = datetime.now(timezone.utc)
        # Handle naive datetime comparisons if any
        start = booking.start_time
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
            
        hours_before_start = (start - now).total_seconds() / 3600.0
        
        if hours_before_start >= settings.CANCELLATION_FULL_REFUND_HOURS:
            return {"can_cancel": True, "refund_rate": 1.0, "reason": "Full refund (>2 hours prior)"}
        elif hours_before_start > 0:
            return {"can_cancel": True, "refund_rate": settings.PARTIAL_REFUND_RATE, "reason": f"Partial {int(settings.PARTIAL_REFUND_RATE*100)}% refund (<2 hours prior)"}
        else:
            return {"can_cancel": False, "refund_rate": 0.0, "reason": "No refund after booking start time"}

    @staticmethod
    def cancel_booking(db: Session, booking: Booking, user: User) -> dict:
        if booking.status not in [BookingStatus.CONFIRMED.value, BookingStatus.PENDING_PAYMENT.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel booking with current status '{booking.status}'"
            )

        policy = BookingService.evaluate_cancellation_policy(booking)
        if not policy["can_cancel"] and user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cancellation not allowed: {policy['reason']}"
            )

        refund_amount = round(booking.amount * policy["refund_rate"], 2)
        booking.status = BookingStatus.CANCELLED.value
        if booking.payment_status == PaymentStatus.PAID.value:
            booking.payment_status = PaymentStatus.REFUNDED.value

        # Update Payout if existed
        payout = db.query(Payout).filter(Payout.booking_id == booking.id).first()
        if payout:
            payout.status = "CANCELLED"

        # Notification
        db.add(Notification(
            user_id=booking.driver_id,
            title="Booking Cancelled ℹ️",
            message=f"Booking {booking.booking_id} was cancelled. Refund: ₹{refund_amount:.2f} ({policy['reason']}).",
            type="BOOKING_CANCELLED"
        ))

        db.commit()
        db.refresh(booking)

        return {
            "booking_id": booking.booking_id,
            "status": booking.status,
            "refund_amount": refund_amount,
            "reason": policy["reason"]
        }

    @staticmethod
    def complete_booking(db: Session, booking: Booking, user: User) -> Booking:
        if booking.status != BookingStatus.CHECKED_IN.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only checked-in bookings can be marked as completed"
            )
        booking.status = BookingStatus.COMPLETED.value
        booking.updated_at = datetime.now(timezone.utc)
        
        db.add(Notification(
            user_id=booking.driver_id,
            title="Parking Completed! ⭐",
            message=f"Hope you had a smooth parking experience at '{booking.parking.name}'. Please leave a rating!",
            type="PARKING_COMPLETED",
            link=f"/app/bookings/{booking.booking_id}"
        ))
        
        db.commit()
        db.refresh(booking)
        return booking
