import pytest
from datetime import datetime, timezone, timedelta
from app.models.all_models import User, UserRole, ParkingSpace, ParkingStatus, VerificationStatus, Booking, QRCode
from app.core.security import get_password_hash, create_access_token
from app.services.qr_service import QRService

def test_qr_checkin_and_invalid_rejection(client, db_session):
    owner = User(
        email="qr_owner@parkz.local",
        name="QR Host",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.OWNER.value,
        is_verified=True,
        status="ACTIVE"
    )
    driver = User(
        email="qr_driver@parkz.local",
        name="QR Driver",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.DRIVER.value,
        is_verified=True,
        status="ACTIVE"
    )
    db_session.add_all([owner, driver])
    db_session.commit()
    db_session.refresh(owner)
    db_session.refresh(driver)

    driver_token = create_access_token(subject=driver.id, role=driver.role)

    # Parking 1 & Parking 2
    p1 = ParkingSpace(
        owner_id=owner.id,
        name="Park Facility Alpha",
        address="10 North Rd",
        latitude=13.0,
        longitude=80.0,
        price_per_hour=30.0,
        total_spaces=5,
        status=ParkingStatus.ACTIVE.value,
        verification_status=VerificationStatus.APPROVED.value
    )
    p2 = ParkingSpace(
        owner_id=owner.id,
        name="Park Facility Beta",
        address="20 South Rd",
        latitude=13.1,
        longitude=80.1,
        price_per_hour=30.0,
        total_spaces=5,
        status=ParkingStatus.ACTIVE.value,
        verification_status=VerificationStatus.APPROVED.value
    )
    db_session.add_all([p1, p2])
    db_session.commit()
    db_session.refresh(p1)
    db_session.refresh(p2)

    qr1 = QRService.generate_parking_qr(db_session, p1.id)
    qr2 = QRService.generate_parking_qr(db_session, p2.id)

    # Create & Confirm booking at Parking 1
    now = datetime.now(timezone.utc)
    booking = Booking(
        booking_id="PKZ-QR-990011",
        driver_id=driver.id,
        parking_id=p1.id,
        start_time=now,
        end_time=now + timedelta(hours=2),
        vehicle_number="TN-01-QR-0001",
        amount=60.0,
        base_price=50.0,
        platform_fee=10.0,
        owner_amount=50.0,
        status="CONFIRMED",
        payment_status="PAID"
    )
    db_session.add(booking)
    db_session.commit()

    # 1. Attempt Check-in with WRONG QR token (belongs to Parking 2)
    wrong_checkin = client.post(
        f"/api/bookings/{booking.booking_id}/check-in",
        json={"booking_id": booking.booking_id, "secure_token": qr2.secure_token},
        headers={"Authorization": f"Bearer {driver_token}"}
    )
    assert wrong_checkin.status_code == 400
    assert "different parking" in wrong_checkin.json()["detail"].lower()

    # 2. Attempt Check-in with CORRECT QR token
    valid_checkin = client.post(
        f"/api/bookings/{booking.booking_id}/check-in",
        json={"booking_id": booking.booking_id, "secure_token": qr1.secure_token},
        headers={"Authorization": f"Bearer {driver_token}"}
    )
    assert valid_checkin.status_code == 200
    assert valid_checkin.json()["success"] is True

    # 3. Duplicate check-in should fail
    dup_checkin = client.post(
        f"/api/bookings/{booking.booking_id}/check-in",
        json={"booking_id": booking.booking_id, "secure_token": qr1.secure_token},
        headers={"Authorization": f"Bearer {driver_token}"}
    )
    assert dup_checkin.status_code == 400
    assert "already checked in" in dup_checkin.json()["detail"].lower()
