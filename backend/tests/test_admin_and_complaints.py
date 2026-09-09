import pytest
from app.models.all_models import User, UserRole, Complaint, ComplaintStatus
from app.core.security import get_password_hash, create_access_token

def test_admin_dashboard_and_complaint_resolution(client, db_session):
    admin = User(
        email="superadmin@parkz.local",
        name="Super Admin",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.ADMIN.value,
        is_verified=True,
        status="ACTIVE"
    )
    driver = User(
        email="complaining_driver@parkz.local",
        name="Complainant Driver",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.DRIVER.value,
        is_verified=True,
        status="ACTIVE"
    )
    db_session.add_all([admin, driver])
    db_session.commit()
    db_session.refresh(admin)
    db_session.refresh(driver)

    admin_token = create_access_token(subject=admin.id, role=admin.role)
    driver_token = create_access_token(subject=driver.id, role=driver.role)

    # 1. Driver files complaint
    c_res = client.post(
        "/api/complaints",
        json={
            "type": "WRONG_LOCATION",
            "description": "Signboard was partially obstructed by tree"
        },
        headers={"Authorization": f"Bearer {driver_token}"}
    )
    assert c_res.status_code == 201
    complaint_id = c_res.json()["id"]
    assert c_res.json()["status"] == "OPEN"

    # 2. Admin views dashboard
    dash_res = client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
    assert dash_res.status_code == 200
    assert dash_res.json()["open_complaints_count"] >= 1

    # 3. Admin resolves complaint
    resolve_res = client.post(
        f"/api/admin/complaints/{complaint_id}/resolve",
        json={
            "status": "RESOLVED",
            "resolution": "Notified owner to clear tree branches and updated entrance photo."
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"
    assert "clear" in resolve_res.json()["resolution"].lower()
