from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.core.database import get_db
from app.models.all_models import (
    User, UserRole, UserStatus, ParkingSpace, ParkingStatus, VerificationStatus,
    Booking, BookingStatus, Payment, Payout, Complaint, ComplaintStatus, Review
)
from app.schemas.all_schemas import (
    AdminDashboardStats, UserOut, ParkingOut, BookingOut, PaymentOut,
    ComplaintOut, ComplaintResolveRequest
)
from app.api.deps import require_admin
from app.api.parking import enrich_parking_out
from app.api.bookings import enrich_booking_out

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/dashboard", response_model=AdminDashboardStats)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)

    # Users counts
    total_users = db.query(User).count()
    total_drivers = db.query(User).filter(User.role == UserRole.DRIVER.value).count()
    total_owners = db.query(User).filter(User.role == UserRole.OWNER.value).count()

    # Parking spaces
    total_spaces = db.query(ParkingSpace).count()
    active_spaces = db.query(ParkingSpace).filter(
        ParkingSpace.status == ParkingStatus.ACTIVE.value,
        ParkingSpace.verification_status == VerificationStatus.APPROVED.value
    ).count()
    pending_spaces = db.query(ParkingSpace).filter(
        ParkingSpace.verification_status == VerificationStatus.PENDING.value
    ).count()

    # Bookings & Financials
    todays_bookings = db.query(Booking).filter(Booking.created_at >= today_start).count()
    
    successful_bookings = db.query(Booking).filter(
        Booking.status.in_([BookingStatus.CONFIRMED.value, BookingStatus.CHECKED_IN.value, BookingStatus.COMPLETED.value])
    ).all()
    total_gmv = sum(b.amount for b in successful_bookings)
    total_platform_revenue = sum(b.platform_fee for b in successful_bookings)

    # Complaints & Fraud
    open_complaints = db.query(Complaint).filter(Complaint.status.in_(["OPEN", "IN_REVIEW"])).count()
    fraud_flags = db.query(Complaint).filter(Complaint.type.in_(["FAKE_LISTING", "UNSAFE_PARKING"])).count()

    # Recent bookings
    recent = db.query(Booking).order_by(Booking.created_at.desc()).limit(10).all()

    # Revenue Chart (last 7 days)
    chart = []
    for d in range(6, -1, -1):
        day_date = (now - timedelta(days=d)).date()
        day_start = datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0, tzinfo=timezone.utc)
        day_end = datetime(day_date.year, day_date.month, day_date.day, 23, 59, 59, tzinfo=timezone.utc)
        
        day_gmv = sum(
            b.amount for b in successful_bookings
            if day_start <= (b.created_at.replace(tzinfo=timezone.utc) if b.created_at.tzinfo is None else b.created_at) <= day_end
        )
        day_rev = sum(
            b.platform_fee for b in successful_bookings
            if day_start <= (b.created_at.replace(tzinfo=timezone.utc) if b.created_at.tzinfo is None else b.created_at) <= day_end
        )
        day_count = len([
            b for b in successful_bookings
            if day_start <= (b.created_at.replace(tzinfo=timezone.utc) if b.created_at.tzinfo is None else b.created_at) <= day_end
        ])
        chart.append({
            "date": day_date.strftime("%b %d"),
            "gmv": round(day_gmv, 2),
            "revenue": round(day_rev, 2),
            "bookings": day_count
        })

    return AdminDashboardStats(
        total_users=total_users,
        total_drivers=total_drivers,
        total_owners=total_owners,
        total_parking_spaces=total_spaces,
        active_parking_spaces=active_spaces,
        pending_parking_spaces=pending_spaces,
        todays_bookings_count=todays_bookings,
        total_gmv=round(total_gmv, 2),
        total_platform_revenue=round(total_platform_revenue, 2),
        open_complaints_count=open_complaints,
        recent_bookings=[enrich_booking_out(b) for b in recent],
        revenue_chart=chart,
        fraud_flags_count=fraud_flags
    )

@router.get("/users", response_model=List[UserOut])
def get_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())
    if search:
        s = f"%{search}%"
        query = query.filter(or_(User.name.ilike(s), User.email.ilike(s), User.phone.ilike(s)))
    
    users = query.order_by(User.created_at.desc()).all()
    return [UserOut.model_validate(u) for u in users]

@router.put("/users/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    status_val: str = Query(..., pattern="^(ACTIVE|SUSPENDED)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = status_val
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)

@router.get("/parking", response_model=List[ParkingOut])
def get_all_parking_spaces(
    verification_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(ParkingSpace)
    if verification_status:
        query = query.filter(ParkingSpace.verification_status == verification_status.upper())
    
    spaces = query.order_by(ParkingSpace.created_at.desc()).all()
    return [enrich_parking_out(s) for s in spaces]

@router.post("/parking/{parking_id}/approve", response_model=ParkingOut)
def approve_parking(
    parking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    parking = db.query(ParkingSpace).filter(ParkingSpace.id == parking_id).first()
    if not parking:
        raise HTTPException(status_code=404, detail="Parking not found")
    
    parking.verification_status = VerificationStatus.APPROVED.value
    parking.status = ParkingStatus.ACTIVE.value
    db.commit()
    db.refresh(parking)
    return enrich_parking_out(parking)

@router.post("/parking/{parking_id}/reject", response_model=ParkingOut)
def reject_parking(
    parking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    parking = db.query(ParkingSpace).filter(ParkingSpace.id == parking_id).first()
    if not parking:
        raise HTTPException(status_code=404, detail="Parking not found")
    
    parking.verification_status = VerificationStatus.REJECTED.value
    db.commit()
    db.refresh(parking)
    return enrich_parking_out(parking)

@router.post("/parking/{parking_id}/suspend", response_model=ParkingOut)
def suspend_parking(
    parking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    parking = db.query(ParkingSpace).filter(ParkingSpace.id == parking_id).first()
    if not parking:
        raise HTTPException(status_code=404, detail="Parking not found")
    
    parking.status = ParkingStatus.SUSPENDED.value
    db.commit()
    db.refresh(parking)
    return enrich_parking_out(parking)

@router.get("/bookings", response_model=List[BookingOut])
def get_all_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    return [enrich_booking_out(b) for b in bookings]

@router.get("/payments")
def get_all_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "transaction_id": p.transaction_id,
            "booking_id": p.booking.booking_id if p.booking else f"PKZ-{p.id}",
            "amount": p.amount,
            "platform_fee": p.booking.platform_fee if p.booking else round(p.amount * 0.20, 2),
            "owner_amount": p.booking.owner_amount if p.booking else round(p.amount * 0.80, 2),
            "provider": p.provider,
            "status": p.status,
            "created_at": p.created_at,
            "driver_name": p.booking.driver.name if p.booking and p.booking.driver else "Driver"
        }
        for p in payments
    ]

@router.get("/complaints", response_model=List[ComplaintOut])
def get_all_complaints(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(Complaint)
    if status_filter:
        query = query.filter(Complaint.status == status_filter.upper())
    
    complaints = query.order_by(Complaint.created_at.desc()).all()
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

@router.post("/complaints/{complaint_id}/resolve", response_model=ComplaintOut)
def resolve_complaint(
    complaint_id: int,
    resolve_data: ComplaintResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.status = resolve_data.status.value
    complaint.resolution = resolve_data.resolution
    complaint.updated_at = datetime.now(timezone.utc)
    
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
        creator_name=complaint.creator.name if complaint.creator else None,
        creator_email=complaint.creator.email if complaint.creator else None
    )
