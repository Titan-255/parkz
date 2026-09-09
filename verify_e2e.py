import httpx

BASE_URL = "http://localhost:8000/api"

def test_complete_flow():
    print("[1] Testing Health Endpoint...")
    r = httpx.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print(" -> Health check passed:", r.json())

    print("\n[2] Testing Driver Authentication...")
    r = httpx.post(f"{BASE_URL}/auth/login", json={
        "email": "driver@parkz.local",
        "password": "ParkZ@Driver123!"
    })
    assert r.status_code == 200, f"Driver login failed: {r.text}"
    driver_data = r.json()
    driver_token = driver_data["access_token"]
    print(f" -> Driver logged in: {driver_data['user']['name']} ({driver_data['user']['email']})")

    headers = {"Authorization": f"Bearer {driver_token}"}

    print("\n[3] Testing Parking Discovery Search...")
    r = httpx.get(f"{BASE_URL}/parking?latitude=13.0827&longitude=80.2707")
    assert r.status_code == 200
    parkings = r.json()
    assert len(parkings) > 0, "No parking spots found"
    target_parking = parkings[0]
    print(f" -> Found {len(parkings)} spaces. Selected: {target_parking['name']} (Rs. {target_parking['price_per_hour']}/hr)")

    print("\n[4] Testing Live Booking Price Calculation...")
    r = httpx.post(f"{BASE_URL}/bookings/calculate", json={
        "parking_id": target_parking["id"],
        "start_time": "2026-09-10T10:00:00Z",
        "end_time": "2026-09-10T12:00:00Z"
    })
    assert r.status_code == 200
    calc = r.json()
    print(f" -> Price calculation: Base Rs. {calc['base_price']}, Fee Rs. {calc['platform_fee']}, Total Rs. {calc['total_amount']}")

    print("\n[5] Testing Booking Creation...")
    r = httpx.post(f"{BASE_URL}/bookings", json={
        "parking_id": target_parking["id"],
        "start_time": "2026-09-10T10:00:00Z",
        "end_time": "2026-09-10T12:00:00Z",
        "vehicle_number": "TN-01-AB-1234",
        "vehicle_type": "CAR"
    }, headers=headers)
    assert r.status_code == 201
    booking = r.json()
    booking_id = booking["booking_id"]
    print(f" -> Booking created with code: {booking_id} (Status: {booking['status']})")

    print("\n[6] Testing Mock Payment Execution...")
    r = httpx.post(f"{BASE_URL}/payments/verify", json={
        "booking_id": booking_id,
        "provider": "mock",
        "status": "SUCCESS"
    }, headers=headers)
    assert r.status_code == 200
    print(f" -> Payment verified: TxID {r.json()['transaction_id']} (Status: {r.json()['status']})")

    print("\n[7] Testing QR Code Check-In...")
    r_qr = httpx.get(f"{BASE_URL}/parking/{target_parking['id']}/qr", headers=headers)
    assert r_qr.status_code == 200
    qr_token = r_qr.json()["secure_token"]

    r_checkin = httpx.post(f"{BASE_URL}/bookings/{booking_id}/check-in", json={
        "booking_id": booking_id,
        "secure_token": qr_token
    }, headers=headers)
    assert r_checkin.status_code == 200
    print(f" -> Check-in result: {r_checkin.json()['message']}")

    print("\n[8] Testing Session Completion & Review Submission...")
    r_comp = httpx.post(f"{BASE_URL}/bookings/{booking_id}/complete", headers=headers)
    assert r_comp.status_code == 200

    r_rev = httpx.post(f"{BASE_URL}/reviews", json={
        "booking_id": booking_id,
        "rating": 5,
        "comment": "Super clean space, smooth automated gate access!"
    }, headers=headers)
    assert r_rev.status_code == 201
    print(f" -> Review posted: {r_rev.json()['rating']} stars - '{r_rev.json()['comment']}'")

    print("\n[9] Testing Owner Dashboard & Earnings...")
    r_owner_login = httpx.post(f"{BASE_URL}/auth/login", json={
        "email": "owner@parkz.local",
        "password": "ParkZ@Owner123!"
    })
    owner_token = r_owner_login.json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    r_owner_dash = httpx.get(f"{BASE_URL}/owner/dashboard", headers=owner_headers)
    assert r_owner_dash.status_code == 200
    dash_stats = r_owner_dash.json()
    print(f" -> Host stats: Today's Bookings: {dash_stats['todays_bookings_count']}, Total Net Earnings: Rs. {dash_stats['total_earnings']}")

    print("\n[10] Testing Google Maps AI Smart Parking Assistant...")
    r_ai = httpx.post(f"{BASE_URL}/ai/assistant", json={
        "message": "Find cheap parking near T Nagar for car",
        "latitude": 13.0418,
        "longitude": 80.2341,
        "vehicle_type": "CAR"
    })
    assert r_ai.status_code == 200
    ai_data = r_ai.json()
    print(f" -> Google Maps AI Reply: {ai_data['reply'][:100]}...")
    print(f" -> Top Recommendation: {ai_data['recommended_parkings'][0]['name']}")

    print("\n[SUCCESS] ALL FULL-STACK PARKZ MVP FLOWS TESTED SUCCESSFULLY!")

if __name__ == "__main__":
    test_complete_flow()
