import pytest
from datetime import datetime, timezone, timedelta
from app.models.all_models import (
    User, UserRole, ParkingSpace, ParkingStatus, VerificationStatus,
    Booking, BookingStatus, PaymentStatus, Review, Complaint
)
from app.core.security import get_password_hash, create_access_token

def test_cancellation_and_reviews_lifecycle(client, db_session):
    # Setup Driver & Owner
    driver = User(
        email="rev_driver@parkz.local",
        name="Review Driver",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.DRIVER.value,
        is_verified=True,
        status="ACTIVE"
    )
    owner = User(
        email="rev_owner@parkz.local",
        name="Review Owner",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.OWNER.value,
        is_verified=True,
        status="ACTIVE"
    )
    db_session.add_all([driver, owner])
    db_session.commit()
    db_session.refresh(driver)
    db_session.refresh(owner)

    driver_token = create_access_token(subject=driver.id, role=driver.role)

    parking = ParkingSpace(
        owner_id=owner.id,
        name="Test Prime Spot",
        address="100 Mount Rd",
        latitude=13.05,
        longitude=80.25,
        price_per_hour=50.0,
        vehicle_type="CAR",
        total_spaces=2,
        status=ParkingStatus.ACTIVE.value,
        verification_status=VerificationStatus.APPROVED.value
    )
    db_session.add(parking)
    db_session.commit()
    db_session.refresh(parking)

    # 1. Test Cancellation >2 hours prior gives 100% refund
    now = datetime.now(timezone.utc)
    future_start = now + timedelta(hours=5)
    future_end = now + timedelta(hours=7)
    
    b_cancel = Booking(
        booking_id="PKZ-CANCEL-01",
        driver_id=driver.id,
        parking_id=parking.id,
        start_time=future_start,
        end_time=future_end,
        vehicle_number="TN-01-CN-1234",
        amount=120.0,
        base_price=100.0,
        platform_fee=20.0,
        owner_amount=100.0,
        status=BookingStatus.CONFIRMED.value,
        payment_status=PaymentStatus.PAID.value
    )
    db_session.add(b_cancel)
    db_session.commit()

    cancel_res = client.post(
        f"/api/bookings/{b_cancel.booking_id}/cancel",
        headers={"Authorization": f"Bearer {driver_token}"}
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["refund_amount"] == 120.0
    assert cancel_res.json()["status"] == "CANCELLED"

    # 2. Test Review flow: cannot review before completion
    b_active = Booking(
        booking_id="PKZ-ACTIVE-02",
        driver_id=driver.id,
        parking_id=parking.id,
        start_time=now - timedelta(hours=1),
        end_time=now + timedelta(hours=1),
        vehicle_number="TN-01-CN-1234",
        amount=120.0,
        base_price=100.0,
        platform_fee=20.0,
        owner_amount=100.0,
        status=BookingStatus.CONFIRMED.value,
        payment_status=PaymentStatus.PAID.value
    )
    db_session.add(b_active)
    db_session.commit()

    premature_rev = client.post(
        "/api/reviews",
        json={"booking_id": b_active.booking_id, "rating": 5, "comment": "Great"},
        headers={"Authorization": f"Bearer {driver_token}"}
    )
    assert premature_rev.status_code == 400

    # Mark completed and then review succeeds
    b_active.status = BookingStatus.COMPLETED.value
    db_session.commit()

    success_rev = client.post(
        "/api/reviews",
        json={"booking_id": b_active.booking_id, "rating": 5, "comment": "Excellent experience!"},
        headers={"Authorization": f"Bearer {driver_token}"}
    )
    assert success_rev.status_code == 201
    assert success_rev.json()["rating"] == 5

    # Duplicate review should fail
    dup_rev = client.post(
        "/api/reviews",
        json={"booking_id": b_active.booking_id, "rating": 4, "comment": "Trying again"},
        headers={"Authorization": f"Bearer {driver_token}"}
    )
    assert dup_rev.status_code == 400
