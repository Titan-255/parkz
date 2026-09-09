from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import Booking, User
from app.schemas.all_schemas import PaymentVerifyRequest, PaymentOut
from app.api.deps import get_current_user
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/verify", response_model=PaymentOut)
def verify_payment(
    verify_req: PaymentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.booking_id == verify_req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.driver_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Forbidden")

    simulate_success = (verify_req.status.upper() == "SUCCESS")
    payment = PaymentService.process_mock_payment(
        db=db,
        booking=booking,
        simulate_success=simulate_success
    )

    return PaymentOut.model_validate(payment)
