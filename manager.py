from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import require_user
from app.models.models import Manager, Hotel, Booking, User
from app.schemas.schemas import ManagerProfileUpdate, HotelUpdate, BookingApprovalRequest, BookingResponse

router = APIRouter(prefix="/api/manager", tags=["manager"])


@router.get("/profile")
async def get_profile(user: dict = Depends(require_user), db: AsyncSession = Depends(get_db)):
    """Get manager profile with hotel info."""
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")

    stmt = (
        select(Manager, Hotel)
        .outerjoin(Hotel, Manager.hotel_registration_number == Hotel.hotel_registration_number)
        .where(Manager.manager_id == user["id"])
    )
    result = await db.execute(stmt)
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Manager not found")

    m, h = row
    return {
        "manager_id": m.manager_id,
        "manager_name": m.manager_name,
        "manager_email": m.manager_email,
        "manager_mobile": m.manager_mobile,
        "hotel_registration_number": m.hotel_registration_number,
        "hotel_name": h.hotel_name if h else None,
        "hotel_division": h.hotel_division if h else None,
        "hotel_district": h.hotel_district if h else None,
        "hotel_location": h.hotel_location if h else None,
        "hotel_rating": h.hotel_rating if h else None,
        "hotel_price": h.hotel_price if h else 0,
        "hotel_description": h.hotel_description if h else None,
    }


@router.put("/profile")
async def update_profile(
    req: ManagerProfileUpdate,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Update manager profile."""
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")
    if not all([req.manager_name, req.manager_email, req.manager_mobile]):
        raise HTTPException(status_code=400, detail="Please fill in all fields.")

    # Check email uniqueness
    existing = await db.execute(
        select(Manager).where(
            Manager.manager_email == req.manager_email,
            Manager.manager_id != user["id"],
        ).limit(1)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="That email is already in use by another manager.")

    stmt = select(Manager).where(Manager.manager_id == user["id"])
    result = await db.execute(stmt)
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Manager not found")

    m.manager_name = req.manager_name
    m.manager_email = req.manager_email
    m.manager_mobile = req.manager_mobile
    return {"message": "Profile updated successfully."}


@router.put("/hotel")
async def update_hotel(
    req: HotelUpdate,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Update hotel details."""
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")
    if not all([req.hotel_name, req.hotel_division, req.hotel_district, req.hotel_location]):
        raise HTTPException(status_code=400, detail="Please fill in all hotel fields.")

    # Get manager's hotel reg number
    mgr_stmt = select(Manager).where(Manager.manager_id == user["id"])
    mgr_result = await db.execute(mgr_stmt)
    mgr = mgr_result.scalar_one_or_none()
    if not mgr:
        raise HTTPException(status_code=404, detail="Manager not found")

    stmt = select(Hotel).where(Hotel.hotel_registration_number == mgr.hotel_registration_number)
    result = await db.execute(stmt)
    hotel = result.scalar_one_or_none()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    hotel.hotel_name = req.hotel_name
    hotel.hotel_division = req.hotel_division
    hotel.hotel_district = req.hotel_district
    hotel.hotel_location = req.hotel_location
    hotel.hotel_rating = req.hotel_rating
    hotel.hotel_price = req.hotel_price
    hotel.hotel_description = req.hotel_description
    return {"message": "Hotel details updated successfully."}


@router.get("/bookings/pending")
async def list_pending_bookings(
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """List pending hotel bookings."""
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")

    mgr_stmt = select(Manager).where(Manager.manager_id == user["id"])
    mgr_result = await db.execute(mgr_stmt)
    mgr = mgr_result.scalar_one_or_none()
    if not mgr:
        raise HTTPException(status_code=404, detail="Manager not found")

    stmt = (
        select(Booking, User.user_name, User.user_phone, User.user_email)
        .join(User, Booking.user_id == User.user_id)
        .where(
            Booking.booking_type == "Hotel",
            Booking.hotel_registration_number == mgr.hotel_registration_number,
            Booking.booking_confirmation == "Pending",
        )
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
            user_name=name,
            user_phone=phone,
            user_email=email,
        )
        for b, name, phone, email in rows
    ]


@router.get("/bookings/history")
async def list_booking_history(
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """List non-pending hotel bookings."""
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")

    mgr_stmt = select(Manager).where(Manager.manager_id == user["id"])
    mgr_result = await db.execute(mgr_stmt)
    mgr = mgr_result.scalar_one_or_none()
    if not mgr:
        raise HTTPException(status_code=404, detail="Manager not found")

    stmt = (
        select(Booking, User.user_name, User.user_phone, User.user_email)
        .join(User, Booking.user_id == User.user_id)
        .where(
            Booking.booking_type == "Hotel",
            Booking.hotel_registration_number == mgr.hotel_registration_number,
            Booking.booking_confirmation != "Pending",
        )
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
            user_name=name,
            user_phone=phone,
            user_email=email,
        )
        for b, name, phone, email in rows
    ]


@router.post("/bookings/approve")
async def approve_booking(
    req: BookingApprovalRequest,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Approve a pending hotel booking."""
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")

    mgr_stmt = select(Manager).where(Manager.manager_id == user["id"])
    mgr_result = await db.execute(mgr_stmt)
    mgr = mgr_result.scalar_one_or_none()

    stmt = select(Booking).where(
        Booking.booking_id == req.booking_id,
        Booking.hotel_registration_number == mgr.hotel_registration_number,
    )
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    booking.booking_confirmation = "Confirmed"
    return {"message": "Booking has been approved and confirmed."}


@router.post("/bookings/reject")
async def reject_booking(
    req: BookingApprovalRequest,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Reject a pending hotel booking."""
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")

    mgr_stmt = select(Manager).where(Manager.manager_id == user["id"])
    mgr_result = await db.execute(mgr_stmt)
    mgr = mgr_result.scalar_one_or_none()

    stmt = select(Booking).where(
        Booking.booking_id == req.booking_id,
        Booking.hotel_registration_number == mgr.hotel_registration_number,
    )
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    booking.booking_confirmation = "Rejected"
    return {"message": "Booking has been rejected."}
