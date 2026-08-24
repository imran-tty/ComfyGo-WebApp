"""
Pytest configuration and shared fixtures for ComfyGo API tests.

Uses an in-memory SQLite database via aiosqlite so tests don't require
a running MySQL server.
"""

from datetime import date, datetime
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Override settings BEFORE importing anything from app
import os

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.models import (
    Admin,
    Booking,
    ContactMessage,
    Guide,
    Hotel,
    Manager,
    Package,
    Payment,
    TouristSpot,
    Transportation,
    User,
    UserPackage,
)

# ---------------------------------------------------------------------------
# Async engine & session
# ---------------------------------------------------------------------------

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DB_URL, echo=False)
TestSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# ---------------------------------------------------------------------------
# Database setup / teardown (per test, function-scoped)
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture(autouse=True)
async def setup_and_teardown():
    """Create tables before each test and drop them after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# ---------------------------------------------------------------------------
# Database session override
# ---------------------------------------------------------------------------

async def _override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ---------------------------------------------------------------------------
# Async HTTP client
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """AsyncClient bound to the FastAPI app with DB dependency overridden."""
    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Helper to create a DB session directly (for seeding)
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a raw async session for direct DB operations in tests."""
    async with TestSessionLocal() as session:
        yield session


# ---------------------------------------------------------------------------
# Seed data factories
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def seed_user(db_session: AsyncSession) -> User:
    """Insert and return a sample tourist user."""
    user = User(
        user_id="USR001",
        user_email="tourist@test.com",
        user_name="Test Tourist",
        user_phone="01700000001",
        password=hash_password("password123"),
    )
    db_session.add(user)
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def seed_guide(db_session: AsyncSession) -> Guide:
    """Insert and return a sample guide."""
    guide = Guide(
        guide_nid="GID001",
        guide_email="guide@test.com",
        guide_name="Test Guide",
        guide_mobile="01700000002",
        guide_division="Sylhet",
        guide_district="Sylhet",
        guide_rate=1500,
        password=hash_password("password123"),
    )
    db_session.add(guide)
    await db_session.commit()
    return guide


@pytest_asyncio.fixture
async def seed_hotel(db_session: AsyncSession) -> Hotel:
    """Insert and return a sample hotel."""
    hotel = Hotel(
        hotel_registration_number="H001",
        hotel_name="Test Hotel",
        hotel_division="Sylhet",
        hotel_district="Sylhet",
        hotel_location="Zindabazar, Sylhet",
        hotel_rating="5",
        hotel_price=12000,
        hotel_description="A luxury hotel in Sylhet.",
    )
    db_session.add(hotel)
    await db_session.commit()
    return hotel


@pytest_asyncio.fixture
async def seed_manager(db_session: AsyncSession, seed_hotel: Hotel) -> Manager:
    """Insert and return a sample manager linked to seed_hotel."""
    mgr = Manager(
        manager_id="MGR001",
        manager_email="manager@test.com",
        manager_name="Test Manager",
        manager_mobile="01700000003",
        hotel_registration_number=seed_hotel.hotel_registration_number,
        password=hash_password("password123"),
    )
    db_session.add(mgr)
    await db_session.commit()
    return mgr


@pytest_asyncio.fixture
async def seed_admin(db_session: AsyncSession) -> Admin:
    """Insert and return a sample admin."""
    admin = Admin(
        admin_id="ADM001",
        admin_name="Test Admin",
        admin_email="admin@test.com",
        password=hash_password("admin123"),
    )
    db_session.add(admin)
    await db_session.commit()
    return admin


@pytest_asyncio.fixture
async def seed_transport(db_session: AsyncSession) -> Transportation:
    """Insert and return a sample transport."""
    t = Transportation(
        transport_id="TR001",
        transport_type="Train",
        transport_route="Dhaka-Sylhet",
        transport_fare=900,
    )
    db_session.add(t)
    await db_session.commit()
    return t


@pytest_asyncio.fixture
async def seed_tourist_spot(db_session: AsyncSession) -> TouristSpot:
    """Insert and return a sample tourist spot."""
    spot = TouristSpot(
        spot_id="SP001",
        spot_name="Test Spot",
        city="Sylhet",
        division="Sylhet",
        description="A beautiful test spot.",
        best_season="Year-round",
        entry_fee=100,
        estimated_hours=2.5,
    )
    db_session.add(spot)
    await db_session.commit()
    return spot


@pytest_asyncio.fixture
async def seed_booking(db_session: AsyncSession, seed_user: User, seed_hotel: Hotel) -> Booking:
    """Insert and return a sample pending booking with payment."""
    booking = Booking(
        booking_id="BK00001",
        booking_type="Hotel",
        booking_confirmation="Pending",
        user_id=seed_user.user_id,
        booking_date=date.today(),
        hotel_registration_number=seed_hotel.hotel_registration_number,
    )
    db_session.add(booking)

    payment = Payment(
        payment_id="PY00001",
        booking_id="BK00001",
        price=12000,
        user_id=seed_user.user_id,
        payment_date=date.today(),
        payment_method="Online",
    )
    db_session.add(payment)
    await db_session.commit()
    return booking


@pytest_asyncio.fixture
async def seed_contact_message(db_session: AsyncSession) -> ContactMessage:
    """Insert and return a sample contact message."""
    msg = ContactMessage(
        message_id="MSG001",
        name="Test User",
        email="test@example.com",
        phone="01700000004",
        message="This is a test message for the contact form.",
    )
    db_session.add(msg)
    await db_session.commit()
    return msg


@pytest_asyncio.fixture
async def seed_package(db_session: AsyncSession) -> Package:
    """Insert and return a sample package."""
    pkg = Package(
        package_id="PKG001",
        package_name="Gold",
        price=5000,
        booking_limit=5,
        discount_pct=10,
        priority=True,
        exclusive=False,
        features="Priority booking, 10% discount",
    )
    db_session.add(pkg)
    await db_session.commit()
    return pkg


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def auth_token_tourist(client: AsyncClient, seed_user: User) -> str:
    """Login as tourist and return the access token."""
    resp = await client.post("/api/auth/login", json={
        "email": "tourist@test.com",
        "password": "password123",
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def auth_token_guide(client: AsyncClient, seed_guide: Guide) -> str:
    """Login as guide and return the access token."""
    resp = await client.post("/api/auth/login", json={
        "email": "guide@test.com",
        "password": "password123",
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def auth_token_manager(client: AsyncClient, seed_manager: Manager) -> str:
    """Login as manager and return the access token."""
    resp = await client.post("/api/auth/login", json={
        "email": "manager@test.com",
        "password": "password123",
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def auth_token_admin(client: AsyncClient, seed_admin: Admin) -> str:
    """Login as admin and return the access token."""
    resp = await client.post("/api/admin/login", json={
        "email": "admin@test.com",
        "password": "admin123",
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


def auth_header(token: str) -> dict:
    """Return Authorization header dict for a given token."""
    return {"Authorization": f"Bearer {token}"}
