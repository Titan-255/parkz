import pytest
from datetime import datetime, timezone, timedelta
from app.models.all_models import User, UserRole, ParkingSpace, ParkingStatus, VerificationStatus, BookingStatus
from app.core.security import get_password_hash, create_access_token

def test_double_booking_prevention(client, db_session):
    # Setup Owner
    owner = User(
        email="single_owner@parkz.local",
        name="Single Spot Host",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.OWNER.value,
        is_verified=True,
        status="ACTIVE"
    )
    db_session.add(owner)
    db_session.commit()
    db_session.refresh(owner)

    # Setup Parking space with exactly 1 available slot
    parking = ParkingSpace(
        owner_id=owner.id,
        name="Single Slot Driveway",
        address="10 Beach Rd, Chennai",
        latitude=13.0400,
        longitude=80.2500,
        price_per_hour=40.0,
        vehicle_type="CAR",
        total_spaces=1,
        status=ParkingStatus.ACTIVE.value,
        verification_status=VerificationStatus.APPROVED.value
    )
    db_session.add(parking)
    db_session.commit()
    db_session.refresh(parking)

    # Setup Driver A and Driver B
    driver_a = User(
        email="driver_a@parkz.local",
        name="Driver Alpha",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.DRIVER.value,
        is_verified=True,
        status="ACTIVE"
    )
    driver_b = User(
        email="driver_b@parkz.local",
        name="Driver Beta",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.DRIVER.value,
        is_verified=True,
        status="ACTIVE"
    )
    db_session.add_all([driver_a, driver_b])
    db_session.commit()
    db_session.refresh(driver_a)
    db_session.refresh(driver_b)

    token_a = create_access_token(subject=driver_a.id, role=driver_a.role)
    token_b = create_access_token(subject=driver_b.id, role=driver_b.role)

    # Time window: 2:00 PM to 4:00 PM tomorrow
    tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
    start_time = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 14, 0, 0, tzinfo=timezone.utc).isoformat()
    end_time = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 16, 0, 0, tzinfo=timezone.utc).isoformat()

    # Driver A books the single slot
    booking_req_a = {
        "parking_id": parking.id,
        "start_time": start_time,
        "end_time": end_time,
        "vehicle_number": "TN-01-AA-1111",
        "vehicle_type": "CAR"
    }
    res_a = client.post(
        "/api/bookings",
        json=booking_req_a,
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res_a.status_code == 201
    booking_data_a = res_a.json()
    assert booking_data_a["status"] == "PENDING_PAYMENT"

    # Driver A pays
    pay_res = client.post(
        "/api/payments/verify",
        json={
            "booking_id": booking_data_a["booking_id"],
            "status": "SUCCESS"
        },
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert pay_res.status_code == 200

    # Driver B attempts to book the same overlapping slot (2:30 PM to 3:30 PM)
    overlapping_start = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 14, 30, 0, tzinfo=timezone.utc).isoformat()
    overlapping_end = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 15, 30, 0, tzinfo=timezone.utc).isoformat()
    
    booking_req_b = {
        "parking_id": parking.id,
        "start_time": overlapping_start,
        "end_time": overlapping_end,
        "vehicle_number": "TN-02-BB-2222",
        "vehicle_type": "CAR"
    }
    res_b = client.post(
        "/api/bookings",
        json=booking_req_b,
        headers={"Authorization": f"Bearer {token_b}"}
    )

    # MUST be rejected with 409 Conflict
    assert res_b.status_code == 409
    assert "fully booked" in res_b.json()["detail"].lower()
