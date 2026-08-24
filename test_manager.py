"""Integration tests for /api/manager endpoints."""

import pytest
from httpx import AsyncClient

from tests.conftest import auth_header


class TestManagerProfile:
    """GET/PUT /api/manager/profile"""

    @pytest.mark.asyncio
    async def test_get_profile(self, client: AsyncClient, auth_token_manager):
        resp = await client.get(
            "/api/manager/profile",
            headers=auth_header(auth_token_manager),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["manager_id"] == "MGR001"
        assert data["hotel_name"] == "Test Hotel"

    @pytest.mark.asyncio
    async def test_get_profile_unauthenticated(self, client: AsyncClient):
        resp = await client.get("/api/manager/profile")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_update_profile(self, client: AsyncClient, auth_token_manager):
        resp = await client.put(
            "/api/manager/profile",
            headers=auth_header(auth_token_manager),
            json={
                "manager_name": "Updated Manager",
                "manager_email": "updated@mgr.com",
                "manager_mobile": "01900000000",
            },
        )
        assert resp.status_code == 200
        assert "successfully" in resp.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_update_profile_empty_fields(self, client: AsyncClient, auth_token_manager):
        resp = await client.put(
            "/api/manager/profile",
            headers=auth_header(auth_token_manager),
            json={"manager_name": "", "manager_email": "", "manager_mobile": ""},
        )
        # Empty email fails Pydantic validation (422) or business logic (400)
        assert resp.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_wrong_role_cannot_access(self, client: AsyncClient, auth_token_tourist):
        resp = await client.get(
            "/api/manager/profile",
            headers=auth_header(auth_token_tourist),
        )
        assert resp.status_code == 403


class TestManagerHotel:
    """PUT /api/manager/hotel"""

    @pytest.mark.asyncio
    async def test_update_hotel(self, client: AsyncClient, auth_token_manager):
        resp = await client.put(
            "/api/manager/hotel",
            headers=auth_header(auth_token_manager),
            json={
                "hotel_name": "Renovated Hotel",
                "hotel_division": "Sylhet",
                "hotel_district": "Sylhet",
                "hotel_location": "New Location",
                "hotel_rating": "4",
                "hotel_price": 10000,
                "hotel_description": "Updated description.",
            },
        )
        assert resp.status_code == 200
        assert "successfully" in resp.json()["message"].lower()


class TestManagerBookings:
    """GET /api/manager/bookings/pending and /history"""

    @pytest.mark.asyncio
    async def test_list_pending_empty(self, client: AsyncClient, auth_token_manager):
        resp = await client.get(
            "/api/manager/bookings/pending",
            headers=auth_header(auth_token_manager),
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    @pytest.mark.asyncio
    async def test_list_history_empty(self, client: AsyncClient, auth_token_manager):
        resp = await client.get(
            "/api/manager/bookings/history",
            headers=auth_header(auth_token_manager),
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestManagerApproveReject:
    """POST /api/manager/bookings/approve and /reject"""

    @pytest.mark.asyncio
    async def test_approve_nonexistent_booking(self, client: AsyncClient, auth_token_manager):
        resp = await client.post(
            "/api/manager/bookings/approve",
            headers=auth_header(auth_token_manager),
            json={"booking_id": "FAKE_BK"},
        )
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_reject_nonexistent_booking(self, client: AsyncClient, auth_token_manager):
        resp = await client.post(
            "/api/manager/bookings/reject",
            headers=auth_header(auth_token_manager),
            json={"booking_id": "FAKE_BK"},
        )
        assert resp.status_code == 404
