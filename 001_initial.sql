-- =============================================================================
-- ComfyGo PostgreSQL Migration
-- Converted from MySQL (comfygo_db.sql) + new admin, packages, subscriptions
-- =============================================================================

-- ─────────────────────────────────────────────
-- EXISTING TABLES (MySQL → PostgreSQL)
-- ─────────────────────────────────────────────

CREATE TABLE users (
    user_id       VARCHAR(100) PRIMARY KEY,
    user_email    VARCHAR(100) UNIQUE NOT NULL,
    user_name     VARCHAR(100) NOT NULL,
    user_phone    VARCHAR(20),
    password      VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotels (
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

CREATE TABLE manager (
    manager_id                VARCHAR(100) PRIMARY KEY,
    manager_name              VARCHAR(100) NOT NULL,
    manager_email             VARCHAR(100) UNIQUE NOT NULL,
    manager_mobile            VARCHAR(20),
    hotel_registration_number VARCHAR(100),
    password                  VARCHAR(255) NOT NULL,
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_registration_number) REFERENCES hotels(hotel_registration_number)
);

CREATE TABLE transportation (
    transport_id    VARCHAR(100) PRIMARY KEY,
    transport_type  VARCHAR(50),
    transport_route VARCHAR(100),
    transport_fare  INTEGER
);

CREATE TABLE guide (
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

CREATE TABLE booking (
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

CREATE TABLE payment (
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

CREATE TABLE contact_messages (
    message_id    VARCHAR(100) PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL,
    phone         VARCHAR(20),
    message       TEXT NOT NULL,
    submitted_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tourist_spots (
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

-- ─────────────────────────────────────────────
-- NEW TABLES
-- ─────────────────────────────────────────────

-- Admins table (separate from other roles)
CREATE TABLE admins (
    admin_id    VARCHAR(100) PRIMARY KEY,
    admin_name  VARCHAR(100) NOT NULL,
    admin_email VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription packages
CREATE TABLE packages (
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

-- User-package assignments
CREATE TABLE user_packages (
    id            SERIAL PRIMARY KEY,
    user_id       VARCHAR(100) NOT NULL,
    package_id    VARCHAR(100) NOT NULL,
    start_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date      DATE,
    payment_status VARCHAR(50) DEFAULT 'active',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (package_id) REFERENCES packages(package_id)
);

-- ─────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────

-- Hotels
INSERT INTO hotels (hotel_registration_number, hotel_name, hotel_division, hotel_district, hotel_location, hotel_rating, hotel_price) VALUES
('H001','Hotel Grand Sultan','Sylhet','Sylhet','Zindabazar, Sylhet','5',12000),
('H002','Rose View Hotel','Sylhet','Sylhet','Shahjalal Uposhohor, Sylhet','4',8500),
('H003','Nazimgarh Resort','Sylhet','Sylhet','Khadimnagar, Sylhet','5',15000),
('H004','Pan Pacific Sonargaon','Dhaka','Dhaka','Karwan Bazar, Dhaka','5',18000),
('H005','Hotel InterContinental','Dhaka','Dhaka','Gulshan, Dhaka','5',20000),
('H006','Radisson Blu Dhaka','Dhaka','Dhaka','Airport Road, Dhaka','5',17000),
('H007','Agrabad Hotel','Chittagong','Chittagong','Agrabad, Chattogram','4',9000),
('H008','The Peninsula Chittagong','Chittagong','Chittagong','GEC Circle, Chattogram','5',11000),
('H009','Radisson Blu Chattogram Bay View','Chittagong','Chittagong','Karnaphuli, Chattogram','5',16000);

-- Transportation
INSERT INTO transportation (transport_id, transport_type, transport_route, transport_fare) VALUES
('T001','Train','Dhaka-Sylhet',450),
('T002','Train','Dhaka-Sylhet',500),
('T003','Train','Dhaka-Sylhet',420),
('T004','Train','Dhaka-Chittagong',550),
('T005','Train','Dhaka-Chittagong',600),
('T006','Train','Dhaka-Chittagong',520),
('T007','Train','Chittagong-Sylhet',650),
('T008','Train','Chittagong-Sylhet',700),
('B001','Bus','Dhaka-Sylhet',700),
('B002','Bus','Dhaka-Sylhet',650),
('B003','Bus','Dhaka-Chittagong',800),
('B004','Bus','Dhaka-Chittagong',750),
('B005','Bus','Chittagong-Sylhet',900),
('A001','Airplane','Dhaka-Sylhet',3500),
('A002','Airplane','Dhaka-Chittagong',4000),
('A003','Airplane','Chittagong-Sylhet',4500),
('L001','Launch','Dhaka-Barisal',600),
('L002','Launch','Dhaka-Mongla',900),
('L003','Launch','Barisal-Chittagong',1200);

-- Tourist Spots
INSERT INTO tourist_spots (spot_id, spot_name, city, division, description, best_season, entry_fee, estimated_hours) VALUES
('SP001','Lalbagh Fort','Dhaka','Dhaka','A 17th-century Mughal fort in the heart of old Dhaka.','Oct–Mar',20,2.0),
('SP002','Ahsan Manzil','Dhaka','Dhaka','The Pink Palace — former residence of the Nawabs of Dhaka.','Oct–Mar',30,1.5),
('SP003','Sadarghat Launch Terminal','Dhaka','Dhaka','Bustling river port on the Buriganga — a living slice of Dhaka life.','Year-round',0,1.0),
('SP004','Dhakeshwari Temple','Dhaka','Dhaka','The national temple of Bangladesh, dating back to the 12th century.','Oct–Mar',0,1.0),
('SP005','National Museum Dhaka','Dhaka','Dhaka','Four floors of Bangladesh history, art, and natural heritage.','Year-round',20,2.5),
('SP006','Ratargul Swamp Forest','Sylhet','Sylhet','The only freshwater swamp forest in Bangladesh — ethereal when flooded.','Jun–Oct',50,3.0),
('SP007','Jaflong','Sylhet','Sylhet','Stone-lined riverbed on the Piyain river at the Indian border.','Sep–Mar',0,2.5),
('SP008','Srimangal Tea Gardens','Sylhet','Sylhet','Rolling emerald tea estates — the tea capital of Bangladesh.','Sep–Mar',0,3.0),
('SP009','Hazrat Shah Jalal Shrine','Sylhet','Sylhet','The most revered shrine in Sylhet, drawing pilgrims year-round.','Year-round',0,1.0),
('SP010','Bichanakandi','Sylhet','Sylhet','Crystal-clear river surrounded by hills at the India border.','Sep–Feb',0,3.0),
('SP011','Patenga Sea Beach','Chittagong','Chittagong','A popular sea beach at the mouth of the Karnaphuli river.','Nov–Feb',0,2.0),
('SP012','Foy''s Lake','Chittagong','Chittagong','A serene artificial lake surrounded by hills and woodland.','Nov–Mar',150,2.5),
('SP013','Ethnological Museum','Chittagong','Chittagong','Showcases the tribal and ethnic heritage of Bangladesh.','Year-round',10,1.5),
('SP014','Chandranath Hill','Chittagong','Chittagong','Sacred hilltop temple with panoramic views over Sitakunda.','Nov–Feb',0,3.0),
('SP015','Kaptai Lake','Chittagong','Chittagong','The largest man-made lake in Bangladesh in the hill tracts.','Nov–Mar',0,4.0);

-- Package tiers
INSERT INTO packages (package_id, package_name, price, booking_limit, discount_pct, priority, exclusive, features) VALUES
('PKG001','Basic',0,3,0,FALSE,FALSE,'3 bookings per month, standard listing, email support'),
('PKG002','Pro',499,10,5,TRUE,FALSE,'10 bookings per month, priority listing, 5% discount, email & chat support'),
('PKG003','Premium',999,-1,10,TRUE,FALSE,'Unlimited bookings, priority listing, 10% discount, 24/7 support'),
('PKG004','Ultimate',1999,-1,20,TRUE,TRUE,'Unlimited bookings, exclusive deals, 20% discount, 24/7 priority support, free cancellation');

-- Sample users (passwords are bcrypt hashes of "password123")
INSERT INTO users (user_id, user_email, user_name, user_phone, password) VALUES
('USR001','rahim@example.com','Rahim Uddin','+8801712345678','$2b$12$JzaiRvK1oZz3IzTpnyDAF.MM64mSYvLjcRpUyN9RD6CEgd3OMMTQ.'),
('USR002','nusrat@example.com','Nusrat Jahan','+8801812345678','$2b$12$JzaiRvK1oZz3IzTpnyDAF.MM64mSYvLjcRpUyN9RD6CEgd3OMMTQ.'),
('USR003','karim@example.com','Karim Hassan','+8801912345678','$2b$12$JzaiRvK1oZz3IzTpnyDAF.MM64mSYvLjcRpUyN9RD6CEgd3OMMTQ.');

-- Sample guides
INSERT INTO guide (guide_nid, guide_name, guide_email, guide_mobile, guide_division, guide_district, guide_rate, password) VALUES
('NID1001','Farhan Ahmed','farhan@example.com','+8801711111111','Sylhet','Sylhet',2500,'$2b$12$JzaiRvK1oZz3IzTpnyDAF.MM64mSYvLjcRpUyN9RD6CEgd3OMMTQ.'),
('NID1002','Sabrina Akter','sabrina@example.com','+8801811111111','Dhaka','Dhaka',3000,'$2b$12$JzaiRvK1oZz3IzTpnyDAF.MM64mSYvLjcRpUyN9RD6CEgd3OMMTQ.'),
('NID1003','Tanvir Hossain','tanvir@example.com','+8801911111111','Chittagong','Chittagong',2800,'$2b$12$JzaiRvK1oZz3IzTpnyDAF.MM64mSYvLjcRpUyN9RD6CEgd3OMMTQ.');

-- Sample managers
INSERT INTO manager (manager_id, manager_name, manager_email, manager_mobile, hotel_registration_number, password) VALUES
('MGR001','Aminul Islam','aminul@example.com','+8801722222222','H001','$2b$12$JzaiRvK1oZz3IzTpnyDAF.MM64mSYvLjcRpUyN9RD6CEgd3OMMTQ.'),
('MGR002','Fatima Begum','fatima@example.com','+8801822222222','H004','$2b$12$JzaiRvK1oZz3IzTpnyDAF.MM64mSYvLjcRpUyN9RD6CEgd3OMMTQ.'),
('MGR003','Rafiq Chowdhury','rafiq@example.com','+8801922222222','H007','$2b$12$JzaiRvK1oZz3IzTpnyDAF.MM64mSYvLjcRpUyN9RD6CEgd3OMMTQ.');

-- Sample admin (password: admin123)
INSERT INTO admins (admin_id, admin_name, admin_email, password) VALUES
('ADM001','Super Admin','admin@comfygo.com','$2b$12$kY1QaAVdvcshcOxHwpXCyu6wpSwkjgo5JesB.ifjGB9ZChpWVTQf.');

-- Sample bookings
INSERT INTO booking (booking_id, booking_type, booking_confirmation, user_id, booking_date, hotel_registration_number) VALUES
('BK00001','Hotel','Confirmed','USR001','2026-08-15','H001'),
('BK00002','Guide','Pending','USR002','2026-08-20','NID1001'),
('BK00003','Transport','Pending','USR003','2026-08-25','T001');

-- Sample payments
INSERT INTO payment (payment_id, booking_id, price, user_id, payment_date, payment_method) VALUES
('PY00001','BK00001',12000,'USR001','2026-08-15','Card'),
('PY00002','BK00002',2500,'USR002','2026-08-20','Card'),
('PY00003','BK00003',450,'USR003','2026-08-25','Card');

-- Assign packages to sample users
INSERT INTO user_packages (user_id, package_id, start_date, end_date, payment_status) VALUES
('USR001','PKG002','2026-08-01','2026-08-31','active'),
('USR002','PKG001','2026-08-01',NULL,'active');
