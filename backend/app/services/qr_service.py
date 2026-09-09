import secrets
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.all_models import (
    QRCode, CheckIn, Booking, BookingStatus, CheckInStatus, User
)

class QRService:
    @staticmethod
    def generate_parking_qr(db: Session, parking_id: int) -> QRCode:
        qr = db.query(QRCode).filter(QRCode.parking_id == parking_id).first()
        if not qr:
            secure_token = f"PARKZ-QR-{secrets.token_urlsafe(24)}"
            qr = QRCode(
                parking_id=parking_id,
                secure_token=secure_token,
                status="ACTIVE"
            )
            db.add(qr)
            db.commit()
            db.refresh(qr)
        return qr

    @staticmethod
    def process_check_in(db: Session, booking_id: str, secure_token: str, driver: User):
        # 1. Fetch booking
        booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid booking ID"
            )
        
        # 2. Verify driver ownership (or admin override)
        if booking.driver_id != driver.id and driver.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This booking does not belong to your account"
            )
        
        # 3. Verify status
        if booking.status == BookingStatus.CANCELLED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot check in: Booking has been cancelled"
            )
        if booking.status in [BookingStatus.PENDING_PAYMENT.value, BookingStatus.FAILED.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot check in: Payment has not been completed"
            )
        if booking.check_in_status == CheckInStatus.CHECKED_IN.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already checked in for this booking"
            )
        
        # 4. Verify QR Token matches the parking spot
        qr = db.query(QRCode).filter(QRCode.secure_token == secure_token).first()
        if not qr:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid QR code scanned"
            )
        if qr.parking_id != booking.parking_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Wrong parking location! The scanned QR code belongs to a different parking facility."
            )
        
        # 5. Check-in record and update booking status
        check_in = CheckIn(
            booking_id=booking.id,
            parking_id=booking.parking_id,
            driver_id=driver.id,
            qr_id=qr.id,
            checked_in_at=datetime.now(timezone.utc),
            status="VALID"
        )
        db.add(check_in)
        
        booking.check_in_status = CheckInStatus.CHECKED_IN.value
        booking.status = BookingStatus.CHECKED_IN.value
        booking.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(booking)
        
        return {
            "success": True,
            "message": "Check-in successful! Welcome to " + booking.parking.name,
            "booking_id": booking.booking_id,
            "parking_name": booking.parking.name,
            "driver_name": driver.name,
            "checked_in_at": check_in.checked_in_at
        }
