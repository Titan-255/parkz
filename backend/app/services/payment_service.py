import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import settings
from app.models.all_models import (
    Booking, BookingStatus, Payment, PaymentStatus, Payout, Notification
)

class PaymentService:
    @staticmethod
    def calculate_breakdown(price_per_hour: float, duration_hours: float):
        # Round duration up to minimum 0.5 hours or standard duration
        effective_hours = max(0.5, round(duration_hours, 2))
        base_price = round(price_per_hour * effective_hours, 2)
        platform_fee = round(base_price * settings.PLATFORM_COMMISSION_RATE, 2)
        total_amount = round(base_price + platform_fee, 2)
        owner_amount = base_price  # Owner receives their full hourly rate
        
        return {
            "duration_hours": effective_hours,
            "base_price": base_price,
            "platform_fee": platform_fee,
            "owner_amount": owner_amount,
            "total_amount": total_amount
        }

    @staticmethod
    def process_mock_payment(db: Session, booking: Booking, simulate_success: bool = True) -> Payment:
        if booking.status not in [BookingStatus.PENDING_PAYMENT.value, BookingStatus.FAILED.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Booking is not in payable state. Current status: {booking.status}"
            )
        
        tx_id = f"MOCK-TXN-{uuid.uuid4().hex[:12].upper()}"
        payment_status = PaymentStatus.PAID.value if simulate_success else PaymentStatus.FAILED.value
        
        # Check existing payment record or create new
        payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
        if not payment:
            payment = Payment(
                booking_id=booking.id,
                provider="mock",
                transaction_id=tx_id,
                amount=booking.amount,
                status=payment_status
            )
            db.add(payment)
        else:
            payment.transaction_id = tx_id
            payment.status = payment_status
            payment.amount = booking.amount
            payment.updated_at = datetime.now(timezone.utc)
        
        if simulate_success:
            booking.status = BookingStatus.CONFIRMED.value
            booking.payment_status = PaymentStatus.PAID.value
            
            # Create Payout record for Owner
            payout = db.query(Payout).filter(Payout.booking_id == booking.id).first()
            if not payout:
                payout = Payout(
                    booking_id=booking.id,
                    owner_id=booking.parking.owner_id,
                    gross_amount=booking.amount,
                    commission=booking.platform_fee,
                    net_amount=booking.owner_amount,
                    status="COMPLETED"
                )
                db.add(payout)
            
            # Create Driver Notification
            db.add(Notification(
                user_id=booking.driver_id,
                title="Booking Confirmed! 🚗",
                message=f"Your parking at '{booking.parking.name}' is confirmed. Booking Code: {booking.booking_id}",
                type="BOOKING_CONFIRMED",
                link=f"/app/bookings/{booking.booking_id}"
            ))
            
            # Create Owner Notification
            db.add(Notification(
                user_id=booking.parking.owner_id,
                title="New Booking Received! 💰",
                message=f"Driver {booking.driver.name} booked '{booking.parking.name}'. You earned ₹{booking.owner_amount:.2f}",
                type="NEW_BOOKING",
                link="/owner/bookings"
            ))
        else:
            booking.status = BookingStatus.FAILED.value
            booking.payment_status = PaymentStatus.FAILED.value
            
            db.add(Notification(
                user_id=booking.driver_id,
                title="Payment Failed ❌",
                message=f"Payment for booking {booking.booking_id} was unsuccessful. You can retry anytime.",
                type="PAYMENT_FAILED",
                link=f"/app/booking/{booking.booking_id}"
            ))
        
        db.commit()
        db.refresh(payment)
        db.refresh(booking)
        return payment
