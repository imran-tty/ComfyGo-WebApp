"""
ComfyGo Database Seed Script
=============================
Generates proper bcrypt hashes and populates PostgreSQL with sample data.

Usage:
    cd backend
    python seed.py                    # seed with default passwords
    python seed.py --drop             # drop all tables first, then seed
    python seed.py --db-url postgresql+asyncpg://user:pass@host:5432/dbname

Default credentials after seeding:
    Tourist:  rahim@example.com   / password123
    Guide:    farhan@example.com  / password123
    Manager:  aminul@example.com  / password123
    Admin:    admin@gmail.com      / admin123
"""

import argparse
import asyncio
import uuid
from datetime import date, datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# ── Password hashing ────────────────────────────────────────────────────────
# We import our own security module so hashes match the app's verify_password().
from app.core.security import hash_password


# ── Helpers ─────────────────────────────────────────────────────────────────

def uid(prefix: str = "") -> str:
    """Generate a short unique ID with an optional prefix."""
    return f"{prefix}{uuid.uuid4().hex[:8].upper()}"


# ── Table DDL (PostgreSQL) ─────────────────────────────────────────────────

TABLES = """
-- Existing tables (from comfygo_db.sql, converted to PostgreSQL)
CREATE TABLE IF NOT EXISTS users (
    user_id       VARCHAR(100) PRIMARY KEY,
    user_email    VARCHAR(100) UNIQUE NOT NULL,
    user_name     VARCHAR(100) NOT NULL,
    user_phone    VARCHAR(20),
    password      VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotels (
    hotel_registration_number VARCHAR(100) PRIMARY KEY,
    hotel_name                VARCHAR(100),
    hotel_division            VARCHAR(100),
    hotel_district            VARCHAR(100),
    hotel_location            VARCHAR(150),
    hotel_rating              VARCHAR(50),
    hotel_price               INTEGER DEFAULT 0,
    hotel_description         TEXT DEFAULT NULL,
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manager (
    manager_id                VARCHAR(100) PRIMARY KEY,
    manager_name              VARCHAR(100) NOT NULL,
    manager_email             VARCHAR(100) UNIQUE NOT NULL,
    manager_mobile            VARCHAR(20),
    hotel_registration_number VARCHAR(100),
    password                  VARCHAR(255) NOT NULL,
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_registration_number) REFERENCES hotels(hotel_registration_number)
);

CREATE TABLE IF NOT EXISTS transportation (
    transport_id    VARCHAR(100) PRIMARY KEY,
    transport_type  VARCHAR(50),
    transport_route VARCHAR(100),
    transport_fare  INTEGER
);

CREATE TABLE IF NOT EXISTS guide (
    guide_nid       VARCHAR(100) PRIMARY KEY,
    guide_name      VARCHAR(100) NOT NULL,
    guide_email     VARCHAR(100) UNIQUE NOT NULL,
    guide_mobile    VARCHAR(20),
    guide_division  VARCHAR(100),
    guide_district  VARCHAR(100),
    guide_rate      INTEGER DEFAULT 0,
    password        VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking (
    booking_id                  VARCHAR(100) PRIMARY KEY,
    booking_type                VARCHAR(100),
    booking_confirmation        VARCHAR(100) DEFAULT 'Pending',
    user_id                     VARCHAR(100),
    booking_date                DATE,
    guide_nid                   VARCHAR(100),
    hotel_registration_number   VARCHAR(100),
    transport_id                VARCHAR(100),
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (guide_nid) REFERENCES guide(guide_nid),
    FOREIGN KEY (hotel_registration_number) REFERENCES hotels(hotel_registration_number),
    FOREIGN KEY (transport_id) REFERENCES transportation(transport_id)
);

CREATE TABLE IF NOT EXISTS payment (
    payment_id      VARCHAR(100) PRIMARY KEY,
    booking_id      VARCHAR(100),
    price           INTEGER,
    user_id         VARCHAR(100),
    payment_date    DATE,
    payment_method  VARCHAR(50),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS contact_messages (
    message_id    VARCHAR(100) PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL,
    phone         VARCHAR(20),
    message       TEXT NOT NULL,
    submitted_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tourist_spots (
    spot_id           VARCHAR(100) PRIMARY KEY,
    spot_name         VARCHAR(150) NOT NULL,
    city              VARCHAR(100),
    division          VARCHAR(100),
    description       TEXT,
    image_url         VARCHAR(255),
    best_season       VARCHAR(100) DEFAULT 'Year-round',
    entry_fee         INTEGER DEFAULT 0,
    estimated_hours   NUMERIC(4,1) DEFAULT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New tables
CREATE TABLE IF NOT EXISTS admins (
    admin_id    VARCHAR(100) PRIMARY KEY,
    admin_name  VARCHAR(100) NOT NULL,
    admin_email VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS packages (
    package_id    VARCHAR(100) PRIMARY KEY,
    package_name  VARCHAR(50) NOT NULL UNIQUE,
    price         INTEGER DEFAULT 0,
    booking_limit INTEGER DEFAULT 3,
    discount_pct  NUMERIC(5,2) DEFAULT 0,
    priority      BOOLEAN DEFAULT FALSE,
    exclusive     BOOLEAN DEFAULT FALSE,
    features      TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_packages (
    id             SERIAL PRIMARY KEY,
    user_id        VARCHAR(100) NOT NULL,
    package_id     VARCHAR(100) NOT NULL,
    start_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date       DATE,
    payment_status VARCHAR(50) DEFAULT 'active',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (package_id) REFERENCES packages(package_id)
);
"""

DROP_TABLES = """
DROP TABLE IF EXISTS user_packages CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS booking CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS manager CASCADE;
DROP TABLE IF EXISTS guide CASCADE;
DROP TABLE IF EXISTS transportation CASCADE;
DROP TABLE IF EXISTS tourist_spots CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
"""


# ── Seed data insertion ─────────────────────────────────────────────────────

async def seed(db: AsyncSession) -> None:
    """Insert all seed data with properly hashed passwords."""

    # Pre-generate hashes (password123 for everyone except admin)
    user_pass = hash_password("password123")
    admin_pass = hash_password("ComfyGo2026")

    print(f"  User password hash:  {user_pass[:30]}...")
    print(f"  Admin password hash: {admin_pass[:30]}...")
    print()

    # ── Hotels ──────────────────────────────────────────────────────────
    hotels = [
        ("H001", "Hotel Grand Sultan", "Sylhet", "Sylhet", "Zindabazar, Sylhet", "5", 12000, None),
        ("H002", "Rose View Hotel", "Sylhet", "Sylhet", "Shahjalal Uposhohor, Sylhet", "4", 8500, None),
        ("H003", "Nazimgarh Resort", "Sylhet", "Sylhet", "Khadimnagar, Sylhet", "5", 15000, None),
        ("H004", "Pan Pacific Sonargaon", "Dhaka", "Dhaka", "Karwan Bazar, Dhaka", "5", 18000, None),
        ("H005", "Hotel InterContinental", "Dhaka", "Dhaka", "Gulshan, Dhaka", "5", 20000, None),
        ("H006", "Radisson Blu Dhaka", "Dhaka", "Dhaka", "Airport Road, Dhaka", "5", 17000, None),
        ("H007", "Agrabad Hotel", "Chittagong", "Chittagong", "Agrabad, Chattogram", "4", 9000, None),
        ("H008", "The Peninsula Chittagong", "Chittagong", "Chittagong", "GEC Circle, Chattogram", "5", 11000, None),
        ("H009", "Radisson Blu Chattogram Bay View", "Chittagong", "Chittagong", "Karnaphuli, Chattogram", "5", 16000, None),
    ]
    await db.execute(text(
        "INSERT INTO hotels (hotel_registration_number, hotel_name, hotel_division, hotel_district, hotel_location, hotel_rating, hotel_price, hotel_description) "
        "VALUES (:a,:b,:c,:d,:e,:f,:g,:h)"
    ), [{"a": h[0], "b": h[1], "c": h[2], "d": h[3], "e": h[4], "f": h[5], "g": h[6], "h": h[7]} for h in hotels])
    print(f"  ✓ {len(hotels)} hotels inserted")

    # ── Transportation ──────────────────────────────────────────────────
    transports = [
        ("T001", "Train", "Dhaka-Sylhet", 450),
        ("T002", "Train", "Dhaka-Sylhet", 500),
        ("T003", "Train", "Dhaka-Sylhet", 420),
        ("T004", "Train", "Dhaka-Chittagong", 550),
        ("T005", "Train", "Dhaka-Chittagong", 600),
        ("T006", "Train", "Dhaka-Chittagong", 520),
        ("T007", "Train", "Chittagong-Sylhet", 650),
        ("T008", "Train", "Chittagong-Sylhet", 700),
        ("B001", "Bus", "Dhaka-Sylhet", 700),
        ("B002", "Bus", "Dhaka-Sylhet", 650),
        ("B003", "Bus", "Dhaka-Chittagong", 800),
        ("B004", "Bus", "Dhaka-Chittagong", 750),
        ("B005", "Bus", "Chittagong-Sylhet", 900),
        ("A001", "Airplane", "Dhaka-Sylhet", 3500),
        ("A002", "Airplane", "Dhaka-Chittagong", 4000),
        ("A003", "Airplane", "Chittagong-Sylhet", 4500),
        ("L001", "Launch", "Dhaka-Barisal", 600),
        ("L002", "Launch", "Dhaka-Mongla", 900),
        ("L003", "Launch", "Barisal-Chittagong", 1200),
    ]
    await db.execute(text(
        "INSERT INTO transportation (transport_id, transport_type, transport_route, transport_fare) "
        "VALUES (:a,:b,:c,:d)"
    ), [{"a": t[0], "b": t[1], "c": t[2], "d": t[3]} for t in transports])
    print(f"  ✓ {len(transports)} transport options inserted")

    # ── Tourist Spots ───────────────────────────────────────────────────
    spots = [
        ("SP001", "Lalbagh Fort", "Dhaka", "Dhaka", "A 17th-century Mughal fort in the heart of old Dhaka.", None, "Oct–Mar", 20, 2.0),
        ("SP002", "Ahsan Manzil", "Dhaka", "Dhaka", "The Pink Palace — former residence of the Nawabs of Dhaka.", None, "Oct–Mar", 30, 1.5),
        ("SP003", "Sadarghat Launch Terminal", "Dhaka", "Dhaka", "Bustling river port on the Buriganga — a living slice of Dhaka life.", None, "Year-round", 0, 1.0),
        ("SP004", "Dhakeshwari Temple", "Dhaka", "Dhaka", "The national temple of Bangladesh, dating back to the 12th century.", None, "Oct–Mar", 0, 1.0),
        ("SP005", "National Museum Dhaka", "Dhaka", "Dhaka", "Four floors of Bangladesh history, art, and natural heritage.", None, "Year-round", 20, 2.5),
        ("SP006", "Ratargul Swamp Forest", "Sylhet", "Sylhet", "The only freshwater swamp forest in Bangladesh — ethereal when flooded.", None, "Jun–Oct", 50, 3.0),
        ("SP007", "Jaflong", "Sylhet", "Sylhet", "Stone-lined riverbed on the Piyain river at the Indian border.", None, "Sep–Mar", 0, 2.5),
        ("SP008", "Srimangal Tea Gardens", "Sylhet", "Sylhet", "Rolling emerald tea estates — the tea capital of Bangladesh.", None, "Sep–Mar", 0, 3.0),
        ("SP009", "Hazrat Shah Jalal Shrine", "Sylhet", "Sylhet", "The most revered shrine in Sylhet, drawing pilgrims year-round.", None, "Year-round", 0, 1.0),
        ("SP010", "Bichanakandi", "Sylhet", "Sylhet", "Crystal-clear river surrounded by hills at the India border.", None, "Sep–Feb", 0, 3.0),
        ("SP011", "Patenga Sea Beach", "Chittagong", "Chittagong", "A popular sea beach at the mouth of the Karnaphuli river.", None, "Nov–Feb", 0, 2.0),
        ("SP012", "Foy's Lake", "Chittagong", "Chittagong", "A serene artificial lake surrounded by hills and woodland.", None, "Nov–Mar", 150, 2.5),
        ("SP013", "Ethnological Museum", "Chittagong", "Chittagong", "Showcases the tribal and ethnic heritage of Bangladesh.", None, "Year-round", 10, 1.5),
        ("SP014", "Chandranath Hill", "Chittagong", "Chittagong", "Sacred hilltop temple with panoramic views over Sitakunda.", None, "Nov–Feb", 0, 3.0),
        ("SP015", "Kaptai Lake", "Chittagong", "Chittagong", "The largest man-made lake in Bangladesh in the hill tracts.", None, "Nov–Mar", 0, 4.0),
    ]
    await db.execute(text(
        "INSERT INTO tourist_spots (spot_id, spot_name, city, division, description, image_url, best_season, entry_fee, estimated_hours) "
        "VALUES (:a,:b,:c,:d,:e,:f,:g,:h,:i)"
    ), [{"a": s[0], "b": s[1], "c": s[2], "d": s[3], "e": s[4], "f": s[5], "g": s[6], "h": s[7], "i": s[8]} for s in spots])
    print(f"  ✓ {len(spots)} tourist spots inserted")

    # ── Users (Tourists) ────────────────────────────────────────────────
    users = [
        ("USR001", "rahim@example.com", "Rahim Uddin", "+8801712345678"),
        ("USR002", "nusrat@example.com", "Nusrat Jahan", "+8801812345678"),
        ("USR003", "karim@example.com", "Karim Hassan", "+8801912345678"),
    ]
    await db.execute(text(
        "INSERT INTO users (user_id, user_email, user_name, user_phone, password) "
        "VALUES (:a,:b,:c,:d,:e)"
    ), [{"a": u[0], "b": u[1], "c": u[2], "d": u[3], "e": user_pass} for u in users])
    print(f"  ✓ {len(users)} tourist accounts inserted")

    # ── Guides ──────────────────────────────────────────────────────────
    guides = [
        ("NID1001", "Farhan Ahmed", "farhan@example.com", "+8801711111111", "Sylhet", "Sylhet", 2500),
        ("NID1002", "Sabrina Akter", "sabrina@example.com", "+8801811111111", "Dhaka", "Dhaka", 3000),
        ("NID1003", "Tanvir Hossain", "tanvir@example.com", "+8801911111111", "Chittagong", "Chittagong", 2800),
    ]
    await db.execute(text(
        "INSERT INTO guide (guide_nid, guide_name, guide_email, guide_mobile, guide_division, guide_district, guide_rate, password) "
        "VALUES (:a,:b,:c,:d,:e,:f,:g,:h)"
    ), [{"a": g[0], "b": g[1], "c": g[2], "d": g[3], "e": g[4], "f": g[5], "g": g[6], "h": user_pass} for g in guides])
    print(f"  ✓ {len(guides)} guide accounts inserted")

    # ── Managers ────────────────────────────────────────────────────────
    managers = [
        ("MGR001", "Aminul Islam", "aminul@example.com", "+8801722222222", "H001"),
        ("MGR002", "Fatima Begum", "fatima@example.com", "+8801822222222", "H004"),
        ("MGR003", "Rafiq Chowdhury", "rafiq@example.com", "+8801922222222", "H007"),
    ]
    await db.execute(text(
        "INSERT INTO manager (manager_id, manager_name, manager_email, manager_mobile, hotel_registration_number, password) "
        "VALUES (:a,:b,:c,:d,:e,:f)"
    ), [{"a": m[0], "b": m[1], "c": m[2], "d": m[3], "e": m[4], "f": user_pass} for m in managers])
    print(f"  ✓ {len(managers)} manager accounts inserted")

    # ── Admin ───────────────────────────────────────────────────────────
    await db.execute(text(
        "INSERT INTO admins (admin_id, admin_name, admin_email, password) VALUES (:a,:b,:c,:d)"
    ), {"a": "ADM001", "b": "Super Admin", "c": "admin@gmail.com", "d": admin_pass})
    print("  ✓ 1 admin account inserted")

    # ── Packages ────────────────────────────────────────────────────────
    packages = [
        ("PKG001", "Basic", 0, 3, 0, False, False, "3 bookings per month, standard listing, email support"),
        ("PKG002", "Pro", 499, 10, 5, True, False, "10 bookings per month, priority listing, 5% discount, email & chat support"),
        ("PKG003", "Premium", 999, -1, 10, True, False, "Unlimited bookings, priority listing, 10% discount, 24/7 support"),
        ("PKG004", "Ultimate", 1999, -1, 20, True, True, "Unlimited bookings, exclusive deals, 20% discount, 24/7 priority support, free cancellation"),
    ]
    await db.execute(text(
        "INSERT INTO packages (package_id, package_name, price, booking_limit, discount_pct, priority, exclusive, features) "
        "VALUES (:a,:b,:c,:d,:e,:f,:g,:h)"
    ), [{"a": p[0], "b": p[1], "c": p[2], "d": p[3], "e": p[4], "f": p[5], "g": p[6], "h": p[7]} for p in packages])
    print(f"  ✓ {len(packages)} packages inserted")

    # ── Sample Bookings ─────────────────────────────────────────────────
    bookings = [
        ("BK00001", "Hotel", "Confirmed", "USR001", date(2026, 8, 15), None, "H001", None),
        ("BK00002", "Guide", "Pending", "USR002", date(2026, 8, 20), "NID1001", None, None),
        ("BK00003", "Transport", "Pending", "USR003", date(2026, 8, 25), None, None, "T001"),
    ]
    await db.execute(text(
        "INSERT INTO booking (booking_id, booking_type, booking_confirmation, user_id, booking_date, guide_nid, hotel_registration_number, transport_id) "
        "VALUES (:a,:b,:c,:d,:e,:f,:g,:h)"
    ), [{"a": b[0], "b": b[1], "c": b[2], "d": b[3], "e": b[4], "f": b[5], "g": b[6], "h": b[7]} for b in bookings])
    print(f"  ✓ {len(bookings)} sample bookings inserted")

    # ── Sample Payments ─────────────────────────────────────────────────
    payments = [
        ("PY00001", "BK00001", 12000, "USR001", date(2026, 8, 15), "Card"),
        ("PY00002", "BK00002", 2500, "USR002", date(2026, 8, 20), "Card"),
        ("PY00003", "BK00003", 450, "USR003", date(2026, 8, 25), "Card"),
    ]
    await db.execute(text(
        "INSERT INTO payment (payment_id, booking_id, price, user_id, payment_date, payment_method) "
        "VALUES (:a,:b,:c,:d,:e,:f)"
    ), [{"a": p[0], "b": p[1], "c": p[2], "d": p[3], "e": p[4], "f": p[5]} for p in payments])
    print(f"  ✓ {len(payments)} sample payments inserted")

    # ── User-Package Subscriptions ──────────────────────────────────────
    subs = [
        ("USR001", "PKG002", date(2026, 8, 1), date(2026, 8, 31), "active"),
        ("USR002", "PKG001", date(2026, 8, 1), None, "active"),
    ]
    await db.execute(text(
        "INSERT INTO user_packages (user_id, package_id, start_date, end_date, payment_status) "
        "VALUES (:a,:b,:c,:d,:e)"
    ), [{"a": s[0], "b": s[1], "c": s[2], "d": s[3], "e": s[4]} for s in subs])
    print(f"  ✓ {len(subs)} subscriptions inserted")


# ── Main ────────────────────────────────────────────────────────────────────

async def main(db_url: str, drop: bool = False) -> None:
    engine = create_async_engine(db_url, echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        if drop:
            print("\n⏳ Dropping existing tables...")
            await conn.execute(text(DROP_TABLES))
            print("  ✓ All tables dropped\n")

        print("⏳ Creating tables...")
        await conn.execute(text(TABLES))
        print("  ✓ All tables created\n")

    async with session_factory() as db:
        print("⏳ Seeding data...")
        await seed(db)
        await db.commit()

    await engine.dispose()

    print("\n" + "=" * 60)
    print("  ✅  Database seeded successfully!")
    print("=" * 60)
    print()
    print("  Default credentials:")
    print("  ┌─────────────┬──────────────────────────┬──────────────┐")
    print("  │ Role        │ Email                    │ Password     │")
    print("  ├─────────────┼──────────────────────────┼──────────────┤")
    print("  │ Tourist     │ rahim@example.com        │ password123  │")
    print("  │ Guide       │ farhan@example.com       │ password123  │")
    print("  │ Manager     │ aminul@example.com       │ password123  │")
    print("  │ Admin       │ admin@gmail.com           │ ComfyGo2026 │")
    print("  └─────────────┴──────────────────────────┴──────────────┘")
    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the ComfyGo database")
    parser.add_argument(
        "--db-url",
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/comfygo_db",
        help="Async PostgreSQL connection URL",
    )
    parser.add_argument(
        "--drop",
        action="store_true",
        help="Drop all tables before seeding",
    )
    args = parser.parse_args()

    asyncio.run(main(args.db_url, args.drop))
