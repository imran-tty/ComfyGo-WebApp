import uuid
from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, extract
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.core.deps import require_admin
from app.models.models import (
    Admin, User, Guide, Manager, Hotel, Transportation,
    Booking, Payment, ContactMessage, TouristSpot, Package, UserPackage,
)
from app.schemas.schemas import (
    AdminLoginRequest, PackageCreate, PackageUpdate, UserPackageCreate,
    AdminUserCreate, AdminUserUpdate,
    AdminGuideCreate, AdminGuideUpdate,
    AdminManagerCreate, AdminManagerUpdate,
    AdminHotelCreate, AdminHotelUpdate,
    AdminTransportCreate, AdminTransportUpdate,
    AdminSpotCreate, AdminSpotUpdate,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ─── Auth ───────────────────────────────────────────

@router.post("/login")
async def admin_login(req: AdminLoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    email = req.email.strip()
    password = req.password.strip()
    if not email or not password:
        raise HTTPException(status_code=400, detail="Please fill in all fields.")

    stmt = select(Admin).where(Admin.admin_email == email).limit(1)
    result = await db.execute(stmt)
    admin = result.scalar_one_or_none()
    if not admin or not verify_password(password, admin.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": admin.admin_id, "role": "admin", "name": admin.admin_name})
    response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=86400)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "admin",
        "user_id": admin.admin_id,
        "user_name": admin.admin_name,
    }


# ─── Dashboard Stats ────────────────────────────────

@router.get("/stats")
async def get_stats(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    user_count = (await db.execute(select(func.count(User.user_id)))).scalar()
    guide_count = (await db.execute(select(func.count(Guide.guide_nid)))).scalar()
    manager_count = (await db.execute(select(func.count(Manager.manager_id)))).scalar()
    hotel_count = (await db.execute(select(func.count(Hotel.hotel_registration_number)))).scalar()
    transport_count = (await db.execute(select(func.count(Transportation.transport_id)))).scalar()
    booking_count = (await db.execute(select(func.count(Booking.booking_id)))).scalar()
    payment_count = (await db.execute(select(func.count(Payment.payment_id)))).scalar()
    spot_count = (await db.execute(select(func.count(TouristSpot.spot_id)))).scalar()
    message_count = (await db.execute(select(func.count(ContactMessage.message_id)))).scalar()
    package_count = (await db.execute(select(func.count(Package.package_id)))).scalar()
    subscription_count = (await db.execute(select(func.count(UserPackage.id)))).scalar()
    total_revenue = (await db.execute(select(func.coalesce(func.sum(Payment.price), 0)))).scalar()

    return {
        "users": user_count,
        "guides": guide_count,
        "managers": manager_count,
        "hotels": hotel_count,
        "transports": transport_count,
        "bookings": booking_count,
        "payments": payment_count,
        "spots": spot_count,
        "messages": message_count,
        "packages": package_count,
        "subscriptions": subscription_count,
        "total_revenue": total_revenue,
    }


# ─── Chart Data ─────────────────────────────────────

@router.get("/charts")
async def get_chart_data(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    """Rich chart data for admin dashboard."""

    # Booking types breakdown (pie chart)
    bt_stmt = select(Booking.booking_type, func.count(Booking.booking_id)).group_by(Booking.booking_type)
    bt_result = await db.execute(bt_stmt)
    booking_types = {row[0] or "Unknown": row[1] for row in bt_result.all()}

    # Booking status breakdown (pie chart)
    bs_stmt = select(Booking.booking_confirmation, func.count(Booking.booking_id)).group_by(Booking.booking_confirmation)
    bs_result = await db.execute(bs_stmt)
    booking_status = {row[0] or "Unknown": row[1] for row in bs_result.all()}

    # Revenue by month (bar chart)
    rm_stmt = (
        select(
            func.to_char(Payment.payment_date, 'YYYY-MM').label("month"),
            func.sum(Payment.price),
        )
        .where(Payment.payment_date.isnot(None))
        .group_by("month")
        .order_by("month")
    )
    rm_result = await db.execute(rm_stmt)
    payments_by_month = {row[0]: row[1] for row in rm_result.all()}

    # Revenue by booking type (bar chart)
    tr_stmt = (
        select(Booking.booking_type, func.sum(Payment.price))
        .join(Payment, Booking.booking_id == Payment.booking_id)
        .group_by(Booking.booking_type)
    )
    tr_result = await db.execute(tr_stmt)
    top_revenue = {row[0] or "Unknown": row[1] for row in tr_result.all()}

    # Package popularity (bar chart)
    pp_stmt = (
        select(Package.package_name, func.count(UserPackage.id))
        .outerjoin(UserPackage, Package.package_id == UserPackage.package_id)
        .group_by(Package.package_name)
    )
    pp_result = await db.execute(pp_stmt)
    package_pop = {row[0]: row[1] for row in pp_result.all()}

    # Division breakdown of bookings (bar chart)
    db_stmt = (
        select(Hotel.hotel_division, func.count(Booking.booking_id))
        .join(Booking, Hotel.hotel_registration_number == Booking.hotel_registration_number)
        .group_by(Hotel.hotel_division)
    )
    db_result = await db.execute(db_stmt)
    division_bookings = {row[0] or "Unknown": row[1] for row in db_result.all()}

    # Recent activity (last 10 bookings)
    ra_stmt = (
        select(Booking, User.user_name)
        .outerjoin(User, Booking.user_id == User.user_id)
        .order_by(desc(Booking.created_at))
        .limit(10)
    )
    ra_result = await db.execute(ra_stmt)
    recent_activity = [
        {
            "type": b.booking_type,
            "message": f"{name or 'User'} booked {b.booking_type}",
            "status": b.booking_confirmation,
            "date": str(b.created_at) if b.created_at else "",
        }
        for b, name in ra_result.all()
    ]

    return {
        "booking_types": booking_types,
        "booking_status": booking_status,
        "payments_by_month": payments_by_month,
        "top_revenue_sources": top_revenue,
        "package_popularity": package_pop,
        "division_bookings": division_bookings,
        "recent_activity": recent_activity,
    }


# ─── Users CRUD ─────────────────────────────────────

@router.get("/users")
async def list_users(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.user_id))
    return result.scalars().all()


@router.post("/users")
async def create_user(req: AdminUserCreate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(User).where(User.user_id == req.user_id))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="User ID already exists.")
    existing_email = (await db.execute(select(User).where(User.user_email == req.user_email))).scalar_one_or_none()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already in use.")
    u = User(
        user_id=req.user_id,
        user_name=req.user_name,
        user_email=req.user_email,
        user_phone=req.user_phone or "",
        password=hash_password(req.password),
    )
    db.add(u)
    await db.flush()
    return {"message": f"User {req.user_id} created.", "user_id": req.user_id}


@router.put("/users/{user_id}")
async def update_user(user_id: str, req: AdminUserUpdate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.user_id == user_id)
    result = await db.execute(stmt)
    u = result.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(u, field, value)
    return {"message": f"User {user_id} updated."}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.user_id == user_id)
    result = await db.execute(stmt)
    u = result.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(u)
    return {"message": f"User {user_id} deleted."}


# ─── Guides CRUD ────────────────────────────────────

@router.get("/guides")
async def list_guides(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Guide).order_by(Guide.guide_nid))
    return result.scalars().all()


@router.post("/guides")
async def create_guide(req: AdminGuideCreate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(Guide).where(Guide.guide_nid == req.guide_nid))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Guide NID already exists.")
    g = Guide(
        guide_nid=req.guide_nid,
        guide_name=req.guide_name,
        guide_email=req.guide_email,
        guide_mobile=req.guide_mobile or "",
        guide_division=req.guide_division or "",
        guide_district=req.guide_district or "",
        guide_rate=req.guide_rate,
        password=hash_password(req.password),
    )
    db.add(g)
    await db.flush()
    return {"message": f"Guide {req.guide_nid} created.", "guide_nid": req.guide_nid}


@router.put("/guides/{guide_nid}")
async def update_guide(guide_nid: str, req: AdminGuideUpdate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Guide).where(Guide.guide_nid == guide_nid)
    result = await db.execute(stmt)
    g = result.scalar_one_or_none()
    if not g:
        raise HTTPException(status_code=404, detail="Guide not found")
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(g, field, value)
    return {"message": f"Guide {guide_nid} updated."}


@router.delete("/guides/{guide_nid}")
async def delete_guide(guide_nid: str, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Guide).where(Guide.guide_nid == guide_nid)
    result = await db.execute(stmt)
    g = result.scalar_one_or_none()
    if not g:
        raise HTTPException(status_code=404, detail="Guide not found")
    await db.delete(g)
    return {"message": f"Guide {guide_nid} deleted."}


# ─── Managers CRUD ──────────────────────────────────

@router.get("/managers")
async def list_managers(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Manager).order_by(Manager.manager_id))
    return result.scalars().all()


@router.post("/managers")
async def create_manager(req: AdminManagerCreate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(Manager).where(Manager.manager_id == req.manager_id))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Manager ID already exists.")
    m = Manager(
        manager_id=req.manager_id,
        manager_name=req.manager_name,
        manager_email=req.manager_email,
        manager_mobile=req.manager_mobile or "",
        hotel_registration_number=req.hotel_registration_number,
        password=hash_password(req.password),
    )
    db.add(m)
    await db.flush()
    return {"message": f"Manager {req.manager_id} created.", "manager_id": req.manager_id}


@router.put("/managers/{manager_id}")
async def update_manager(manager_id: str, req: AdminManagerUpdate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Manager).where(Manager.manager_id == manager_id)
    result = await db.execute(stmt)
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Manager not found")
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(m, field, value)
    return {"message": f"Manager {manager_id} updated."}


@router.delete("/managers/{manager_id}")
async def delete_manager(manager_id: str, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Manager).where(Manager.manager_id == manager_id)
    result = await db.execute(stmt)
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Manager not found")
    await db.delete(m)
    return {"message": f"Manager {manager_id} deleted."}


# ─── Hotels CRUD ────────────────────────────────────

@router.get("/hotels")
async def list_hotels(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hotel).order_by(Hotel.hotel_registration_number))
    return result.scalars().all()


@router.post("/hotels")
async def create_hotel(req: AdminHotelCreate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(Hotel).where(Hotel.hotel_registration_number == req.hotel_registration_number))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Hotel registration number already exists.")
    h = Hotel(
        hotel_registration_number=req.hotel_registration_number,
        hotel_name=req.hotel_name,
        hotel_division=req.hotel_division or "",
        hotel_district=req.hotel_district or "",
        hotel_location=req.hotel_location or "",
        hotel_rating=req.hotel_rating or "",
        hotel_price=req.hotel_price,
        hotel_description=req.hotel_description or "",
    )
    db.add(h)
    await db.flush()
    return {"message": f"Hotel {req.hotel_registration_number} created.", "hotel_registration_number": req.hotel_registration_number}


@router.put("/hotels/{hotel_reg}")
async def update_hotel(hotel_reg: str, req: AdminHotelUpdate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Hotel).where(Hotel.hotel_registration_number == hotel_reg)
    result = await db.execute(stmt)
    h = result.scalar_one_or_none()
    if not h:
        raise HTTPException(status_code=404, detail="Hotel not found")
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(h, field, value)
    return {"message": f"Hotel {hotel_reg} updated."}


@router.delete("/hotels/{hotel_reg}")
async def delete_hotel(hotel_reg: str, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Hotel).where(Hotel.hotel_registration_number == hotel_reg)
    result = await db.execute(stmt)
    h = result.scalar_one_or_none()
    if not h:
        raise HTTPException(status_code=404, detail="Hotel not found")
    await db.delete(h)
    return {"message": f"Hotel {hotel_reg} deleted."}


# ─── Transportation CRUD ────────────────────────────

@router.get("/transports")
async def list_transports(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Transportation).order_by(Transportation.transport_id))
    return result.scalars().all()


@router.post("/transports")
async def create_transport(req: AdminTransportCreate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(Transportation).where(Transportation.transport_id == req.transport_id))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Transport ID already exists.")
    t = Transportation(
        transport_id=req.transport_id,
        transport_type=req.transport_type,
        transport_route=req.transport_route,
        transport_fare=req.transport_fare,
    )
    db.add(t)
    await db.flush()
    return {"message": f"Transport {req.transport_id} created.", "transport_id": req.transport_id}


@router.put("/transports/{transport_id}")
async def update_transport(transport_id: str, req: AdminTransportUpdate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Transportation).where(Transportation.transport_id == transport_id)
    result = await db.execute(stmt)
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail="Transport not found")
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(t, field, value)
    return {"message": f"Transport {transport_id} updated."}


@router.delete("/transports/{transport_id}")
async def delete_transport(transport_id: str, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Transportation).where(Transportation.transport_id == transport_id)
    result = await db.execute(stmt)
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail="Transport not found")
    await db.delete(t)
    return {"message": f"Transport {transport_id} deleted."}


# ─── Bookings CRUD ──────────────────────────────────

@router.get("/bookings")
async def list_bookings(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Booking, Payment.price, User.user_name)
        .outerjoin(Payment, Booking.booking_id == Payment.booking_id)
        .outerjoin(User, Booking.user_id == User.user_id)
        .order_by(desc(Booking.created_at))
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "booking_id": b.booking_id,
            "booking_type": b.booking_type,
            "booking_confirmation": b.booking_confirmation,
            "user_id": b.user_id,
            "booking_date": str(b.booking_date) if b.booking_date else None,
            "price": price,
            "user_name": name,
            "guide_nid": b.guide_nid,
            "hotel_registration_number": b.hotel_registration_number,
            "transport_id": b.transport_id,
        }
        for b, price, name in rows
    ]


@router.post("/bookings/{booking_id}/void")
async def void_booking(booking_id: str, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Booking).where(Booking.booking_id == booking_id)
    result = await db.execute(stmt)
    b = result.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    b.booking_confirmation = "Cancelled"
    return {"message": f"Booking {booking_id} has been voided."}


# ─── Payments CRUD ──────────────────────────────────

@router.get("/payments")
async def list_payments(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Payment).order_by(desc(Payment.created_at)))
    return result.scalars().all()


@router.post("/payments/{payment_id}/refund")
async def refund_payment(payment_id: str, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Payment).where(Payment.payment_id == payment_id)
    result = await db.execute(stmt)
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    p.payment_method = "Refunded"
    return {"message": f"Payment {payment_id} has been refunded."}


# ─── Tourist Spots CRUD ─────────────────────────────

@router.get("/spots")
async def list_spots(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TouristSpot).order_by(TouristSpot.city, TouristSpot.spot_name))
    return result.scalars().all()


@router.post("/spots")
async def create_spot(req: AdminSpotCreate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(TouristSpot).where(TouristSpot.spot_id == req.spot_id))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Spot ID already exists.")
    s = TouristSpot(
        spot_id=req.spot_id,
        spot_name=req.spot_name,
        city=req.city or "",
        division=req.division or "",
        description=req.description or "",
        best_season=req.best_season or "Year-round",
        entry_fee=req.entry_fee,
        estimated_hours=req.estimated_hours,
    )
    db.add(s)
    await db.flush()
    return {"message": f"Spot {req.spot_id} created.", "spot_id": req.spot_id}


@router.put("/spots/{spot_id}")
async def update_spot(spot_id: str, req: AdminSpotUpdate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(TouristSpot).where(TouristSpot.spot_id == spot_id)
    result = await db.execute(stmt)
    s = result.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Spot not found")
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    return {"message": f"Spot {spot_id} updated."}


@router.delete("/spots/{spot_id}")
async def delete_spot(spot_id: str, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(TouristSpot).where(TouristSpot.spot_id == spot_id)
    result = await db.execute(stmt)
    s = result.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Spot not found")
    await db.delete(s)
    return {"message": f"Spot {spot_id} deleted."}


# ─── Contact Messages ───────────────────────────────

@router.get("/messages")
async def list_messages(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ContactMessage).order_by(desc(ContactMessage.submitted_at)))
    return result.scalars().all()


@router.delete("/messages/{message_id}")
async def delete_message(message_id: str, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(ContactMessage).where(ContactMessage.message_id == message_id)
    result = await db.execute(stmt)
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Message not found")
    await db.delete(m)
    return {"message": f"Message {message_id} deleted."}


# ─── Packages CRUD ──────────────────────────────────

@router.get("/packages")
async def list_packages(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Package).order_by(Package.price))
    return result.scalars().all()


@router.post("/packages")
async def create_package(req: PackageCreate, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    pkg = Package(
        package_id=f"PKG{uuid.uuid4().hex[:8].upper()}",
        package_name=req.package_name,
        price=req.price,
        booking_limit=req.booking_limit,
        transport_limit=req.transport_limit,
        hotel_limit=req.hotel_limit,
        guide_limit=req.guide_limit,
        discount_pct=req.discount_pct,
        priority=req.priority,
        exclusive=req.exclusive,
        complementary_breakfast=req.complementary_breakfast,
        complementary_lunch=req.complementary_lunch,
        complementary_dinner=req.complementary_dinner,
        features=req.features,
    )
    db.add(pkg)
    await db.flush()
    return {"message": f"Package {pkg.package_name} created.", "package_id": pkg.package_id}


@router.put("/packages/{package_id}")
async def update_package(
    package_id: str,
    req: PackageUpdate,
    user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Package).where(Package.package_id == package_id)
    result = await db.execute(stmt)
    pkg = result.scalar_one_or_none()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(pkg, field, value)
    return {"message": f"Package {pkg.package_name} updated."}


@router.delete("/packages/{package_id}")
async def delete_package(package_id: str, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(Package).where(Package.package_id == package_id)
    result = await db.execute(stmt)
    pkg = result.scalar_one_or_none()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    await db.delete(pkg)
    return {"message": f"Package {package_id} deleted."}


# ─── User Packages / Subscriptions ─────────────────

@router.get("/subscriptions")
async def list_subscriptions(user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = (
        select(UserPackage, User.user_name, Package.package_name)
        .join(User, UserPackage.user_id == User.user_id)
        .join(Package, UserPackage.package_id == Package.package_id)
        .order_by(desc(UserPackage.created_at))
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "id": up.id,
            "user_id": up.user_id,
            "user_name": name,
            "package_id": up.package_id,
            "package_name": pkg_name,
            "start_date": str(up.start_date) if up.start_date else None,
            "end_date": str(up.end_date) if up.end_date else None,
            "payment_status": up.payment_status,
        }
        for up, name, pkg_name in rows
    ]


@router.post("/subscriptions")
async def create_subscription(
    req: UserPackageCreate,
    user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    sub = UserPackage(
        user_id=req.user_id,
        package_id=req.package_id,
        end_date=req.end_date,
    )
    db.add(sub)
    await db.flush()
    return {"message": "Subscription created.", "id": sub.id}


@router.delete("/subscriptions/{sub_id}")
async def delete_subscription(sub_id: int, user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    stmt = select(UserPackage).where(UserPackage.id == sub_id)
    result = await db.execute(stmt)
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    await db.delete(sub)
    return {"message": f"Subscription {sub_id} deleted."}
