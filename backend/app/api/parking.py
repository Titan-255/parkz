import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.models.all_models import (
    ParkingSpace, ParkingStatus, VerificationStatus, ParkingImage,
    Availability, User, UserRole, QRCode, Review
)
from app.schemas.all_schemas import (
    ParkingCreate, ParkingUpdate, ParkingOut, AvailabilityCreate, AvailabilityOut, QRCodeOut
)
from app.api.deps import get_current_user, require_owner, require_admin
from app.services.qr_service import QRService

router = APIRouter(prefix="/parking", tags=["Parking Spaces"])

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def enrich_parking_out(p: ParkingSpace, user_lat: Optional[float] = None, user_lng: Optional[float] = None) -> ParkingOut:
    ratings = [r.rating for r in p.reviews]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 4.8
    
    dist = None
    if user_lat is not None and user_lng is not None:
        dist = calculate_distance(user_lat, user_lng, p.latitude, p.longitude)

    p_out = ParkingOut(
        id=p.id,
        owner_id=p.owner_id,
        name=p.name,
        description=p.description,
        address=p.address,
        latitude=p.latitude,
        longitude=p.longitude,
        price_per_hour=p.price_per_hour,
        vehicle_type=p.vehicle_type,
        total_spaces=p.total_spaces,
        status=p.status,
        verification_status=p.verification_status,
        rules=p.rules,
        entrance_instructions=p.entrance_instructions,
        created_at=p.created_at,
        images=[{"id": img.id, "image_url": img.image_url, "is_primary": img.is_primary} for img in p.images],
        availabilities=[
            {
                "id": a.id,
                "parking_id": a.parking_id,
                "day_of_week": a.day_of_week,
                "start_time": a.start_time,
                "end_time": a.end_time,
                "available_spaces": a.available_spaces
            } for a in p.availabilities
        ],
        average_rating=avg_rating,
        total_reviews=len(ratings),
        available_slots_now=p.total_spaces,
        distance_km=dist,
        owner_name=p.owner.name if p.owner else "ParkZ Verified Host"
    )
    return p_out

@router.get("", response_model=List[ParkingOut])
def get_parkings(
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    radius_km: Optional[float] = Query(25.0),
    vehicle_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("nearest"),
    db: Session = Depends(get_db)
):
    query = db.query(ParkingSpace).filter(
        ParkingSpace.status == ParkingStatus.ACTIVE.value,
        ParkingSpace.verification_status == VerificationStatus.APPROVED.value
    )

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                ParkingSpace.name.ilike(term),
                ParkingSpace.address.ilike(term),
                ParkingSpace.description.ilike(term)
            )
        )

    if vehicle_type and vehicle_type != "ALL":
        query = query.filter(
            or_(
                ParkingSpace.vehicle_type == vehicle_type,
                ParkingSpace.vehicle_type == "BOTH"
            )
        )

    if min_price is not None:
        query = query.filter(ParkingSpace.price_per_hour >= min_price)
    if max_price is not None:
        query = query.filter(ParkingSpace.price_per_hour <= max_price)

    parkings = query.all()

    # Enrich and filter distance/ratings in memory
    results = []
    for p in parkings:
        item = enrich_parking_out(p, latitude, longitude)
        
        # Check radius if coordinates are provided
        if latitude is not None and longitude is not None and item.distance_km is not None:
            if item.distance_km > radius_km:
                continue
        
        # Check rating filter
        if min_rating is not None and (item.average_rating or 0) < min_rating:
            continue
            
        results.append(item)

    # Sort
    if sort_by == "cheapest":
        results.sort(key=lambda x: x.price_per_hour)
    elif sort_by == "rating":
        results.sort(key=lambda x: -(x.average_rating or 0))
    elif sort_by == "nearest" and latitude is not None and longitude is not None:
        results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 999999)

    return results

@router.get("/{parking_id}", response_model=ParkingOut)
def get_parking_by_id(
    parking_id: int,
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    parking = db.query(ParkingSpace).filter(ParkingSpace.id == parking_id).first()
    if not parking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking space not found"
        )
    return enrich_parking_out(parking, latitude, longitude)

@router.post("", response_model=ParkingOut, status_code=status.HTTP_201_CREATED)
def create_parking(
    parking_in: ParkingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    parking = ParkingSpace(
        owner_id=current_user.id,
        name=parking_in.name,
        description=parking_in.description,
        address=parking_in.address,
        latitude=parking_in.latitude,
        longitude=parking_in.longitude,
        price_per_hour=parking_in.price_per_hour,
        vehicle_type=parking_in.vehicle_type,
        total_spaces=parking_in.total_spaces,
        status=ParkingStatus.ACTIVE.value,
        verification_status=VerificationStatus.PENDING.value,
        rules=parking_in.rules,
        entrance_instructions=parking_in.entrance_instructions
    )
    db.add(parking)
    db.commit()
    db.refresh(parking)

    # Add images
    if parking_in.images:
        for idx, url in enumerate(parking_in.images):
            img = ParkingImage(
                parking_id=parking.id,
                image_url=url,
                is_primary=(idx == 0)
            )
            db.add(img)

    # Add default full week availability if not provided
    if not parking_in.availabilities:
        for day in range(7):
            av = Availability(
                parking_id=parking.id,
                day_of_week=day,
                start_time="00:00",
                end_time="23:59",
                available_spaces=parking.total_spaces
            )
            db.add(av)
    else:
        for a in parking_in.availabilities:
            av = Availability(
                parking_id=parking.id,
                day_of_week=a.day_of_week,
                start_time=a.start_time,
                end_time=a.end_time,
                available_spaces=a.available_spaces
            )
            db.add(av)

    # Pre-generate secure QR code token
    QRService.generate_parking_qr(db, parking.id)

    db.commit()
    db.refresh(parking)
    return enrich_parking_out(parking)

@router.put("/{parking_id}", response_model=ParkingOut)
def update_parking(
    parking_id: int,
    parking_in: ParkingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    parking = db.query(ParkingSpace).filter(ParkingSpace.id == parking_id).first()
    if not parking:
        raise HTTPException(status_code=404, detail="Parking not found")
    
    if parking.owner_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Not authorized to edit this parking spot")

    update_data = parking_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(parking, field, value)

    db.commit()
    db.refresh(parking)
    return enrich_parking_out(parking)

@router.get("/{parking_id}/qr", response_model=QRCodeOut)
def get_parking_qr(
    parking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    parking = db.query(ParkingSpace).filter(ParkingSpace.id == parking_id).first()
    if not parking:
        raise HTTPException(status_code=404, detail="Parking not found")
    
    qr = QRService.generate_parking_qr(db, parking_id)
    return QRCodeOut.model_validate(qr)
