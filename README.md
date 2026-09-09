# PARKZ — Park smarter. Arrive faster.

> **ParkZ** is a modern full-stack parking marketplace MVP that converts underused private parking spaces into bookable parking and helps drivers find reliable, verified parking before they arrive.

---

## 🌟 Key Features

* **🏎️ Driver Experience (`/app`)**:
  * Interactive Map discovery with custom price badges (₹20–₹50/hr), live radar search, and radius filtering.
  * Real-time slot availability, instant checkout, and live pricing breakdown.
  * **Mock Payment Mode**: 1-click test payments (`Simulate Success` / `Simulate Failure`).
  * **QR Entrance Pass**: Unique digital QR pass for gate check-in.
  * **Verified Reviews**: Driver rating & feedback system for completed sessions.
  * **Flexible Cancellation**: Configurable refund rules (>2h prior: 100%, <2h: 50%).

* **🏢 Space Owner SaaS Hub (`/owner`)**:
  * 8-Step wizard to list driveways, garages, and lots with coordinates and custom rules.
  * Real-time utilization KPIs, daily booking counters, and 7-day revenue charts.
  * Printable entrance QR codes for physical gate signs.
  * 80% Net Host Revenue payout ledger tracking (20% platform commission).

* **🛡️ Admin Operations Center (`/admin`)**:
  * Verification approval queue for new parking submissions.
  * User Directory management (suspend/reactivate accounts).
  * System-wide bookings log & financial transaction ledger.
  * Dispute resolution & fraud flag investigation.

* **🤖 Google Maps AI Smart Parking Assistant**:
  * Natural language parking advisor with live inventory integration and direct 1-click booking actions.

---

## 🔑 Development Demo Accounts

The database comes pre-seeded with realistic Chennai demo accounts and parking facilities.

| Role | Email | Password | Dashboard URL |
| :--- | :--- | :--- | :--- |
| **Driver Demo** | `driver@parkz.local` | `ParkZ@Driver123!` | [http://localhost:5173/app](http://localhost:5173/app) |
| **Owner Demo** | `owner@parkz.local` | `ParkZ@Owner123!` | [http://localhost:5173/owner](http://localhost:5173/owner) |
| **Admin Demo** | `admin@parkz.local` | `ParkZ@Admin123!` | [http://localhost:5173/admin](http://localhost:5173/admin) |
| **Owner 2** | `owner2@parkz.local` | `ParkZ@Owner456!` | [http://localhost:5173/owner](http://localhost:5173/owner) |
| **Driver 2** | `driver2@parkz.local` | `ParkZ@Driver456!` | [http://localhost:5173/app](http://localhost:5173/app) |

*(Note: These are local development credentials only).*

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet Maps, React Router v6, TanStack Query.
* **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2, JWT Auth, Concurrency-Safe Transaction Locking.
* **Database**: PostgreSQL / SQLite (zero-config local default).
* **Testing**: Pytest & FastAPI TestClient.

---

## 🚀 Getting Started

### 1. Prerequisites
* Python 3.11+
* Node.js v18+ & npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Seed the database with demo accounts & Chennai parking locations
python seed.py

# Start FastAPI backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* Backend API: `http://localhost:8000`
* Interactive API Docs (Swagger): `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
* Frontend Application: `http://localhost:5173`

---

## 🧪 Automated Testing

Run the full backend test suite covering Authentication, Double Booking Prevention, Mock Payments, and QR Check-ins:

```bash
python -m pytest backend/tests
```
