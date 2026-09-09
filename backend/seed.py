import os
import sys
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.all_models import (
    User, UserRole, UserStatus, VehicleType,
    ParkingSpace, ParkingStatus, VerificationStatus, ParkingImage,
    Availability, Booking, BookingStatus, Payment, PaymentStatus,
    Payout, QRCode, CheckIn, CheckInStatus, Review,
    Complaint, ComplaintStatus, ComplaintType, Notification
)
from app.services.qr_service import QRService

def seed_database():
    print("[INFO] Starting ParkZ Database Seeding...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear existing data for fresh seed if desired
        db.query(Notification).delete()
        db.query(Review).delete()
        db.query(Complaint).delete()
        db.query(CheckIn).delete()
        db.query(Payout).delete()
        db.query(Payment).delete()
        db.query(Booking).delete()
        db.query(QRCode).delete()
        db.query(Availability).delete()
        db.query(ParkingImage).delete()
        db.query(ParkingSpace).delete()
        db.query(User).delete()
        db.commit()

        print("1. Creating User Accounts...")
        # Admin
        admin = User(
            email="admin@parkz.local",
            name="Alexander Pierce (Chief Admin)",
            phone="+91 98401 23456",
            password_hash=get_password_hash("ParkZ@Admin123!"),
            role=UserRole.ADMIN.value,
            is_verified=True,
            status=UserStatus.ACTIVE.value
        )
        db.add(admin)

        # Owners
        owner1 = User(
            email="owner@parkz.local",
            name="Rajesh Sharma (Commercial Host)",
            phone="+91 98402 34567",
            password_hash=get_password_hash("ParkZ@Owner123!"),
            role=UserRole.OWNER.value,
            is_verified=True,
            status=UserStatus.ACTIVE.value
        )
        owner2 = User(
            email="owner2@parkz.local",
            name="Kavitha Sundaram (Private Landowner)",
            phone="+91 98403 45678",
            password_hash=get_password_hash("ParkZ@Owner456!"),
            role=UserRole.OWNER.value,
            is_verified=True,
            status=UserStatus.ACTIVE.value
        )
        db.add_all([owner1, owner2])
        db.commit()

        # Drivers
        drivers = [
            User(
                email="driver@parkz.local",
                name="Siddharth Verma",
                phone="+91 98404 56789",
                password_hash=get_password_hash("ParkZ@Driver123!"),
                role=UserRole.DRIVER.value,
                vehicle_number="TN-01-AB-1234",
                vehicle_type="CAR",
                is_verified=True,
                status=UserStatus.ACTIVE.value
            ),
            User(
                email="driver2@parkz.local",
                name="Ananya Raman",
                phone="+91 98405 67890",
                password_hash=get_password_hash("ParkZ@Driver456!"),
                role=UserRole.DRIVER.value,
                vehicle_number="TN-07-CD-5678",
                vehicle_type="TWO_WHEELER",
                is_verified=True,
                status=UserStatus.ACTIVE.value
            ),
            User(
                email="driver3@parkz.local",
                name="Karthik Subramanian",
                phone="+91 98406 11223",
                password_hash=get_password_hash("ParkZ@Driver123!"),
                role=UserRole.DRIVER.value,
                vehicle_number="TN-09-EF-9988",
                vehicle_type="CAR",
                is_verified=True,
                status=UserStatus.ACTIVE.value
            ),
            User(
                email="driver4@parkz.local",
                name="Divya Balaji",
                phone="+91 98407 33445",
                password_hash=get_password_hash("ParkZ@Driver123!"),
                role=UserRole.DRIVER.value,
                vehicle_number="TN-10-GH-7766",
                vehicle_type="CAR",
                is_verified=True,
                status=UserStatus.ACTIVE.value
            ),
            User(
                email="driver5@parkz.local",
                name="Vikramaditya Rao",
                phone="+91 98408 55667",
                password_hash=get_password_hash("ParkZ@Driver123!"),
                role=UserRole.DRIVER.value,
                vehicle_number="TN-02-JK-3322",
                vehicle_type="BOTH",
                is_verified=True,
                status=UserStatus.ACTIVE.value
            ),
        ]
        db.add_all(drivers)
        db.commit()

        print("2. Creating Realistic Chennai Parking Spaces...")
        now = datetime.now(timezone.utc)

        # Parking listings
        parking_specs = [
            {
                "owner": owner1,
                "name": "T. Nagar Prime Covered Garage",
                "description": "Premium 24/7 covered parking with 24/7 CCTV, security guard, EV charging station, and wide bays right off Usman Road.",
                "address": "45 Usman Road, T. Nagar, Chennai, Tamil Nadu 600017",
                "lat": 13.0418,
                "lng": 80.2341,
                "price": 30.0,
                "vehicle_type": "BOTH",
                "total_spaces": 6,
                "rules": "No overnight parking without prior 24h booking. Keep vehicle locked.",
                "entrance": "Enter via Gate 2 opposite Saravana Stores. Security will direct to bay.",
                "image": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
                "status": "ACTIVE",
                "verif": "APPROVED"
            },
            {
                "owner": owner1,
                "name": "Marina Promenade Valet Stalls",
                "description": "Scenic beachside secured parking slots with quick pedestrian access to Marina Beach and Santhome Cathedral.",
                "address": "12 Kamarajar Salai, Santhome, Chennai, Tamil Nadu 600004",
                "lat": 13.0334,
                "lng": 80.2785,
                "price": 25.0,
                "vehicle_type": "CAR",
                "total_spaces": 8,
                "rules": "Strict speed limit 10 km/h inside premises. Beach visitors welcome.",
                "entrance": "Main arch entrance facing the promenade lighthouse.",
                "image": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80",
                "status": "ACTIVE",
                "verif": "APPROVED"
            },
            {
                "owner": owner1,
                "name": "Anna Nagar 2nd Avenue Secure Lot",
                "description": "Clean paved surface lot nestled in the bustling dining hub of Anna Nagar, just 200m from Tower Park.",
                "address": "88 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu 600040",
                "lat": 13.0850,
                "lng": 80.2101,
                "price": 35.0,
                "vehicle_type": "BOTH",
                "total_spaces": 5,
                "rules": "Display ParkZ digital pass or QR badge on dashboard if asked.",
                "entrance": "Gate next to Starbucks Anna Nagar. Automated barrier.",
                "image": "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80",
                "status": "ACTIVE",
                "verif": "APPROVED"
            },
            {
                "owner": owner2,
                "name": "OMR Tech Park Executive Bays",
                "description": "High-tech gated commercial parking for IT professionals with shade canopy, badge scanner and security guards.",
                "address": "Rajiv Gandhi Salai (OMR), Kandanchavadi, Chennai, Tamil Nadu 600096",
                "lat": 12.9647,
                "lng": 80.2458,
                "price": 20.0,
                "vehicle_type": "BOTH",
                "total_spaces": 10,
                "rules": "ID check required for late night entries.",
                "entrance": "Tower B basement ramp entrance.",
                "image": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
                "status": "ACTIVE",
                "verif": "APPROVED"
            },
            {
                "owner": owner2,
                "name": "Alwarpet TTK Road Private Stalls",
                "description": "Discreet residential driveway conversion in prime central Alwarpet. Quiet, gated, highly secure.",
                "address": "104 TTK Road, Alwarpet, Chennai, Tamil Nadu 600018",
                "lat": 13.0339,
                "lng": 80.2520,
                "price": 40.0,
                "vehicle_type": "CAR",
                "total_spaces": 3,
                "rules": "Quiet zone. No honking. Reverse parking mandatory.",
                "entrance": "Black sliding metal gate. Code provided upon booking confirmation.",
                "image": "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
                "status": "ACTIVE",
                "verif": "APPROVED"
            },
            {
                "owner": owner2,
                "name": "Nungambakkam High Road Premium Stalls",
                "description": "Right in the commercial heart of Nungambakkam. Easy walk to consulates and luxury boutiques.",
                "address": "15 Nungambakkam High Road, Chennai, Tamil Nadu 600034",
                "lat": 13.0604,
                "lng": 80.2413,
                "price": 45.0,
                "vehicle_type": "CAR",
                "total_spaces": 4,
                "rules": "Strictly no commercial loading trucks. Luxury cars welcome.",
                "entrance": "Drive past the glass atrium and follow yellow arrows.",
                "image": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
                "status": "ACTIVE",
                "verif": "APPROVED"
            },
            {
                "owner": owner1,
                "name": "Mylapore Heritage Temple Parking",
                "description": "Convenient safe parking space located 3 minutes walking distance from Kapaleeshwarar Temple.",
                "address": "22 North Mada Street, Mylapore, Chennai, Tamil Nadu 600004",
                "lat": 13.0336,
                "lng": 80.2690,
                "price": 20.0,
                "vehicle_type": "TWO_WHEELER",
                "total_spaces": 12,
                "rules": "Helmets can be safely stored with the counter supervisor.",
                "entrance": "Dedicated 2-wheeler ramp beside the temple arch.",
                "image": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
                "status": "ACTIVE",
                "verif": "APPROVED"
            },
            {
                "owner": owner2,
                "name": "Velachery Bypass Express Stalls (Pending Review)",
                "description": "Brand new covered bays nearing completion near Phoenix MarketCity mall.",
                "address": "14 Velachery Main Road, Chennai, Tamil Nadu 600042",
                "lat": 12.9815,
                "lng": 80.2180,
                "price": 30.0,
                "vehicle_type": "CAR",
                "total_spaces": 4,
                "rules": "Standard mall overflow parking.",
                "entrance": "Direct access from bypass lane.",
                "image": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
                "status": "ACTIVE",
                "verif": "PENDING"
            }
        ]

        created_spaces = []
        for spec in parking_specs:
            p = ParkingSpace(
                owner_id=spec["owner"].id,
                name=spec["name"],
                description=spec["description"],
                address=spec["address"],
                latitude=spec["lat"],
                longitude=spec["lng"],
                price_per_hour=spec["price"],
                vehicle_type=spec["vehicle_type"],
                total_spaces=spec["total_spaces"],
                status=spec["status"],
                verification_status=spec["verif"],
                rules=spec["rules"],
                entrance_instructions=spec["entrance"]
            )
            db.add(p)
            db.commit()
            db.refresh(p)

            # Image
            img = ParkingImage(
                parking_id=p.id,
                image_url=spec["image"],
                is_primary=True
            )
            db.add(img)

            # Weekday & Weekend Availability
            for day in range(7):
                av = Availability(
                    parking_id=p.id,
                    day_of_week=day,
                    start_time="00:00",
                    end_time="23:59",
                    available_spaces=p.total_spaces
                )
                db.add(av)

            # Generate QR Code
            QRService.generate_parking_qr(db, p.id)
            created_spaces.append(p)

        db.commit()

        print("3. Creating Realistic Demo Bookings, Payments, Reviews & Check-ins...")
        # Completed Booking 1
        p1 = created_spaces[0]
        d1 = drivers[0]
        b1_start = now - timedelta(hours=4)
        b1_end = now - timedelta(hours=1)
        b1 = Booking(
            booking_id="PKZ-918234",
            driver_id=d1.id,
            parking_id=p1.id,
            start_time=b1_start,
            end_time=b1_end,
            vehicle_number=d1.vehicle_number,
            vehicle_type="CAR",
            base_price=90.0,
            platform_fee=18.0,
            owner_amount=90.0,
            amount=108.0,
            status=BookingStatus.COMPLETED.value,
            payment_status=PaymentStatus.PAID.value,
            check_in_status=CheckInStatus.CHECKED_IN.value,
            created_at=now - timedelta(hours=5)
        )
        db.add(b1)
        db.commit()
        db.refresh(b1)

        pay1 = Payment(
            booking_id=b1.id,
            provider="mock",
            transaction_id="MOCK-TXN-918234ABC",
            amount=108.0,
            status=PaymentStatus.PAID.value
        )
        payout1 = Payout(
            booking_id=b1.id,
            owner_id=p1.owner_id,
            gross_amount=108.0,
            commission=18.0,
            net_amount=90.0,
            status="COMPLETED"
        )
        rev1 = Review(
            booking_id=b1.id,
            driver_id=d1.id,
            parking_id=p1.id,
            rating=5,
            comment="Incredible experience! The QR scan at the gate was instantaneous and the security guard was very helpful."
        )
        chk1 = CheckIn(
            booking_id=b1.id,
            parking_id=p1.id,
            driver_id=d1.id,
            qr_id=p1.qr_code.id if p1.qr_code else 1,
            checked_in_at=b1_start + timedelta(minutes=5),
            status="VALID"
        )
        db.add_all([pay1, payout1, rev1, chk1])

        # Active / Checked-in Booking 2
        p2 = created_spaces[1]
        d2 = drivers[1]
        b2_start = now - timedelta(minutes=30)
        b2_end = now + timedelta(hours=2)
        b2 = Booking(
            booking_id="PKZ-447192",
            driver_id=d2.id,
            parking_id=p2.id,
            start_time=b2_start,
            end_time=b2_end,
            vehicle_number=d2.vehicle_number,
            vehicle_type="TWO_WHEELER",
            base_price=62.5,
            platform_fee=12.5,
            owner_amount=62.5,
            amount=75.0,
            status=BookingStatus.CHECKED_IN.value,
            payment_status=PaymentStatus.PAID.value,
            check_in_status=CheckInStatus.CHECKED_IN.value,
            created_at=now - timedelta(hours=1)
        )
        db.add(b2)
        db.commit()
        db.refresh(b2)

        pay2 = Payment(
            booking_id=b2.id,
            provider="mock",
            transaction_id="MOCK-TXN-447192DEF",
            amount=75.0,
            status=PaymentStatus.PAID.value
        )
        payout2 = Payout(
            booking_id=b2.id,
            owner_id=p2.owner_id,
            gross_amount=75.0,
            commission=12.5,
            net_amount=62.5,
            status="COMPLETED"
        )
        chk2 = CheckIn(
            booking_id=b2.id,
            parking_id=p2.id,
            driver_id=d2.id,
            qr_id=p2.qr_code.id if p2.qr_code else 2,
            checked_in_at=b2_start + timedelta(minutes=2),
            status="VALID"
        )
        db.add_all([pay2, payout2, chk2])

        # Upcoming Confirmed Booking 3 (Driver 1)
        p3 = created_spaces[2]
        b3_start = now + timedelta(hours=3)
        b3_end = now + timedelta(hours=6)
        b3 = Booking(
            booking_id="PKZ-782019",
            driver_id=d1.id,
            parking_id=p3.id,
            start_time=b3_start,
            end_time=b3_end,
            vehicle_number=d1.vehicle_number,
            vehicle_type="CAR",
            base_price=105.0,
            platform_fee=21.0,
            owner_amount=105.0,
            amount=126.0,
            status=BookingStatus.CONFIRMED.value,
            payment_status=PaymentStatus.PAID.value,
            check_in_status=CheckInStatus.PENDING.value,
            created_at=now - timedelta(minutes=20)
        )
        db.add(b3)
        db.commit()
        db.refresh(b3)

        pay3 = Payment(
            booking_id=b3.id,
            provider="mock",
            transaction_id="MOCK-TXN-782019GHI",
            amount=126.0,
            status=PaymentStatus.PAID.value
        )
        payout3 = Payout(
            booking_id=b3.id,
            owner_id=p3.owner_id,
            gross_amount=126.0,
            commission=21.0,
            net_amount=105.0,
            status="COMPLETED"
        )
        db.add_all([pay3, payout3])

        print("4. Creating Demo Complaints & In-app Notifications...")
        complaint1 = Complaint(
            booking_id=b1.id,
            parking_id=p1.id,
            created_by=d1.id,
            type=ComplaintType.OTHER.value,
            description="Minor query regarding EV charger amperage. Host was helpful and sorted it out.",
            status=ComplaintStatus.RESOLVED.value,
            resolution="Host provided dedicated high-speed type 2 charger adapter."
        )
        db.add(complaint1)

        # In-app notifications
        db.add_all([
            Notification(
                user_id=d1.id,
                title="Welcome to ParkZ!",
                message="Your driver account is verified and ready. Start discovering smart parking spots.",
                type="INFO",
                link="/app"
            ),
            Notification(
                user_id=d1.id,
                title="Upcoming Reservation Reminder",
                message=f"Your booking at '{p3.name}' is scheduled for {b3_start.strftime('%I:%M %p')}.",
                type="BOOKING_REMINDER",
                link=f"/app/bookings/{b3.booking_id}"
            ),
            Notification(
                user_id=owner1.id,
                title="Listing Approved!",
                message=f"Your space '{p1.name}' has been verified by the ParkZ Operations team.",
                type="PARKING_APPROVED",
                link="/owner/parking"
            ),
            Notification(
                user_id=owner1.id,
                title="Payout Processed",
                message="Earnings of Rs 152.50 have been calculated and added to your wallet.",
                type="PAYOUT_COMPLETED",
                link="/owner/earnings"
            )
        ])

        db.commit()
        print("[SUCCESS] Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
