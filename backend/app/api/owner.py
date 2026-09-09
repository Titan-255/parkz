from typing import List
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.all_models import (
    ParkingSpace, Booking, BookingStatus, Payout, User, ParkingStatus
)
from app.schemas.all_schemas import (
    OwnerDashboardStats, ParkingOut, BookingOut
)
from app.api.deps import require_owner
from app.api.parking import enrich_parking_out
from app.api.bookings import enrich_booking_out

router = APIRouter(prefix="/owner", tags=["Parking Owner"])

@router.get("/dashboard", response_model=OwnerDashboardStats)
def get_owner_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)

    # Owner spaces
    spaces = db.query(ParkingSpace).filter(ParkingSpace.owner_id == current_user.id).all()
    space_ids = [s.id for s in spaces]
    total_spaces_count = sum(s.total_spaces for s in spaces)
    active_spaces_count = len([s for s in spaces if s.status == ParkingStatus.ACTIVE.value])

    if not space_ids:
        return OwnerDashboardStats(
            todays_bookings_count=0,
            todays_earnings=0.0,
            total_earnings=0.0,
            total_spaces=0,
            active_spaces=0,
            utilization_rate=0.0,
            pending_payout=0.0,
            completed_payout=0.0,
            recent_bookings=[],
            revenue_chart=[]
        )

    # Bookings today
    todays_bookings = db.query(Booking).filter(
        Booking.parking_id.in_(space_ids),
        Booking.created_at >= today_start,
        Booking.status.in_([BookingStatus.CONFIRMED.value, BookingStatus.CHECKED_IN.value, BookingStatus.COMPLETED.value])
    ).all()
    todays_earnings = sum(b.owner_amount for b in todays_bookings)

    # Total earnings
    all_completed_bookings = db.query(Booking).filter(
        Booking.parking_id.in_(space_ids),
        Booking.status.in_([BookingStatus.CONFIRMED.value, BookingStatus.CHECKED_IN.value, BookingStatus.COMPLETED.value])
    ).all()
    total_earnings = sum(b.owner_amount for b in all_completed_bookings)

    # Utilization rate calculation (active checked-in or confirmed today vs total available)
    active_occupied = db.query(Booking).filter(
        Booking.parking_id.in_(space_ids),
        Booking.status.in_([BookingStatus.CONFIRMED.value, BookingStatus.CHECKED_IN.value]),
        Booking.start_time <= now,
        Booking.end_time >= now
    ).count()
    utilization_rate = round((active_occupied / max(1, total_spaces_count)) * 100.0, 1)

    # Payouts
    payouts = db.query(Payout).filter(Payout.owner_id == current_user.id).all()
    pending_payout = sum(p.net_amount for p in payouts if p.status == "PENDING")
    completed_payout = sum(p.net_amount for p in payouts if p.status == "COMPLETED")

    # Recent bookings
    recent = db.query(Booking).filter(
        Booking.parking_id.in_(space_ids)
    ).order_by(Booking.created_at.desc()).limit(10).all()

    # Revenue chart (last 7 days)
    chart = []
    for d in range(6, -1, -1):
        day_date = (now - timedelta(days=d)).date()
        day_start = datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0, tzinfo=timezone.utc)
        day_end = datetime(day_date.year, day_date.month, day_date.day, 23, 59, 59, tzinfo=timezone.utc)
        
        day_rev = sum(
            b.owner_amount for b in all_completed_bookings
            if day_start <= (b.created_at.replace(tzinfo=timezone.utc) if b.created_at.tzinfo is None else b.created_at) <= day_end
        )
        day_count = len([
            b for b in all_completed_bookings
            if day_start <= (b.created_at.replace(tzinfo=timezone.utc) if b.created_at.tzinfo is None else b.created_at) <= day_end
        ])
        chart.append({
            "date": day_date.strftime("%b %d"),
            "revenue": round(day_rev, 2),
            "bookings": day_count
        })

    return OwnerDashboardStats(
        todays_bookings_count=len(todays_bookings),
        todays_earnings=round(todays_earnings, 2),
        total_earnings=round(total_earnings, 2),
        total_spaces=total_spaces_count,
        active_spaces=active_spaces_count,
        utilization_rate=utilization_rate,
        pending_payout=round(pending_payout, 2),
        completed_payout=round(completed_payout, 2),
        recent_bookings=[enrich_booking_out(b) for b in recent],
        revenue_chart=chart
    )

@router.get("/parking", response_model=List[ParkingOut])
def get_owner_parking_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    spaces = db.query(ParkingSpace).filter(
        ParkingSpace.owner_id == current_user.id
    ).order_by(ParkingSpace.created_at.desc()).all()
    return [enrich_parking_out(s) for s in spaces]

@router.get("/bookings", response_model=List[BookingOut])
def get_owner_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    spaces = db.query(ParkingSpace).filter(ParkingSpace.owner_id == current_user.id).all()
    space_ids = [s.id for s in spaces]
    if not space_ids:
        return []
    
    bookings = db.query(Booking).filter(
        Booking.parking_id.in_(space_ids)
    ).order_by(Booking.created_at.desc()).all()
    return [enrich_booking_out(b) for b in bookings]

@router.get("/earnings")
def get_owner_earnings_details(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    payouts = db.query(Payout).filter(
        Payout.owner_id == current_user.id
    ).order_by(Payout.created_at.desc()).all()
    
    gross_total = sum(p.gross_amount for p in payouts if p.status != "CANCELLED")
    commission_total = sum(p.commission for p in payouts if p.status != "CANCELLED")
    net_total = sum(p.net_amount for p in payouts if p.status != "CANCELLED")

    return {
        "gross_earnings": round(gross_total, 2),
        "platform_commission": round(commission_total, 2),
        "net_earnings": round(net_total, 2),
        "payouts_history": [
            {
                "id": p.id,
                "booking_id": p.booking.booking_id if p.booking else f"PKZ-TXN-{p.id}",
                "parking_name": p.booking.parking.name if p.booking and p.booking.parking else "Parking",
                "gross_amount": p.gross_amount,
                "commission": p.commission,
                "net_amount": p.net_amount,
                "status": p.status,
                "created_at": p.created_at
            }
            for p in payouts
        ]
    }
