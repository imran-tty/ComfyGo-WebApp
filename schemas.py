from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ─── Auth ───────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    user_name: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str  # verification token sent to email
    new_password: str
    confirm_password: str


# ─── Tourist Signup ─────────────────────────────────

class TouristSignupRequest(BaseModel):
    user_id: str
    user_name: str
    user_email: EmailStr
    user_phone: str
    password: str
    confirm_password: str


class GuideSignupRequest(BaseModel):
    guide_nid: str
    guide_name: str
    guide_email: EmailStr
    guide_mobile: str
    guide_division: str
    guide_district: str
    password: str
    confirm_password: str


class ManagerSignupRequest(BaseModel):
    manager_id: str
    manager_name: str
    manager_email: EmailStr
    manager_mobile: str
    hotel_registration_number: str
    password: str
    confirm_password: str


# ─── Profile Updates ────────────────────────────────

class TouristProfileUpdate(BaseModel):
    user_name: str
    user_email: EmailStr
    user_phone: str


class GuideProfileUpdate(BaseModel):
    guide_name: str
    guide_email: EmailStr
    guide_mobile: str
    guide_division: str
    guide_district: str
    guide_rate: int


class ManagerProfileUpdate(BaseModel):
    manager_name: str
    manager_email: EmailStr
    manager_mobile: str


class HotelUpdate(BaseModel):
    hotel_name: str
    hotel_division: str
    hotel_district: str
    hotel_location: str
    hotel_rating: str
    hotel_price: int
    hotel_description: str


# ─── Bookings ───────────────────────────────────────

class TransportBookingRequest(BaseModel):
    transport_id: str
    travel_date: str  # ISO date string


class HotelBookingRequest(BaseModel):
    hotel_reg: str
    checkin: str  # ISO date string


class GuideBookingRequest(BaseModel):
    guide_nid: str
    guide_date: str  # ISO date string


class BookingApprovalRequest(BaseModel):
    booking_id: str


# ─── Contact ────────────────────────────────────────

class ContactMessageRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    message: str


# ─── Password Reset ─────────────────────────────────

class PasswordResetRequest(BaseModel):
    new_password: str
    confirm_password: str


# ─── Response Models ────────────────────────────────

class UserResponse(BaseModel):
    user_id: str
    user_email: str
    user_name: str
    user_phone: Optional[str] = None

    class Config:
        from_attributes = True


class HotelResponse(BaseModel):
    hotel_registration_number: str
    hotel_name: Optional[str] = None
    hotel_division: Optional[str] = None
    hotel_district: Optional[str] = None
    hotel_location: Optional[str] = None
    hotel_rating: Optional[str] = None
    hotel_price: int = 0
    hotel_description: Optional[str] = None

    class Config:
        from_attributes = True


class GuideResponse(BaseModel):
    guide_nid: str
    guide_name: str
    guide_email: str
    guide_mobile: Optional[str] = None
    guide_division: Optional[str] = None
    guide_district: Optional[str] = None
    guide_rate: int = 0

    class Config:
        from_attributes = True


class ManagerResponse(BaseModel):
    manager_id: str
    manager_name: str
    manager_email: str
    manager_mobile: Optional[str] = None
    hotel_registration_number: Optional[str] = None
    hotel_name: Optional[str] = None
    hotel_division: Optional[str] = None
    hotel_district: Optional[str] = None
    hotel_location: Optional[str] = None
    hotel_rating: Optional[str] = None
    hotel_price: int = 0
    hotel_description: Optional[str] = None

    class Config:
        from_attributes = True


class TransportationResponse(BaseModel):
    transport_id: str
    transport_type: Optional[str] = None
    transport_route: Optional[str] = None
    transport_fare: Optional[int] = None

    class Config:
        from_attributes = True


class BookingResponse(BaseModel):
    booking_id: str
    booking_type: Optional[str] = None
    booking_confirmation: Optional[str] = None
    user_id: Optional[str] = None
    booking_date: Optional[date] = None
    guide_nid: Optional[str] = None
    hotel_registration_number: Optional[str] = None
    transport_id: Optional[str] = None
    price: Optional[int] = None
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    payment_id: str
    booking_id: Optional[str] = None
    price: Optional[int] = None
    user_id: Optional[str] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None

    class Config:
        from_attributes = True


class TouristSpotResponse(BaseModel):
    spot_id: str
    spot_name: str
    city: Optional[str] = None
    division: Optional[str] = None
    description: Optional[str] = None
    best_season: str = "Year-round"
    entry_fee: int = 0
    estimated_hours: Optional[Decimal] = None

    class Config:
        from_attributes = True


class ContactMessageResponse(BaseModel):
    message_id: str
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Admin ──────────────────────────────────────────

class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminUserResponse(BaseModel):
    user_id: str
    user_email: str
    user_name: str
    user_phone: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminGuideResponse(BaseModel):
    guide_nid: str
    guide_name: str
    guide_email: str
    guide_mobile: Optional[str] = None
    guide_division: Optional[str] = None
    guide_district: Optional[str] = None
    guide_rate: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminManagerResponse(BaseModel):
    manager_id: str
    manager_name: str
    manager_email: str
    manager_mobile: Optional[str] = None
    hotel_registration_number: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Packages ───────────────────────────────────────

class PackageResponse(BaseModel):
    package_id: str
    package_name: str
    price: int = 0
    booking_limit: int = 3
    transport_limit: int = 3
    hotel_limit: int = 2
    guide_limit: int = 1
    discount_pct: Decimal = Decimal("0")
    priority: bool = False
    exclusive: bool = False
    complementary_breakfast: bool = False
    complementary_lunch: bool = False
    complementary_dinner: bool = False
    features: Optional[str] = None

    class Config:
        from_attributes = True


class PackageCreate(BaseModel):
    package_name: str
    price: int = 0
    booking_limit: int = 3
    transport_limit: int = 3
    hotel_limit: int = 2
    guide_limit: int = 1
    discount_pct: Decimal = Decimal("0")
    priority: bool = False
    exclusive: bool = False
    complementary_breakfast: bool = False
    complementary_lunch: bool = False
    complementary_dinner: bool = False
    features: Optional[str] = None


class PackageUpdate(BaseModel):
    package_name: Optional[str] = None
    price: Optional[int] = None
    booking_limit: Optional[int] = None
    transport_limit: Optional[int] = None
    hotel_limit: Optional[int] = None
    guide_limit: Optional[int] = None
    discount_pct: Optional[Decimal] = None
    priority: Optional[bool] = None
    exclusive: Optional[bool] = None
    complementary_breakfast: Optional[bool] = None
    complementary_lunch: Optional[bool] = None
    complementary_dinner: Optional[bool] = None
    features: Optional[str] = None


class UserPackageResponse(BaseModel):
    id: int
    user_id: str
    package_id: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    payment_status: str = "active"
    user_name: Optional[str] = None
    package_name: Optional[str] = None

    class Config:
        from_attributes = True


class UserPackageCreate(BaseModel):
    user_id: str
    package_id: str
    end_date: Optional[date] = None


# ─── Admin CRUD Schemas ────────────────────────────
class AdminUserCreate(BaseModel):
    user_id: str
    user_name: str
    user_email: str
    user_phone: Optional[str] = ""
    password: str


class AdminUserUpdate(BaseModel):
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None


class AdminGuideCreate(BaseModel):
    guide_nid: str
    guide_name: str
    guide_email: str
    guide_mobile: Optional[str] = ""
    guide_division: Optional[str] = ""
    guide_district: Optional[str] = ""
    guide_rate: int = 0
    password: str


class AdminGuideUpdate(BaseModel):
    guide_name: Optional[str] = None
    guide_email: Optional[str] = None
    guide_mobile: Optional[str] = None
    guide_division: Optional[str] = None
    guide_district: Optional[str] = None
    guide_rate: Optional[int] = None


class AdminManagerCreate(BaseModel):
    manager_id: str
    manager_name: str
    manager_email: str
    manager_mobile: Optional[str] = ""
    hotel_registration_number: Optional[str] = None
    password: str


class AdminManagerUpdate(BaseModel):
    manager_name: Optional[str] = None
    manager_email: Optional[str] = None
    manager_mobile: Optional[str] = None
    hotel_registration_number: Optional[str] = None


class AdminHotelCreate(BaseModel):
    hotel_registration_number: str
    hotel_name: str
    hotel_division: Optional[str] = ""
    hotel_district: Optional[str] = ""
    hotel_location: Optional[str] = ""
    hotel_rating: Optional[str] = ""
    hotel_price: int = 0
    hotel_description: Optional[str] = ""


class AdminHotelUpdate(BaseModel):
    hotel_name: Optional[str] = None
    hotel_division: Optional[str] = None
    hotel_district: Optional[str] = None
    hotel_location: Optional[str] = None
    hotel_rating: Optional[str] = None
    hotel_price: Optional[int] = None
    hotel_description: Optional[str] = None


class AdminTransportCreate(BaseModel):
    transport_id: str
    transport_type: str
    transport_route: str
    transport_fare: int


class AdminTransportUpdate(BaseModel):
    transport_type: Optional[str] = None
    transport_route: Optional[str] = None
    transport_fare: Optional[int] = None


class AdminSpotCreate(BaseModel):
    spot_id: str
    spot_name: str
    city: Optional[str] = ""
    division: Optional[str] = ""
    description: Optional[str] = ""
    best_season: str = "Year-round"
    entry_fee: int = 0
    estimated_hours: Optional[float] = None


class AdminSpotUpdate(BaseModel):
    spot_name: Optional[str] = None
    city: Optional[str] = None
    division: Optional[str] = None
    description: Optional[str] = None
    best_season: Optional[str] = None
    entry_fee: Optional[int] = None
    estimated_hours: Optional[float] = None


# ─── Tourist Package Schemas ────────────────────────
class PurchasePackageRequest(BaseModel):
    package_id: str


class PackageWithFeatures(BaseModel):
    package_id: str
    package_name: str
    price: int = 0
    booking_limit: int = 3
    discount_pct: Decimal = Decimal("0")
    priority: bool = False
    exclusive: bool = False
    features_list: List[str] = []


class ActivePackageResponse(BaseModel):
    id: int
    package_id: str
    package_name: str
    features_list: List[str] = []
    booking_limit: int = 3
    discount_pct: Decimal = Decimal("0")
    priority: bool = False
    exclusive: bool = False
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    payment_status: str = "active"
    bookings_used: int = 0
    bookings_remaining: int = 0


# ─── Chart Data ─────────────────────────────────────
class ChartDataResponse(BaseModel):
    booking_types: dict  # {"Hotel": 5, "Transport": 3, ...}
    booking_status: dict  # {"Pending": 2, "Confirmed": 6, ...}
    payments_by_month: dict  # {"2024-01": 5000, ...}
    top_revenue_sources: dict  # {"Hotel": 50000, ...}
    package_popularity: dict  # {"Basic": 10, "Standard": 5, ...}
    users_by_role: dict  # {"tourist": 20, "guide": 5, ...}
    division_bookings: dict  # {"Dhaka": 10, "Sylhet": 5, ...}
    recent_activity: list  # [{type, message, date}, ...]


# ─── Destinations ───────────────────────────────────
class CityDataResponse(BaseModel):
    city: str
    spots: List[TouristSpotResponse]
    hotel_price: int
    guide_rate: int
    transport_modes: dict
