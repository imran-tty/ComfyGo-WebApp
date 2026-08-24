from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import require_user
from app.models.models import Guide, Booking, User
from app.schemas.schemas import GuideProfileUpdate, BookingApprovalRequest, BookingResponse

router = APIRouter(prefix="/api/guide", tags=["guide"])


@router.get("/profile")
async def get_profile(user: dict = Depends(require_user), db: AsyncSession = Depends(get_db)):
    """Get guide profile."""
    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guide access required")
    stmt = select(Guide).where(Guide.guide_nid == user["id"])
    result = await db.execute(stmt)
    g = result.scalar_one_or_none()
    if not g:
        raise HTTPException(status_code=404, detail="Guide not found")
    return {
        "guide_nid": g.guide_nid,
        "guide_name": g.guide_name,
        "guide_email": g.guide_email,
        "guide_mobile": g.guide_mobile,
        "guide_division": g.guide_division,
        "guide_district": g.guide_district,
        "guide_rate": g.guide_rate,
    }


@router.put("/profile")
async def update_profile(
    req: GuideProfileUpdate,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Update guide profile."""
    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guide access required")
    if not all([req.guide_name, req.guide_email, req.guide_mobile, req.guide_division, req.guide_district]):
        raise HTTPException(status_code=400, detail="Please fill in all fields.")

    stmt = select(Guide).where(Guide.guide_nid == user["id"])
    result = await db.execute(stmt)
    g = result.scalar_one_or_none()
    if not g:
        raise HTTPException(status_code=404, detail="Guide not found")

    g.guide_name = req.guide_name
    g.guide_email = req.guide_email
    g.guide_mobile = req.guide_mobile
    g.guide_division = req.guide_division
    g.guide_district = req.guide_district
    g.guide_rate = req.guide_rate
    return {"message": "Profile updated successfully."}


@router.get("/bookings/pending")
async def list_pending_bookings(
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """List pending guide bookings with tourist info."""
    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guide access required")

    stmt = (
        select(Booking, User.user_name, User.user_phone, User.user_email)
        .join(User, Booking.user_id == User.user_id)
        .where(
            Booking.booking_type == "Guide",
            Booking.guide_nid == user["id"],
            Booking.booking_confirmation == "Pending",
        )
        .order_by(Booking.booking_date.asc())
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
    """List non-pending guide bookings."""
    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guide access required")

    stmt = (
        select(Booking, User.user_name, User.user_phone)
        .join(User, Booking.user_id == User.user_id)
        .where(
            Booking.booking_type == "Guide",
            Booking.guide_nid == user["id"],
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
        )
        for b, name, phone in rows
    ]


@router.post("/bookings/approve")
async def approve_booking(
    req: BookingApprovalRequest,
    user: dict = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Approve a pending guide booking."""
    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guide access required")
    if not req.booking_id:
        raise HTTPException(status_code=400, detail="Invalid booking ID.")

    stmt = select(Booking).where(
        Booking.booking_id == req.booking_id,
        Booking.guide_nid == user["id"],
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
    """Reject a pending guide booking."""
    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guide access required")
    if not req.booking_id:
        raise HTTPException(status_code=400, detail="Invalid booking ID.")

    stmt = select(Booking).where(
        Booking.booking_id == req.booking_id,
        Booking.guide_nid == user["id"],
    )
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    booking.booking_confirmation = "Rejected"
    return {"message": "Booking has been rejected."}
