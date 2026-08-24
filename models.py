from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    Column, String, Integer, Text, Date, DateTime, Numeric, Boolean, ForeignKey, TIMESTAMP
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column("user_id", String(100), primary_key=True)
    user_email = Column("user_email", String(100), unique=True, nullable=False)
    user_name = Column("user_name", String(100), nullable=False)
    user_phone = Column("user_phone", String(20))
    password = Column("password", String(255), nullable=False)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="user", foreign_keys="Booking.user_id")
    payments = relationship("Payment", back_populates="user", foreign_keys="Payment.user_id")
    packages = relationship("UserPackage", back_populates="user")


class Hotel(Base):
    __tablename__ = "hotels"

    hotel_registration_number = Column(String(100), primary_key=True)
    hotel_name = Column(String(100))
    hotel_division = Column(String(100))
    hotel_district = Column(String(100))
    hotel_location = Column(String(150))
    hotel_rating = Column(String(50))
    hotel_price = Column(Integer, default=0)
    hotel_description = Column(Text, default=None)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)

    managers = relationship("Manager", back_populates="hotel", foreign_keys="Manager.hotel_registration_number")
    bookings = relationship("Booking", back_populates="hotel", foreign_keys="Booking.hotel_registration_number")


class Manager(Base):
    __tablename__ = "manager"

    manager_id = Column("manager_id", String(100), primary_key=True)
    manager_name = Column("manager_name", String(100), nullable=False)
    manager_email = Column("manager_email", String(100), unique=True, nullable=False)
    manager_mobile = Column("manager_mobile", String(20))
    hotel_registration_number = Column("hotel_registration_number", String(100), ForeignKey("hotels.hotel_registration_number"))
    password = Column("password", String(255), nullable=False)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)

    hotel = relationship("Hotel", back_populates="managers", foreign_keys=[hotel_registration_number])


class Transportation(Base):
    __tablename__ = "transportation"

    transport_id = Column("transport_id", String(100), primary_key=True)
    transport_type = Column("transport_type", String(50))
    transport_route = Column("transport_route", String(100))
    transport_fare = Column("transport_fare", Integer)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="transport")


class Guide(Base):
    __tablename__ = "guide"

    guide_nid = Column("guide_nid", String(100), primary_key=True)
    guide_name = Column("guide_name", String(100), nullable=False)
    guide_email = Column("guide_email", String(100), unique=True, nullable=False)
    guide_mobile = Column("guide_mobile", String(20))
    guide_division = Column("guide_division", String(100))
    guide_district = Column("guide_district", String(100))
    guide_rate = Column("guide_rate", Integer, default=0)
    password = Column("password", String(255), nullable=False)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="guide")


class Booking(Base):
    __tablename__ = "booking"

    booking_id = Column("booking_id", String(100), primary_key=True)
    booking_type = Column("booking_type", String(100))
    booking_confirmation = Column("booking_confirmation", String(100), default="Pending")
    user_id = Column("user_id", String(100), ForeignKey("users.user_id"))
    booking_date = Column("booking_date", Date)
    guide_nid = Column("guide_nid", String(100), ForeignKey("guide.guide_nid"))
    hotel_registration_number = Column("hotel_registration_number", String(100), ForeignKey("hotels.hotel_registration_number"))
    transport_id = Column("transport_id", String(100), ForeignKey("transportation.transport_id"))
    created_at = Column("created_at", DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings", foreign_keys=[user_id])
    guide = relationship("Guide", back_populates="bookings", foreign_keys=[guide_nid])
    hotel = relationship("Hotel", back_populates="bookings", foreign_keys=[hotel_registration_number])
    transport = relationship("Transportation", back_populates="bookings", foreign_keys=[transport_id])
    payment = relationship("Payment", back_populates="booking", uselist=False)


class Payment(Base):
    __tablename__ = "payment"

    payment_id = Column("payment_id", String(100), primary_key=True)
    booking_id = Column("booking_id", String(100), ForeignKey("booking.booking_id"))
    price = Column("price", Integer)
    user_id = Column("user_id", String(100), ForeignKey("users.user_id"))
    payment_date = Column("payment_date", Date)
    payment_method = Column("payment_method", String(50))
    created_at = Column("created_at", DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payment", foreign_keys=[booking_id])
    user = relationship("User", back_populates="payments", foreign_keys=[user_id])


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    message_id = Column("message_id", String(100), primary_key=True)
    name = Column("name", String(100), nullable=False)
    email = Column("email", String(100), nullable=False)
    phone = Column("phone", String(20))
    message = Column("message", Text, nullable=False)
    submitted_at = Column("submitted_at", DateTime, default=datetime.utcnow)


class TouristSpot(Base):
    __tablename__ = "tourist_spots"

    spot_id = Column(String(100), primary_key=True)
    spot_name = Column("spot_name", String(150), nullable=False)
    city = Column("city", String(100))
    division = Column("division", String(100))
    description = Column("description", Text)
    image_url = Column("image_url", String(255))
    best_season = Column("best_season", String(100), default="Year-round")
    entry_fee = Column("entry_fee", Integer, default=0)
    estimated_hours = Column("estimated_hours", Numeric(4, 1), default=None)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)


class Admin(Base):
    __tablename__ = "admins"

    admin_id = Column(String(100), primary_key=True)
    admin_name = Column(String(100), nullable=False)
    admin_email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)


class Package(Base):
    __tablename__ = "packages"

    package_id = Column(String(100), primary_key=True)
    package_name = Column("package_name", String(50), nullable=False, unique=True)
    price = Column("price", Integer, default=0)
    booking_limit = Column("booking_limit", Integer, default=3)
    transport_limit = Column("transport_limit", Integer, default=3)
    hotel_limit = Column("hotel_limit", Integer, default=2)
    guide_limit = Column("guide_limit", Integer, default=1)
    discount_pct = Column("discount_pct", Numeric(5, 2), default=0)
    priority = Column("priority", Boolean, default=False)
    exclusive = Column("exclusive", Boolean, default=False)
    complementary_breakfast = Column("complementary_breakfast", Boolean, default=False)
    complementary_lunch = Column("complementary_lunch", Boolean, default=False)
    complementary_dinner = Column("complementary_dinner", Boolean, default=False)
    features = Column("features", Text)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)

    user_packages = relationship("UserPackage", back_populates="package")


class UserPackage(Base):
    __tablename__ = "user_packages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column("user_id", String(100), ForeignKey("users.user_id"), nullable=False)
    package_id = Column("package_id", String(100), ForeignKey("packages.package_id"), nullable=False)
    start_date = Column("start_date", Date, default=date.today)
    end_date = Column("end_date", Date, nullable=True)
    payment_status = Column("payment_status", String(50), default="active")
    created_at = Column("created_at", DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="packages", foreign_keys=[user_id])
    package = relationship("Package", back_populates="user_packages", foreign_keys=[package_id])
