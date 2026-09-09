from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.all_models import Complaint, ComplaintStatus, Booking, ParkingSpace, User
from app.schemas.all_schemas import ComplaintCreate, ComplaintOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/complaints", tags=["Complaints & Fraud Reports"])

@router.post("", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED)
def file_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking_db_id = None
    if complaint_in.booking_id:
        booking = db.query(Booking).filter(
            (Booking.booking_id == complaint_in.booking_id) | 
            (Booking.id == (int(complaint_in.booking_id) if complaint_in.booking_id.isdigit() else -1))
        ).first()
        if booking:
            booking_db_id = booking.id
            if not complaint_in.parking_id:
                complaint_in.parking_id = booking.parking_id

    complaint = Complaint(
        booking_id=booking_db_id,
        parking_id=complaint_in.parking_id,
        created_by=current_user.id,
        type=complaint_in.type.value,
        description=complaint_in.description,
        status=ComplaintStatus.OPEN.value
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    return ComplaintOut(
        id=complaint.id,
        booking_id=complaint.booking_id,
        parking_id=complaint.parking_id,
        created_by=complaint.created_by,
        type=complaint.type,
        description=complaint.description,
        status=complaint.status,
        resolution=complaint.resolution,
        created_at=complaint.created_at,
        creator_name=current_user.name,
        creator_email=current_user.email
    )

@router.get("", response_model=List[ComplaintOut])
def get_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaints = db.query(Complaint).filter(Complaint.created_by == current_user.id).order_by(Complaint.created_at.desc()).all()
    return [
        ComplaintOut(
            id=c.id,
            booking_id=c.booking_id,
            parking_id=c.parking_id,
            created_by=c.created_by,
            type=c.type,
            description=c.description,
            status=c.status,
            resolution=c.resolution,
            created_at=c.created_at,
            creator_name=c.creator.name if c.creator else None,
            creator_email=c.creator.email if c.creator else None
        )
        for c in complaints
    ]
