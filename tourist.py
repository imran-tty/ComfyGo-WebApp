import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.core.database import get_db
from app.core.deps import require_user
from app.models.models import (
    User, Booking, Payment, Transportation, Hotel, Guide,
    Package, UserPackage,
)
from app.schemas.schemas import (
    TouristProfileUpdate, TransportBookingRequest,
    HotelBookingRequest, GuideBookingRequest, BookingResponse,
    PurchasePackageRequest,
)

router = APIRouter(prefix="/api/tourist", tags=["tourist"])


def _gen_id(prefix: str) -> str:
    return f"{prefix}{uuid.uuid4().hex[:8].upper()}"


@router.get("/profile")
async def get_profile(user: dict = Depends(require_user), db: AsyncSession = Depends(get_db)):
    """Get tourist profile."""
    if user["role"] != "tourist":
        raise HTTPException(status_code=403, detail="Tourist access required")
    stmt = select(User).where(User.user_id == user["id"])
    result = await db.execute(stmt)
    u = result.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": u.user_id,
        "user_email": u.user_email,
        "user_name": u.user_name,
        "user_phone": u.user_phone,
    }


@router.put("/profile")
async def update_profile(
    req: TouristProfileUpdate,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Update tourist profile."""
    if user["role"] != "tourist":
        raise HTTPException(status_code=403, detail="Tourist access required")
    if not req.user_name or not req.user_email or not req.user_phone:
        raise HTTPException(status_code=400, detail="Please fill in all fields.")

    stmt = select(User).where(User.user_id == user["id"])
    result = await db.execute(stmt)
    u = result.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    u.user_name = req.user_name
    u.user_email = req.user_email
    u.user_phone = req.user_phone
    return {"message": "Profile updated successfully."}


@router.get("/transports")
async def list_transports(
    route: str = "",
    db: AsyncSession = Depends(get_db),
):
    """List transports with optional route filter."""
    stmt = select(Transportation).order_by(Transportation.transport_route)
    result = await db.execute(stmt)
    transports = result.scalars().all()
    if route:
        transports = [t for t in transports if route.lower() in (t.transport_route or "").lower()]
    return transports


@router.get("/hotels")
async def list_hotels(
    division: str = "",
    db: AsyncSession = Depends(get_db),
):
    """List hotels with optional division filter."""
    if division:
        stmt = select(Hotel).where(Hotel.hotel_division == division).order_by(Hotel.hotel_name)
    else:
        stmt = select(Hotel).order_by(Hotel.hotel_name)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/guides")
async def list_guides(
    guide_division: str = "",
    db: AsyncSession = Depends(get_db),
):
    """List guides with optional division filter."""
    if guide_division:
        stmt = select(Guide).where(Guide.guide_division == guide_division).order_by(Guide.guide_name)
    else:
        stmt = select(Guide).order_by(Guide.guide_name)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/bookings")
async def list_bookings(
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """List all bookings for the current tourist."""
    if user["role"] != "tourist":
        raise HTTPException(status_code=403, detail="Tourist access required")

    stmt = (
        select(Booking, Payment.price)
        .outerjoin(Payment, Booking.booking_id == Payment.booking_id)
        .where(Booking.user_id == user["id"])
        .order_by(desc(Booking.booking_date))
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        BookingResponse(
            booking_id=b.booking_id,
            booking_type=b.booking_type,
            booking_confirmation=b.booking_confirmation,
            user_id=b.user_id,
            booking_date=b.booking_date,
            price=price,
        )
        for b, price in rows
    ]


@router.post("/book/transport")
async def book_transport(
    req: TransportBookingRequest,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Book a transport option."""
    if user["role"] != "tourist":
        raise HTTPException(status_code=403, detail="Tourist access required")
    if not req.transport_id or not req.travel_date:
        raise HTTPException(status_code=400, detail="Please select transport and travel date.")

    stmt = select(Transportation).where(Transportation.transport_id == req.transport_id)
    result = await db.execute(stmt)
    transport = result.scalar_one_or_none()
    if not transport:
        raise HTTPException(status_code=404, detail="Transport not found.")

    booking_id = _gen_id("BK")
    booking = Booking(
        booking_id=booking_id,
        booking_type="Transport",
        booking_confirmation="Pending",
        user_id=user["id"],
        booking_date=date.fromisoformat(req.travel_date),
        transport_id=req.transport_id,
    )
    db.add(booking)

    payment = Payment(
        payment_id=_gen_id("PY"),
        booking_id=booking_id,
        price=transport.transport_fare,
        user_id=user["id"],
        payment_date=date.today(),
    )
    db.add(payment)
    await db.flush()

    return {"message": f"Transport booked! Booking ID: {booking_id}", "booking_id": booking_id}


@router.post("/book/hotel")
async def book_hotel(
    req: HotelBookingRequest,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Book a hotel."""
    if user["role"] != "tourist":
        raise HTTPException(status_code=403, detail="Tourist access required")
    if not req.hotel_reg or not req.checkin:
        raise HTTPException(status_code=400, detail="Please select a hotel and check-in date.")

    stmt = select(Hotel).where(Hotel.hotel_registration_number == req.hotel_reg)
    result = await db.execute(stmt)
    hotel = result.scalar_one_or_none()
    if not hotel:
        raise HTTPException(status_code=404, detail="Selected hotel not found.")

    booking_id = _gen_id("BK")
    booking = Booking(
        booking_id=booking_id,
        booking_type="Hotel",
        booking_confirmation="Pending",
        user_id=user["id"],
        booking_date=date.fromisoformat(req.checkin),
        hotel_registration_number=req.hotel_reg,
    )
    db.add(booking)

    payment = Payment(
        payment_id=_gen_id("PY"),
        booking_id=booking_id,
        price=hotel.hotel_price,
        user_id=user["id"],
        payment_date=date.today(),
    )
    db.add(payment)
    await db.flush()

    return {"message": f"Hotel booked! Booking ID: {booking_id}", "booking_id": booking_id}


@router.post("/book/guide")
async def book_guide(
    req: GuideBookingRequest,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Book a guide."""
    if user["role"] != "tourist":
        raise HTTPException(status_code=403, detail="Tourist access required")
    if not req.guide_nid or not req.guide_date:
        raise HTTPException(status_code=400, detail="Please select a guide and date.")

    stmt = select(Guide).where(Guide.guide_nid == req.guide_nid)
    result = await db.execute(stmt)
    guide = result.scalar_one_or_none()
    if not guide:
        raise HTTPException(status_code=404, detail="Selected guide not found.")

    booking_id = _gen_id("BK")
    booking = Booking(
        booking_id=booking_id,
        booking_type="Guide",
        booking_confirmation="Pending",
        user_id=user["id"],
        booking_date=date.fromisoformat(req.guide_date),
        guide_nid=req.guide_nid,
    )
    db.add(booking)

    payment = Payment(
        payment_id=_gen_id("PY"),
        booking_id=booking_id,
        price=guide.guide_rate,
        user_id=user["id"],
        payment_date=date.today(),
    )
    db.add(payment)
    await db.flush()

    return {"message": f"Guide booked! Booking ID: {booking_id}", "booking_id": booking_id}


@router.get("/packages")
async def list_packages(db: AsyncSession = Depends(get_db)):
    """List all available packages."""
    stmt = select(Package).order_by(Package.price)
    result = await db.execute(stmt)
    packages = result.scalars().all()
    return [
        {
            "package_id": p.package_id,
            "package_name": p.package_name,
            "price": p.price,
            "booking_limit": p.booking_limit,
            "transport_limit": p.transport_limit,
            "hotel_limit": p.hotel_limit,
            "guide_limit": p.guide_limit,
            "discount_pct": float(p.discount_pct or 0),
            "priority": p.priority,
            "exclusive": p.exclusive,
            "complementary_breakfast": p.complementary_breakfast,
            "complementary_lunch": p.complementary_lunch,
            "complementary_dinner": p.complementary_dinner,
            "features": p.features or "",
            "features_list": [f.strip() for f in (p.features or "").split(",") if f.strip()],
        }
        for p in packages
    ]


async def _get_active_package_for_user(user_id: str, db: AsyncSession):
    """Helper: get the active package + per-type usage for a user."""
    stmt = (
        select(UserPackage, Package)
        .join(Package, UserPackage.package_id == Package.package_id)
        .where(UserPackage.user_id == user_id)
        .where(UserPackage.payment_status == "active")
        .order_by(desc(UserPackage.created_at))
        .limit(1)
    )
    result = await db.execute(stmt)
    row = result.one_or_none()
    if not row:
        return None

    up, pkg = row


    active_statuses = ["Pending", "Confirmed"]

    transport_used = (
        await db.execute(
            select(func.count(Booking.booking_id)).where(
                Booking.user_id == user_id,
                Booking.booking_type == "Transport",
                Booking.booking_confirmation.in_(active_statuses),
            )
        )
    ).scalar() or 0

    hotel_used = (
        await db.execute(
            select(func.count(Booking.booking_id)).where(
                Booking.user_id == user_id,
                Booking.booking_type == "Hotel",
                Booking.booking_confirmation.in_(active_statuses),
            )
        )
    ).scalar() or 0

    guide_used = (
        await db.execute(
            select(func.count(Booking.booking_id)).where(
                Booking.user_id == user_id,
                Booking.booking_type == "Guide",
                Booking.booking_confirmation.in_(active_statuses),
            )
        )
    ).scalar() or 0

    return {
        "id": up.id,
        "package_id": pkg.package_id,
        "package_name": pkg.package_name,
        "features_list": [f.strip() for f in (pkg.features or "").split(",") if f.strip()],
        "booking_limit": pkg.booking_limit,
        "transport_limit": pkg.transport_limit,
        "hotel_limit": pkg.hotel_limit,
        "guide_limit": pkg.guide_limit,
        "discount_pct": float(pkg.discount_pct or 0),
        "priority": pkg.priority,
        "exclusive": pkg.exclusive,
        "complementary_breakfast": pkg.complementary_breakfast,
        "complementary_lunch": pkg.complementary_lunch,
        "complementary_dinner": pkg.complementary_dinner,
        "start_date": str(up.start_date) if up.start_date else None,
        "end_date": str(up.end_date) if up.end_date else None,
        "payment_status": up.payment_status,
        "transport_used": transport_used,
        "transport_remaining": max(0, pkg.transport_limit - transport_used),
        "hotel_used": hotel_used,
        "hotel_remaining": max(0, pkg.hotel_limit - hotel_used),
        "guide_used": guide_used,
        "guide_remaining": max(0, pkg.guide_limit - guide_used),
        "total_used": transport_used + hotel_used + guide_used,
        "total_remaining": max(0, pkg.booking_limit - transport_used - hotel_used - guide_used),
    }


@router.get("/my-package")
async def get_my_package(
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current tourist's active package with features and per-type booking stats."""
    if user["role"] != "tourist":
        raise HTTPException(status_code=403, detail="Tourist access required")
    return await _get_active_package_for_user(user["id"], db)


@router.post("/purchase-package")
async def purchase_package(
    req: PurchasePackageRequest,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Purchase/subscribe to a package."""
    if user["role"] != "tourist":
        raise HTTPException(status_code=403, detail="Tourist access required")

    pkg_stmt = select(Package).where(Package.package_id == req.package_id)
    pkg_result = await db.execute(pkg_stmt)
    pkg = pkg_result.scalar_one_or_none()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found.")


    old_stmt = (
        select(UserPackage)
        .where(UserPackage.user_id == user["id"])
        .where(UserPackage.payment_status == "active")
    )
    old_result = await db.execute(old_stmt)
    for old_sub in old_result.scalars().all():
        old_sub.payment_status = "replaced"

    sub = UserPackage(
        user_id=user["id"],
        package_id=req.package_id,
        start_date=date.today(),
        payment_status="active",
    )
    db.add(sub)
    await db.flush()

    return {"message": f"Successfully subscribed to {pkg.package_name}!", "package_id": pkg.package_id}
