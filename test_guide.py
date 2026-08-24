"""Integration tests for /api/guide endpoints."""

import pytest
from httpx import AsyncClient

from tests.conftest import auth_header


class TestGuideProfile:
    """GET/PUT /api/guide/profile"""

    @pytest.mark.asyncio
    async def test_get_profile(self, client: AsyncClient, auth_token_guide):
        resp = await client.get(
            "/api/guide/profile",
            headers=auth_header(auth_token_guide),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["guide_nid"] == "GID001"
        assert data["guide_name"] == "Test Guide"

    @pytest.mark.asyncio
    async def test_get_profile_unauthenticated(self, client: AsyncClient):
        resp = await client.get("/api/guide/profile")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_update_profile(self, client: AsyncClient, auth_token_guide):
        resp = await client.put(
            "/api/guide/profile",
            headers=auth_header(auth_token_guide),
            json={
                "guide_name": "Updated Guide",
                "guide_email": "updated@guide.com",
                "guide_mobile": "01800000000",
                "guide_division": "Dhaka",
                "guide_district": "Dhaka",
                "guide_rate": 2500,
            },
        )
        assert resp.status_code == 200
        assert "successfully" in resp.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_update_profile_empty_fields(self, client: AsyncClient, auth_token_guide):
        resp = await client.put(
            "/api/guide/profile",
            headers=auth_header(auth_token_guide),
            json={
                "guide_name": "",
                "guide_email": "",
                "guide_mobile": "",
                "guide_division": "",
                "guide_district": "",
                "guide_rate": 0,
            },
        )
        # Empty email fails Pydantic validation (422) or business logic (400)
        assert resp.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_wrong_role_cannot_access(self, client: AsyncClient, auth_token_tourist):
        resp = await client.get(
            "/api/guide/profile",
            headers=auth_header(auth_token_tourist),
        )
        assert resp.status_code == 403


class TestGuidePendingBookings:
    """GET /api/guide/bookings/pending"""

    @pytest.mark.asyncio
    async def test_list_pending_empty(self, client: AsyncClient, auth_token_guide):
        resp = await client.get(
            "/api/guide/bookings/pending",
            headers=auth_header(auth_token_guide),
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestGuideBookingHistory:
    """GET /api/guide/bookings/history"""

    @pytest.mark.asyncio
    async def test_list_history_empty(self, client: AsyncClient, auth_token_guide):
        resp = await client.get(
            "/api/guide/bookings/history",
            headers=auth_header(auth_token_guide),
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestGuideApproveReject:
    """POST /api/guide/bookings/approve and /reject"""

    @pytest.mark.asyncio
    async def test_approve_nonexistent_booking(self, client: AsyncClient, auth_token_guide):
        resp = await client.post(
            "/api/guide/bookings/approve",
            headers=auth_header(auth_token_guide),
            json={"booking_id": "FAKE_BK"},
        )
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_reject_nonexistent_booking(self, client: AsyncClient, auth_token_guide):
        resp = await client.post(
            "/api/guide/bookings/reject",
            headers=auth_header(auth_token_guide),
            json={"booking_id": "FAKE_BK"},
        )
        assert resp.status_code == 404
