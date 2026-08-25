"""Unit tests for Pydantic schema validation."""

import pytest
from pydantic import ValidationError

from app.schemas.schemas import (
    AdminLoginRequest,
    BookingApprovalRequest,
    ContactMessageRequest,
    ForgotPasswordRequest,
    GuideBookingRequest,
    GuideProfileUpdate,
    GuideSignupRequest,
    HotelBookingRequest,
    HotelUpdate,
    LoginRequest,
    ManagerProfileUpdate,
    ManagerSignupRequest,
    PackageCreate,
    PackageUpdate,
    PasswordResetRequest,
    TouristProfileUpdate,
    TouristSignupRequest,
    TransportBookingRequest,
)


class TestLoginRequest:
    def test_valid(self):
        req = LoginRequest(email="a@b.com", password="pass")
        assert req.email == "a@b.com"

    def test_missing_email(self):
        with pytest.raises(ValidationError):
            LoginRequest(password="pass")

    def test_missing_password(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="a@b.com")


class TestAdminLoginRequest:
    def test_valid(self):
        req = AdminLoginRequest(email="admin@test.com", password="admin123")
        assert req.email == "admin@test.com"


class TestTouristSignupRequest:
    def test_valid(self):
        req = TouristSignupRequest(
            user_id="USR001",
            user_name="John",
            user_email="john@test.com",
            user_phone="01700000000",
            password="pass123",
            confirm_password="pass123",
        )
        assert req.user_id == "USR001"

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            TouristSignupRequest(
                user_id="USR001",
                user_name="John",
                user_email="not-an-email",
                user_phone="01700000000",
                password="pass123",
                confirm_password="pass123",
            )

    def test_missing_fields(self):
        with pytest.raises(ValidationError):
            TouristSignupRequest(user_id="USR001")


class TestGuideSignupRequest:
    def test_valid(self):
        req = GuideSignupRequest(
            guide_nid="GID001",
            guide_name="Guide One",
            guide_email="guide@test.com",
            guide_mobile="01700000000",
            guide_division="Sylhet",
            guide_district="Sylhet",
            password="pass123",
            confirm_password="pass123",
        )
        assert req.guide_nid == "GID001"


class TestManagerSignupRequest:
    def test_valid(self):
        req = ManagerSignupRequest(
            manager_id="MGR001",
            manager_name="Manager One",
            manager_email="mgr@test.com",
            manager_mobile="01700000000",
            hotel_registration_number="H001",
            password="pass123",
            confirm_password="pass123",
        )
        assert req.manager_id == "MGR001"


class TestTouristProfileUpdate:
    def test_valid(self):
        req = TouristProfileUpdate(
            user_name="New Name",
            user_email="new@test.com",
            user_phone="01800000000",
        )
        assert req.user_name == "New Name"

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            TouristProfileUpdate(
                user_name="Name",
                user_email="bad-email",
                user_phone="01800000000",
            )


class TestGuideProfileUpdate:
    def test_valid(self):
        req = GuideProfileUpdate(
            guide_name="Guide",
            guide_email="g@test.com",
            guide_mobile="01700000000",
            guide_division="Sylhet",
            guide_district="Sylhet",
            guide_rate=2000,
        )
        assert req.guide_rate == 2000


class TestManagerProfileUpdate:
    def test_valid(self):
        req = ManagerProfileUpdate(
            manager_name="Manager",
            manager_email="m@test.com",
            manager_mobile="01700000000",
        )
        assert req.manager_name == "Manager"


class TestHotelUpdate:
    def test_valid(self):
        req = HotelUpdate(
            hotel_name="Grand Hotel",
            hotel_division="Dhaka",
            hotel_district="Dhaka",
            hotel_location="Gulshan",
            hotel_rating="5",
            hotel_price=15000,
            hotel_description="Luxury",
        )
        assert req.hotel_price == 15000


class TestTransportBookingRequest:
    def test_valid(self):
        req = TransportBookingRequest(transport_id="TR001", travel_date="2026-09-01")
        assert req.transport_id == "TR001"


class TestHotelBookingRequest:
    def test_valid(self):
        req = HotelBookingRequest(hotel_reg="H001", checkin="2026-09-01")
        assert req.hotel_reg == "H001"


class TestGuideBookingRequest:
    def test_valid(self):
        req = GuideBookingRequest(guide_nid="GID001", guide_date="2026-09-01")
        assert req.guide_nid == "GID001"


class TestBookingApprovalRequest:
    def test_valid(self):
        req = BookingApprovalRequest(booking_id="BK001")
        assert req.booking_id == "BK001"


class TestContactMessageRequest:
    def test_valid(self):
        req = ContactMessageRequest(
            name="Test", email="t@test.com", phone="017", message="Hello world!"
        )
        assert req.name == "Test"

    def test_optional_phone(self):
        req = ContactMessageRequest(
            name="Test", email="t@test.com", message="Hello world!"
        )
        assert req.phone == ""

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            ContactMessageRequest(
                name="Test", email="not-email", message="Hello world!"
            )


class TestPasswordResetRequest:
    def test_valid(self):
        req = PasswordResetRequest(new_password="new123", confirm_password="new123")
        assert req.new_password == "new123"


class TestForgotPasswordRequest:
    def test_valid(self):
        req = ForgotPasswordRequest(email="user@test.com")
        assert req.email == "user@test.com"


class TestPackageCreate:
    def test_valid(self):
        req = PackageCreate(package_name="Gold", price=5000)
        assert req.package_name == "Gold"
        assert req.price == 5000

    def test_defaults(self):
        req = PackageCreate(package_name="Silver")
        assert req.price == 0
        assert req.booking_limit == 3
        assert req.priority is False


class TestPackageUpdate:
    def test_partial_update(self):
        req = PackageUpdate(price=3000)
        assert req.price == 3000
        assert req.package_name is None
