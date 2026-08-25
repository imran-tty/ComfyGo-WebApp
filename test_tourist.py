"""Integration tests for /api/tourist endpoints."""

import pytest
from httpx import AsyncClient

from tests.conftest import auth_header


class TestTouristProfile:
    """GET/PUT /api/tourist/profile"""

    @pytest.mark.asyncio
    async def test_get_profile(self, client: AsyncClient, auth_token_tourist):
        resp = await client.get(
            "/api/tourist/profile",
            headers=auth_header(auth_token_tourist),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["user_id"] == "USR001"
        assert data["user_email"] == "tourist@test.com"

    @pytest.mark.asyncio
    async def test_get_profile_unauthenticated(self, client: AsyncClient):
        resp = await client.get("/api/tourist/profile")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_update_profile(self, client: AsyncClient, auth_token_tourist):
        resp = await client.put(
            "/api/tourist/profile",
            headers=auth_header(auth_token_tourist),
            json={
                "user_name": "Updated Name",
                "user_email": "updated@test.com",
                "user_phone": "01900000000",
            },
        )
        assert resp.status_code == 200
        assert "successfully" in resp.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_update_profile_empty_fields(self, client: AsyncClient, auth_token_tourist):
        resp = await client.put(
            "/api/tourist/profile",
            headers=auth_header(auth_token_tourist),
            json={"user_name": "", "user_email": "", "user_phone": ""},
        )

        assert resp.status_code in (400, 422)


class TestTouristTransports:
    """GET /api/tourist/transports"""

    @pytest.mark.asyncio
    async def test_list_transports(self, client: AsyncClient, seed_transport):
        resp = await client.get("/api/tourist/transports")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1

    @pytest.mark.asyncio
    async def test_list_transports_filter_route(self, client: AsyncClient, seed_transport):
        resp = await client.get("/api/tourist/transports", params={"route": "Dhaka"})
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_list_transports_no_match(self, client: AsyncClient, seed_transport):
        resp = await client.get("/api/tourist/transports", params={"route": "Nowhere"})
        assert resp.status_code == 200
        assert len(resp.json()) == 0


class TestTouristHotels:
    """GET /api/tourist/hotels"""

    @pytest.mark.asyncio
    async def test_list_hotels(self, client: AsyncClient, seed_hotel):
        resp = await client.get("/api/tourist/hotels")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_list_hotels_filter_division(self, client: AsyncClient, seed_hotel):
        resp = await client.get("/api/tourist/hotels", params={"division": "Sylhet"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_list_hotels_empty_filter(self, client: AsyncClient, seed_hotel):
        resp = await client.get("/api/tourist/hotels", params={"division": "Nowhere"})
        assert resp.status_code == 200
        assert len(resp.json()) == 0


class TestTouristGuides:
    """GET /api/tourist/guides"""

    @pytest.mark.asyncio
    async def test_list_guides(self, client: AsyncClient, seed_guide):
        resp = await client.get("/api/tourist/guides")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_list_guides_filter(self, client: AsyncClient, seed_guide):
        resp = await client.get("/api/tourist/guides", params={"guide_division": "Sylhet"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1


class TestTouristBookings:
    """GET /api/tourist/bookings"""

    @pytest.mark.asyncio
    async def test_list_bookings_empty(self, client: AsyncClient, auth_token_tourist):
        resp = await client.get(
            "/api/tourist/bookings",
            headers=auth_header(auth_token_tourist),
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestBookTransport:
    """POST /api/tourist/book/transport"""

    @pytest.mark.asyncio
    async def test_book_transport_success(
        self, client: AsyncClient, auth_token_tourist, seed_transport
    ):
        resp = await client.post(
            "/api/tourist/book/transport",
            headers=auth_header(auth_token_tourist),
            json={"transport_id": "TR001", "travel_date": "2026-09-15"},
        )
        assert resp.status_code == 200
        assert "booking_id" in resp.json()

    @pytest.mark.asyncio
    async def test_book_transport_not_found(
        self, client: AsyncClient, auth_token_tourist
    ):
        resp = await client.post(
            "/api/tourist/book/transport",
            headers=auth_header(auth_token_tourist),
            json={"transport_id": "FAKE", "travel_date": "2026-09-15"},
        )
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_book_transport_missing_fields(
        self, client: AsyncClient, auth_token_tourist
    ):
        resp = await client.post(
            "/api/tourist/book/transport",
            headers=auth_header(auth_token_tourist),
            json={"transport_id": "", "travel_date": ""},
        )
        assert resp.status_code == 400


class TestBookHotel:
    """POST /api/tourist/book/hotel"""

    @pytest.mark.asyncio
    async def test_book_hotel_success(
        self, client: AsyncClient, auth_token_tourist, seed_hotel
    ):
        resp = await client.post(
            "/api/tourist/book/hotel",
            headers=auth_header(auth_token_tourist),
            json={"hotel_reg": "H001", "checkin": "2026-10-01"},
        )
        assert resp.status_code == 200
        assert "booking_id" in resp.json()

    @pytest.mark.asyncio
    async def test_book_hotel_not_found(self, client: AsyncClient, auth_token_tourist):
        resp = await client.post(
            "/api/tourist/book/hotel",
            headers=auth_header(auth_token_tourist),
            json={"hotel_reg": "INVALID", "checkin": "2026-10-01"},
        )
        assert resp.status_code == 404


class TestBookGuide:
    """POST /api/tourist/book/guide"""

    @pytest.mark.asyncio
    async def test_book_guide_success(
        self, client: AsyncClient, auth_token_tourist, seed_guide
    ):
        resp = await client.post(
            "/api/tourist/book/guide",
            headers=auth_header(auth_token_tourist),
            json={"guide_nid": "GID001", "guide_date": "2026-10-05"},
        )
        assert resp.status_code == 200
        assert "booking_id" in resp.json()

    @pytest.mark.asyncio
    async def test_book_guide_not_found(self, client: AsyncClient, auth_token_tourist):
        resp = await client.post(
            "/api/tourist/book/guide",
            headers=auth_header(auth_token_tourist),
            json={"guide_nid": "FAKE", "guide_date": "2026-10-05"},
        )
        assert resp.status_code == 404
