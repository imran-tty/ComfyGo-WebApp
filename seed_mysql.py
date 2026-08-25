"""
ComfyGo MySQL Seed Script
==========================
Creates all tables and seeds complete data for Sylhet, Dhaka, Chittagong.

Run: cd backend && python seed_mysql.py

Default credentials:
    Tourist:  rahim@example.com   / password123
    Guide:    farhan@example.com  / password123
    Manager:  aminul@example.com  / password123
    Admin:    admin@gmail.com     / ComfyGo2026
"""
import pymysql
import uuid
from datetime import date
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_PASS = ""
DB_NAME = "comfygo_db"

def uid(prefix=""):
    return f"{prefix}{uuid.uuid4().hex[:8].upper()}"

def main():
    conn = pymysql.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, database=DB_NAME, charset="utf8mb4")
    cur = conn.cursor()


    cur.execute("SET FOREIGN_KEY_CHECKS = 0")
    drop_order = [
        "user_packages", "payment", "booking", "contact_messages",
        "manager", "guide", "transportation", "tourist_spots",
        "hotels", "users", "admins", "packages",
    ]
    for table in drop_order:
        cur.execute(f"DROP TABLE IF EXISTS {table}")
    cur.execute("SET FOREIGN_KEY_CHECKS = 1")
    print("[OK] Tables dropped")


    cur.execute("""
        CREATE TABLE users (
            user_id VARCHAR(100) PRIMARY KEY,
            user_email VARCHAR(100) UNIQUE NOT NULL,
            user_name VARCHAR(100) NOT NULL,
            user_phone VARCHAR(20),
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE hotels (
            hotel_registration_number VARCHAR(100) PRIMARY KEY,
            hotel_name VARCHAR(100),
            hotel_division VARCHAR(100),
            hotel_district VARCHAR(100),
            hotel_location VARCHAR(150),
            hotel_rating VARCHAR(50),
            hotel_price INTEGER DEFAULT 0,
            hotel_description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE manager (
            manager_id VARCHAR(100) PRIMARY KEY,
            manager_name VARCHAR(100) NOT NULL,
            manager_email VARCHAR(100) UNIQUE NOT NULL,
            manager_mobile VARCHAR(20),
            hotel_registration_number VARCHAR(100),
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (hotel_registration_number) REFERENCES hotels(hotel_registration_number)
        )
    """)

    cur.execute("""
        CREATE TABLE transportation (
            transport_id VARCHAR(100) PRIMARY KEY,
            transport_type VARCHAR(50),
            transport_route VARCHAR(100),
            transport_fare INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE guide (
            guide_nid VARCHAR(100) PRIMARY KEY,
            guide_name VARCHAR(100) NOT NULL,
            guide_email VARCHAR(100) UNIQUE NOT NULL,
            guide_mobile VARCHAR(20),
            guide_division VARCHAR(100),
            guide_district VARCHAR(100),
            guide_rate INTEGER DEFAULT 0,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE booking (
            booking_id VARCHAR(100) PRIMARY KEY,
            booking_type VARCHAR(100),
            booking_confirmation VARCHAR(100) DEFAULT 'Pending',
            user_id VARCHAR(100),
            booking_date DATE,
            guide_nid VARCHAR(100),
            hotel_registration_number VARCHAR(100),
            transport_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (guide_nid) REFERENCES guide(guide_nid),
            FOREIGN KEY (hotel_registration_number) REFERENCES hotels(hotel_registration_number),
            FOREIGN KEY (transport_id) REFERENCES transportation(transport_id)
        )
    """)

    cur.execute("""
        CREATE TABLE payment (
            payment_id VARCHAR(100) PRIMARY KEY,
            booking_id VARCHAR(100),
            price INTEGER,
            user_id VARCHAR(100),
            payment_date DATE,
            payment_method VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)

    cur.execute("""
        CREATE TABLE contact_messages (
            message_id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            message TEXT NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE tourist_spots (
            spot_id VARCHAR(100) PRIMARY KEY,
            spot_name VARCHAR(150) NOT NULL,
            city VARCHAR(100),
            division VARCHAR(100),
            description TEXT,
            image_url VARCHAR(255),
            best_season VARCHAR(100) DEFAULT 'Year-round',
            entry_fee INTEGER DEFAULT 0,
            estimated_hours DECIMAL(4,1),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE admins (
            admin_id VARCHAR(100) PRIMARY KEY,
            admin_name VARCHAR(100) NOT NULL,
            admin_email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE packages (
            package_id VARCHAR(100) PRIMARY KEY,
            package_name VARCHAR(50) NOT NULL UNIQUE,
            price INTEGER DEFAULT 0,
            booking_limit INTEGER DEFAULT 3,
            transport_limit INTEGER DEFAULT 3,
            hotel_limit INTEGER DEFAULT 2,
            guide_limit INTEGER DEFAULT 1,
            discount_pct DECIMAL(5,2) DEFAULT 0,
            priority BOOLEAN DEFAULT FALSE,
            exclusive BOOLEAN DEFAULT FALSE,
            complementary_breakfast BOOLEAN DEFAULT FALSE,
            complementary_lunch BOOLEAN DEFAULT FALSE,
            complementary_dinner BOOLEAN DEFAULT FALSE,
            features TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE user_packages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(100) NOT NULL,
            package_id VARCHAR(100) NOT NULL,
            start_date DATE DEFAULT (CURRENT_DATE),
            end_date DATE,
            payment_status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (package_id) REFERENCES packages(package_id)
        )
    """)
    print("[OK] All tables created")


    user_pass = pwd_context.hash("password123")
    admin_pass = pwd_context.hash("ComfyGo2026")


    hotels = [
        ("H001", "Hotel Grand Sultan", "Sylhet", "Sylhet", "Zindabazar, Sylhet", "5", 12000, "Luxury 5-star resort with panoramic valley views and world-class amenities."),
        ("H002", "Rose View Hotel", "Sylhet", "Sylhet", "Shahjalal Uposhohor, Sylhet", "4", 8500, "Modern hotel in the heart of Sylhet with comfortable rooms and garden views."),
        ("H003", "Nazimgarh Resort", "Sylhet", "Sylhet", "Khadimnagar, Sylhet", "5", 15000, "Heritage resort surrounded by lush greenery and tea gardens."),
        ("H004", "Pan Pacific Sonargaon", "Dhaka", "Dhaka", "Karwan Bazar, Dhaka", "5", 18000, "Iconic Dhaka hotel with modern luxury and excellent dining options."),
        ("H005", "Hotel InterContinental", "Dhaka", "Dhaka", "Gulshan, Dhaka", "5", 20000, "Premium international hotel in the business district of Dhaka."),
        ("H006", "Radisson Blu Dhaka", "Dhaka", "Dhaka", "Airport Road, Dhaka", "5", 17000, "Elegant hotel near the airport with rooftop pool and spa."),
        ("H007", "Agrabad Hotel", "Chittagong", "Chittagong", "Agrabad, Chattogram", "4", 9000, "Comfortable hotel in the commercial hub of Chittagong."),
        ("H008", "The Peninsula Chittagong", "Chittagong", "Chittagong", "GEC Circle, Chattogram", "5", 11000, "Modern luxury hotel with bay views and premium facilities."),
        ("H009", "Radisson Blu Chattogram Bay View", "Chittagong", "Chittagong", "Karnaphuli, Chattogram", "5", 16000, "Stunning bay-view hotel with world-class service."),
    ]
    cur.executemany(
        "INSERT INTO hotels (hotel_registration_number, hotel_name, hotel_division, hotel_district, hotel_location, hotel_rating, hotel_price, hotel_description) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        hotels
    )
    print(f"  [OK] {len(hotels)} hotels inserted")


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
    cur.executemany(
        "INSERT INTO transportation (transport_id, transport_type, transport_route, transport_fare) VALUES (%s,%s,%s,%s)",
        transports
    )
    print(f"  [OK] {len(transports)} transport options inserted")


    spots = [
        ("SP001", "Lalbagh Fort", "Dhaka", "Dhaka", "A 17th-century Mughal fort in the heart of old Dhaka.", None, "Oct-Mar", 20, 2.0),
        ("SP002", "Ahsan Manzil", "Dhaka", "Dhaka", "The Pink Palace — former residence of the Nawabs of Dhaka.", None, "Oct-Mar", 30, 1.5),
        ("SP003", "Sadarghat Launch Terminal", "Dhaka", "Dhaka", "Bustling river port on the Buriganga — a living slice of Dhaka life.", None, "Year-round", 0, 1.0),
        ("SP004", "Dhakeshwari Temple", "Dhaka", "Dhaka", "The national temple of Bangladesh, dating back to the 12th century.", None, "Oct-Mar", 0, 1.0),
        ("SP005", "National Museum Dhaka", "Dhaka", "Dhaka", "Four floors of Bangladesh history, art, and natural heritage.", None, "Year-round", 20, 2.5),
        ("SP006", "Ratargul Swamp Forest", "Sylhet", "Sylhet", "The only freshwater swamp forest in Bangladesh — ethereal when flooded.", None, "Jun-Oct", 50, 3.0),
        ("SP007", "Jaflong", "Sylhet", "Sylhet", "Stone-lined riverbed on the Piyain river at the Indian border.", None, "Sep-Mar", 0, 2.5),
        ("SP008", "Srimangal Tea Gardens", "Sylhet", "Sylhet", "Rolling emerald tea estates — the tea capital of Bangladesh.", None, "Sep-Mar", 0, 3.0),
        ("SP009", "Hazrat Shah Jalal Shrine", "Sylhet", "Sylhet", "The most revered shrine in Sylhet, drawing pilgrims year-round.", None, "Year-round", 0, 1.0),
        ("SP010", "Bichanakandi", "Sylhet", "Sylhet", "Crystal-clear river surrounded by hills at the India border.", None, "Sep-Feb", 0, 3.0),
        ("SP011", "Patenga Sea Beach", "Chittagong", "Chittagong", "A popular sea beach at the mouth of the Karnaphuli river.", None, "Nov-Feb", 0, 2.0),
        ("SP012", "Foy's Lake", "Chittagong", "Chittagong", "A serene artificial lake surrounded by hills and woodland.", None, "Nov-Mar", 150, 2.5),
        ("SP013", "Ethnological Museum", "Chittagong", "Chittagong", "Showcases the tribal and ethnic heritage of Bangladesh.", None, "Year-round", 10, 1.5),
        ("SP014", "Chandranath Hill", "Chittagong", "Chittagong", "Sacred hilltop temple with panoramic views over Sitakunda.", None, "Nov-Feb", 0, 3.0),
        ("SP015", "Kaptai Lake", "Chittagong", "Chittagong", "The largest man-made lake in Bangladesh in the hill tracts.", None, "Nov-Mar", 0, 4.0),
    ]
    cur.executemany(
        "INSERT INTO tourist_spots (spot_id, spot_name, city, division, description, image_url, best_season, entry_fee, estimated_hours) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        spots
    )
    print(f"  [OK] {len(spots)} tourist spots inserted")


    users = [
        ("USR001", "rahim@example.com", "Rahim Uddin", "+8801712345678"),
        ("USR002", "nusrat@example.com", "Nusrat Jahan", "+8801812345678"),
        ("USR003", "karim@example.com", "Karim Hassan", "+8801912345678"),
    ]
    cur.executemany(
        "INSERT INTO users (user_id, user_email, user_name, user_phone, password) VALUES (%s,%s,%s,%s,%s)",
        [(u[0], u[1], u[2], u[3], user_pass) for u in users]
    )
    print(f"  [OK] {len(users)} tourist accounts inserted")


    guides = [
        ("NID1001", "Farhan Ahmed", "farhan@example.com", "+8801711111111", "Sylhet", "Sylhet", 2500),
        ("NID1002", "Sabrina Akter", "sabrina@example.com", "+8801811111111", "Dhaka", "Dhaka", 3000),
        ("NID1003", "Tanvir Hossain", "tanvir@example.com", "+8801911111111", "Chittagong", "Chittagong", 2800),
    ]
    cur.executemany(
        "INSERT INTO guide (guide_nid, guide_name, guide_email, guide_mobile, guide_division, guide_district, guide_rate, password) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        [(g[0], g[1], g[2], g[3], g[4], g[5], g[6], user_pass) for g in guides]
    )
    print(f"  [OK] {len(guides)} guide accounts inserted")


    managers = [
        ("MGR001", "Aminul Islam", "aminul@example.com", "+8801722222222", "H001"),
        ("MGR002", "Fatima Begum", "fatima@example.com", "+8801822222222", "H004"),
        ("MGR003", "Rafiq Chowdhury", "rafiq@example.com", "+8801922222222", "H007"),
    ]
    cur.executemany(
        "INSERT INTO manager (manager_id, manager_name, manager_email, manager_mobile, hotel_registration_number, password) VALUES (%s,%s,%s,%s,%s,%s)",
        [(m[0], m[1], m[2], m[3], m[4], user_pass) for m in managers]
    )
    print(f"  [OK] {len(managers)} manager accounts inserted")


    cur.execute(
        "INSERT INTO admins (admin_id, admin_name, admin_email, password) VALUES (%s,%s,%s,%s)",
        ("ADM001", "Super Admin", "admin@gmail.com", admin_pass)
    )
    print("  [OK] 1 admin account inserted")


    packages = [
        ("PKG001", "Explorer", 0, 3, 2, 1, 1, 0, False, False, False, False, False, "Basic booking access, email support"),
        ("PKG002", "Traveller", 2500, 10, 5, 3, 2, 10, True, False, True, False, False, "Priority booking, free breakfast, 10% discount"),
        ("PKG003", "Luxury", 8000, 999, 999, 999, 999, 25, False, True, True, True, True, "Unlimited bookings, all meals included, 25% discount, VIP support"),
    ]
    cur.executemany(
        "INSERT INTO packages (package_id, package_name, price, booking_limit, transport_limit, hotel_limit, guide_limit, discount_pct, priority, exclusive, complementary_breakfast, complementary_lunch, complementary_dinner, features) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        packages
    )
    print(f"  [OK] {len(packages)} packages inserted")


    bookings = [
        ("BK00001", "Hotel", "Confirmed", "USR001", date(2026, 8, 15), None, "H001", None),
        ("BK00002", "Guide", "Pending", "USR002", date(2026, 8, 20), "NID1001", None, None),
        ("BK00003", "Transport", "Pending", "USR003", date(2026, 8, 25), None, None, "T001"),
    ]
    cur.executemany(
        "INSERT INTO booking (booking_id, booking_type, booking_confirmation, user_id, booking_date, guide_nid, hotel_registration_number, transport_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        bookings
    )
    print(f"  [OK] {len(bookings)} sample bookings inserted")


    payments = [
        ("PY00001", "BK00001", 12000, "USR001", date(2026, 8, 15), "Card"),
        ("PY00002", "BK00002", 2500, "USR002", date(2026, 8, 20), "Card"),
        ("PY00003", "BK00003", 450, "USR003", date(2026, 8, 25), "Card"),
    ]
    cur.executemany(
        "INSERT INTO payment (payment_id, booking_id, price, user_id, payment_date, payment_method) VALUES (%s,%s,%s,%s,%s,%s)",
        payments
    )
    print(f"  [OK] {len(payments)} sample payments inserted")


    subs = [
        ("USR001", "PKG002", date(2026, 8, 1), date(2026, 8, 31), "active"),
        ("USR002", "PKG001", date(2026, 8, 1), None, "active"),
    ]
    cur.executemany(
        "INSERT INTO user_packages (user_id, package_id, start_date, end_date, payment_status) VALUES (%s,%s,%s,%s,%s)",
        subs
    )
    print(f"  [OK] {len(subs)} subscriptions inserted")

    conn.commit()
    cur.close()
    conn.close()

    print("\n" + "=" * 60)
    print("  [DONE]  Database seeded successfully!")
    print("=" * 60)
    print()
    print("  Default credentials:")
    print("  ┌─────────────┬──────────────────────────┬──────────────┐")
    print("  │ Role        │ Email                    │ Password     │")
    print("  ├─────────────┼──────────────────────────┼──────────────┤")
    print("  │ Tourist     │ rahim@example.com        │ password123  │")
    print("  │ Guide       │ farhan@example.com       │ password123  │")
    print("  │ Manager     │ aminul@example.com       │ password123  │")
    print("  │ Admin       │ admin@gmail.com          │ ComfyGo2026  │")
    print("  └─────────────┴──────────────────────────┴──────────────┘")
    print()


if __name__ == "__main__":
    main()
