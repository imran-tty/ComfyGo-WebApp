"""Integration tests for /api/admin endpoints."""

import pytest
from httpx import AsyncClient

from tests.conftest import auth_header


class TestAdminLogin:
    """POST /api/admin/login"""

    @pytest.mark.asyncio
    async def test_admin_login_success(self, client: AsyncClient, seed_admin):
        resp = await client.post("/api/admin/login", json={
            "email": "admin@test.com",
            "password": "admin123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["role"] == "admin"
        assert "access_token" in data

    @pytest.mark.asyncio
    async def test_admin_login_wrong_password(self, client: AsyncClient, seed_admin):
        resp = await client.post("/api/admin/login", json={
            "email": "admin@test.com",
            "password": "wrong",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_login_nonexistent(self, client: AsyncClient):
        resp = await client.post("/api/admin/login", json={
            "email": "noone@test.com",
            "password": "pass",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_login_empty_fields(self, client: AsyncClient):
        resp = await client.post("/api/admin/login", json={
            "email": "",
            "password": "",
        })
        assert resp.status_code == 400


class TestAdminStats:
    """GET /api/admin/stats"""

    @pytest.mark.asyncio
    async def test_get_stats(self, client: AsyncClient, auth_token_admin):
        resp = await client.get(
            "/api/admin/stats",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "users" in data
        assert "hotels" in data
        assert "bookings" in data
        assert "total_revenue" in data

    @pytest.mark.asyncio
    async def test_stats_requires_admin(self, client: AsyncClient, auth_token_tourist):
        resp = await client.get(
            "/api/admin/stats",
            headers=auth_header(auth_token_tourist),
        )
        assert resp.status_code == 403


class TestAdminUsersCRUD:
    """GET /api/admin/users, DELETE /api/admin/users/{id}"""

    @pytest.mark.asyncio
    async def test_list_users(self, client: AsyncClient, auth_token_admin, seed_user):
        resp = await client.get(
            "/api/admin/users",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_delete_user(self, client: AsyncClient, auth_token_admin, seed_user):
        resp = await client.delete(
            "/api/admin/users/USR001",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert "deleted" in resp.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_delete_user_not_found(self, client: AsyncClient, auth_token_admin):
        resp = await client.delete(
            "/api/admin/users/FAKE",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 404


class TestAdminGuidesCRUD:
    """GET /api/admin/guides, DELETE /api/admin/guides/{id}"""

    @pytest.mark.asyncio
    async def test_list_guides(self, client: AsyncClient, auth_token_admin, seed_guide):
        resp = await client.get(
            "/api/admin/guides",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_delete_guide(self, client: AsyncClient, auth_token_admin, seed_guide):
        resp = await client.delete(
            "/api/admin/guides/GID001",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_delete_guide_not_found(self, client: AsyncClient, auth_token_admin):
        resp = await client.delete(
            "/api/admin/guides/FAKE",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 404


class TestAdminManagersCRUD:
    """GET /api/admin/managers, DELETE /api/admin/managers/{id}"""

    @pytest.mark.asyncio
    async def test_list_managers(self, client: AsyncClient, auth_token_admin, seed_manager):
        resp = await client.get(
            "/api/admin/managers",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_delete_manager(self, client: AsyncClient, auth_token_admin, seed_manager):
        resp = await client.delete(
            "/api/admin/managers/MGR001",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_delete_manager_not_found(self, client: AsyncClient, auth_token_admin):
        resp = await client.delete(
            "/api/admin/managers/FAKE",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 404


class TestAdminHotelsCRUD:
    """GET /api/admin/hotels, DELETE /api/admin/hotels/{id}"""

    @pytest.mark.asyncio
    async def test_list_hotels(self, client: AsyncClient, auth_token_admin, seed_hotel):
        resp = await client.get(
            "/api/admin/hotels",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_delete_hotel(self, client: AsyncClient, auth_token_admin, seed_hotel):
        resp = await client.delete(
            "/api/admin/hotels/H001",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200


class TestAdminTransportsCRUD:
    """GET /api/admin/transports, DELETE /api/admin/transports/{id}"""

    @pytest.mark.asyncio
    async def test_list_transports(self, client: AsyncClient, auth_token_admin, seed_transport):
        resp = await client.get(
            "/api/admin/transports",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_delete_transport(self, client: AsyncClient, auth_token_admin, seed_transport):
        resp = await client.delete(
            "/api/admin/transports/TR001",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200


class TestAdminBookingsCRUD:
    """GET /api/admin/bookings, POST /api/admin/bookings/{id}/void"""

    @pytest.mark.asyncio
    async def test_list_bookings(self, client: AsyncClient, auth_token_admin, seed_booking):
        resp = await client.get(
            "/api/admin/bookings",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_void_booking(self, client: AsyncClient, auth_token_admin, seed_booking):
        resp = await client.post(
            "/api/admin/bookings/BK00001/void",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert "voided" in resp.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_void_booking_not_found(self, client: AsyncClient, auth_token_admin):
        resp = await client.post(
            "/api/admin/bookings/FAKE/void",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 404


class TestAdminPaymentsCRUD:
    """GET /api/admin/payments, POST /api/admin/payments/{id}/refund"""

    @pytest.mark.asyncio
    async def test_list_payments(self, client: AsyncClient, auth_token_admin, seed_booking):
        resp = await client.get(
            "/api/admin/payments",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_refund_payment(self, client: AsyncClient, auth_token_admin, seed_booking):
        resp = await client.post(
            "/api/admin/payments/PY00001/refund",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert "refunded" in resp.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_refund_payment_not_found(self, client: AsyncClient, auth_token_admin):
        resp = await client.post(
            "/api/admin/payments/FAKE/refund",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 404


class TestAdminSpotsCRUD:
    """GET /api/admin/spots, DELETE /api/admin/spots/{id}"""

    @pytest.mark.asyncio
    async def test_list_spots(self, client: AsyncClient, auth_token_admin, seed_tourist_spot):
        resp = await client.get(
            "/api/admin/spots",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_delete_spot(self, client: AsyncClient, auth_token_admin, seed_tourist_spot):
        resp = await client.delete(
            "/api/admin/spots/SP001",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_delete_spot_not_found(self, client: AsyncClient, auth_token_admin):
        resp = await client.delete(
            "/api/admin/spots/FAKE",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 404


class TestAdminMessagesCRUD:
    """GET /api/admin/messages, DELETE /api/admin/messages/{id}"""

    @pytest.mark.asyncio
    async def test_list_messages(self, client: AsyncClient, auth_token_admin, seed_contact_message):
        resp = await client.get(
            "/api/admin/messages",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_delete_message(self, client: AsyncClient, auth_token_admin, seed_contact_message):
        resp = await client.delete(
            "/api/admin/messages/MSG001",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_delete_message_not_found(self, client: AsyncClient, auth_token_admin):
        resp = await client.delete(
            "/api/admin/messages/FAKE",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 404


class TestAdminPackagesCRUD:
    """GET/POST/PUT/DELETE /api/admin/packages"""

    @pytest.mark.asyncio
    async def test_list_packages_empty(self, client: AsyncClient, auth_token_admin):
        resp = await client.get(
            "/api/admin/packages",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    @pytest.mark.asyncio
    async def test_create_package(self, client: AsyncClient, auth_token_admin):
        resp = await client.post(
            "/api/admin/packages",
            headers=auth_header(auth_token_admin),
            json={
                "package_name": "Platinum",
                "price": 10000,
                "booking_limit": 10,
                "discount_pct": 20,
                "priority": True,
                "exclusive": True,
                "features": "All features included",
            },
        )
        assert resp.status_code == 200
        assert "package_id" in resp.json()

    @pytest.mark.asyncio
    async def test_update_package(self, client: AsyncClient, auth_token_admin, seed_package):
        resp = await client.put(
            "/api/admin/packages/PKG001",
            headers=auth_header(auth_token_admin),
            json={"price": 7000, "package_name": "Gold Updated"},
        )
        assert resp.status_code == 200
        assert "updated" in resp.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_delete_package(self, client: AsyncClient, auth_token_admin, seed_package):
        resp = await client.delete(
            "/api/admin/packages/PKG001",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert "deleted" in resp.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_delete_package_not_found(self, client: AsyncClient, auth_token_admin):
        resp = await client.delete(
            "/api/admin/packages/FAKE",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 404


class TestAdminSubscriptionsCRUD:
    """GET/POST/DELETE /api/admin/subscriptions"""

    @pytest.mark.asyncio
    async def test_list_subscriptions_empty(self, client: AsyncClient, auth_token_admin):
        resp = await client.get(
            "/api/admin/subscriptions",
            headers=auth_header(auth_token_admin),
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    @pytest.mark.asyncio
    async def test_create_subscription(
        self, client: AsyncClient, auth_token_admin, seed_user, seed_package
    ):
        resp = await client.post(
            "/api/admin/subscriptions",
            headers=auth_header(auth_token_admin),
            json={
                "user_id": "USR001",
                "package_id": "PKG001",
            },
        )
        assert resp.status_code == 200
        assert "id" in resp.json()
