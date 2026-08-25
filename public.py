from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import List

from app.core.database import get_db
from app.models.models import TouristSpot, Hotel, Guide, Transportation, ContactMessage
from app.schemas.schemas import (
    TouristSpotResponse, ContactMessageRequest,
    HotelResponse, TransportationResponse,
)
import uuid

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/destinations")
async def get_destinations(db: AsyncSession = Depends(get_db)):
    """Get all tourist spots grouped by city, with avg hotel prices, guide rates, and transport costs."""

    stmt = select(TouristSpot).where(
        TouristSpot.city.in_(["Dhaka", "Sylhet", "Chittagong"])
    ).order_by(TouristSpot.city, TouristSpot.spot_name)
    result = await db.execute(stmt)
    spots = result.scalars().all()

    city_spots = {"Dhaka": [], "Sylhet": [], "Chittagong": []}
    for spot in spots:
        if spot.city in city_spots:
            city_spots[spot.city].append({
                "spot_id": spot.spot_id,
                "spot_name": spot.spot_name,
                "city": spot.city,
                "division": spot.division,
                "description": spot.description,
                "best_season": spot.best_season,
                "entry_fee": spot.entry_fee,
                "estimated_hours": float(spot.estimated_hours) if spot.estimated_hours else None,
            })


    hotel_stmt = (
        select(Hotel.hotel_division, func.avg(Hotel.hotel_price).label("avg_price"))
        .where(Hotel.hotel_division.in_(["Dhaka", "Sylhet", "Chittagong"]))
        .group_by(Hotel.hotel_division)
    )
    result = await db.execute(hotel_stmt)
    hotel_prices = {row[0]: int(row[1]) for row in result.all()}


    guide_stmt = (
        select(Guide.guide_division, func.avg(Guide.guide_rate).label("avg_rate"))
        .where(
            Guide.guide_division.in_(["Dhaka", "Sylhet", "Chittagong"]),
            Guide.guide_rate > 0,
        )
        .group_by(Guide.guide_division)
    )
    result = await db.execute(guide_stmt)
    guide_rates = {row[0]: int(row[1]) for row in result.all()}


    transport_modes = {}
    for city in ["Sylhet", "Chittagong"]:
        route = f"Dhaka-{city}"
        t_stmt = (
            select(Transportation.transport_type, func.avg(Transportation.transport_fare).label("avg_fare"))
            .where(Transportation.transport_route == route)
            .group_by(Transportation.transport_type)
        )
        result = await db.execute(t_stmt)
        transport_modes[city] = {
            row[0]: int(row[1])
            for row in result.all()
        }

    return {
        "city_spots": city_spots,
        "hotel_prices": hotel_prices,
        "guide_rates": guide_rates,
        "transport_modes": transport_modes,
    }


@router.post("/contact")
async def submit_contact(req: ContactMessageRequest, db: AsyncSession = Depends(get_db)):
    """Submit a contact message."""
    if not req.name or not req.email or not req.message:
        raise HTTPException(status_code=400, detail="Please fill in all required fields.")
    if len(req.message) < 10:
        raise HTTPException(status_code=400, detail="Message must be at least 10 characters.")

    msg = ContactMessage(
        message_id=f"MSG{uuid.uuid4().hex[:8].upper()}",
        name=req.name,
        email=req.email,
        phone=req.phone or "",
        message=req.message,
    )
    db.add(msg)
    await db.flush()
    return {"message": "Thank you! Your message has been sent successfully."}


@router.get("/hotels")
async def list_all_hotels(db: AsyncSession = Depends(get_db)):
    """List all hotels (public)."""
    stmt = select(Hotel).order_by(Hotel.hotel_name)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/transports")
async def list_all_transports(db: AsyncSession = Depends(get_db)):
    """List all transports (public)."""
    stmt = select(Transportation).order_by(Transportation.transport_route)
    result = await db.execute(stmt)
    return result.scalars().all()
