import pytest
from datetime import datetime, timezone, timedelta
from app.models.all_models import User, UserRole, ParkingSpace, ParkingStatus, VerificationStatus
from app.core.security import get_password_hash, create_access_token

def test_create_and_search_parking(client, db_session):
    # Create Owner
    owner = User(
        email="ownertest@parkz.local",
        name="Owner Tester",
        password_hash=get_password_hash("Password123!"),
        role=UserRole.OWNER.value,
        is_verified=True,
        status="ACTIVE"
    )
    db_session.add(owner)
    db_session.commit()
    db_session.refresh(owner)

    owner_token = create_access_token(subject=owner.id, role=owner.role)

    # 1. Create Parking Space (Owner)
    parking_payload = {
        "name": "Guindy Cyber Lot",
        "description": "Secure parking near tech park",
        "address": "100 GST Road, Guindy, Chennai",
        "latitude": 13.0067,
        "longitude": 80.2025,
        "price_per_hour": 30.0,
        "vehicle_type": "BOTH",
        "total_spaces": 5,
        "rules": "Reverse parking only",
        "entrance_instructions": "Gate 1",
        "images": ["https://images.unsplash.com/photo-1506521781263-d8422e82f27a"]
    }

    create_res = client.post(
        "/api/parking",
        json=parking_payload,
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]
    assert create_res.json()["verification_status"] == "PENDING"

    # 2. Verify driver search doesn't show PENDING parking
    search_res = client.get("/api/parking")
    assert search_res.status_code == 200
    ids = [p["id"] for p in search_res.json()]
    assert created_id not in ids

    # 3. Admin approves parking
    admin = User(
        email="admintest@parkz.local",
        name="Admin Tester",
        password_hash=get_password_hash("Password123!"),
        role=UserRole.ADMIN.value,
        is_verified=True,
        status="ACTIVE"
    )
    db_session.add(admin)
    db_session.commit()
    admin_token = create_access_token(subject=admin.id, role=admin.role)

    approve_res = client.post(
        f"/api/admin/parking/{created_id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["verification_status"] == "APPROVED"

    # 4. Now driver can find it
    search_res2 = client.get("/api/parking?search=Guindy")
    assert search_res2.status_code == 200
    assert any(p["id"] == created_id for p in search_res2.json())
