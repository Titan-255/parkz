from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.all_models import Review, Booking, BookingStatus, User
from app.schemas.all_schemas import ReviewCreate, ReviewOut
from app.api.deps import get_current_user

router = APIRouter(tags=["Reviews"])

@router.post("/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.booking_id == review_in.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the driver of this booking can leave a review")

    if booking.status != BookingStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail="You can only review a parking session after it has been completed"
        )

    # Check existing review
    existing_review = db.query(Review).filter(Review.booking_id == booking.id).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already submitted a review for this booking")

    review = Review(
        booking_id=booking.id,
        driver_id=current_user.id,
        parking_id=booking.parking_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewOut(
        id=review.id,
        booking_id=review.booking_id,
        driver_id=review.driver_id,
        parking_id=review.parking_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        driver_name=current_user.name
    )

@router.get("/parking/{parking_id}/reviews", response_model=List[ReviewOut])
def get_parking_reviews(
    parking_id: int,
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).filter(Review.parking_id == parking_id).order_by(Review.created_at.desc()).all()
    return [
        ReviewOut(
            id=r.id,
            booking_id=r.booking_id,
            driver_id=r.driver_id,
            parking_id=r.parking_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
            driver_name=r.driver.name if r.driver else "ParkZ Driver"
        )
        for r in reviews
    ]
