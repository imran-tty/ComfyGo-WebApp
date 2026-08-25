"""Integration tests for /api/public endpoints."""

import pytest
from httpx import AsyncClient


class TestDestinations:
    """GET /api/public/destinations"""

    @pytest.mark.asyncio
    async def test_get_destinations_empty(self, client: AsyncClient):
        resp = await client.get("/api/public/destinations")
        assert resp.status_code == 200
        data = resp.json()
        assert "city_spots" in data
        assert "hotel_prices" in data
        assert "guide_rates" in data
        assert "transport_modes" in data

    @pytest.mark.asyncio
    async def test_get_destinations_with_data(
        self, client: AsyncClient, seed_tourist_spot, seed_hotel, seed_guide, seed_transport
    ):
        resp = await client.get("/api/public/destinations")
        assert resp.status_code == 200
        data = resp.json()

        sylhet_spots = data["city_spots"].get("Sylhet", [])
        assert len(sylhet_spots) >= 1
        assert sylhet_spots[0]["spot_name"] == "Test Spot"


class TestContactSubmit:
    """POST /api/public/contact"""

    @pytest.mark.asyncio
    async def test_submit_contact_success(self, client: AsyncClient):
        resp = await client.post("/api/public/contact", json={
            "name": "Test User",
            "email": "test@example.com",
            "phone": "01700000000",
            "message": "This is a valid test message with enough characters.",
        })
        assert resp.status_code == 200
        assert "successfully" in resp.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_submit_contact_short_message(self, client: AsyncClient):
        resp = await client.post("/api/public/contact", json={
            "name": "Test",
            "email": "t@test.com",
            "message": "Short",
        })
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_submit_contact_invalid_email(self, client: AsyncClient):
        resp = await client.post("/api/public/contact", json={
            "name": "Test",
            "email": "not-email",
            "message": "This is a valid message with enough length.",
        })
        assert resp.status_code == 422


class TestPublicHotels:
    """GET /api/public/hotels"""

    @pytest.mark.asyncio
    async def test_list_all_hotels(self, client: AsyncClient, seed_hotel):
        resp = await client.get("/api/public/hotels")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1


class TestPublicTransports:
    """GET /api/public/transports"""

    @pytest.mark.asyncio
    async def test_list_all_transports(self, client: AsyncClient, seed_transport):
        resp = await client.get("/api/public/transports")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1
