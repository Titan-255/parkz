import pytest
from app.models.all_models import UserRole

def test_register_driver(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "testdriver@parkz.local",
            "name": "Test Driver",
            "phone": "+91 99999 11111",
            "password": "Password123!",
            "role": "DRIVER",
            "vehicle_number": "TN-01-XX-9999",
            "vehicle_type": "CAR"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testdriver@parkz.local"
    assert data["user"]["role"] == "DRIVER"

def test_register_duplicate_email_fails(client):
    payload = {
        "email": "dup@parkz.local",
        "name": "User 1",
        "password": "Password123!",
        "role": "DRIVER"
    }
    r1 = client.post("/api/auth/register", json=payload)
    assert r1.status_code == 200
    
    r2 = client.post("/api/auth/register", json=payload)
    assert r2.status_code == 400
    assert "already exists" in r2.json()["detail"]

def test_login_success(client):
    # Register first
    client.post(
        "/api/auth/register",
        json={
            "email": "loginuser@parkz.local",
            "name": "Login User",
            "password": "SecretPassword123!",
            "role": "DRIVER"
        }
    )
    # Login
    response = client.post(
        "/api/auth/login",
        json={"email": "loginuser@parkz.local", "password": "SecretPassword123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "loginuser@parkz.local"

def test_login_invalid_password(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "loginuser@parkz.local", "password": "WrongPassword"}
    )
    assert response.status_code == 401
