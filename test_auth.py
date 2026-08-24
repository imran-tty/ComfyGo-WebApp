"""Integration tests for /api/auth endpoints."""

import pytest
from httpx import AsyncClient

from tests.conftest import auth_header


class TestLogin:
    """POST /api/auth/login"""

    @pytest.mark.asyncio
    async def test_login_tourist_success(self, client: AsyncClient, seed_user):
        resp = await client.post("/api/auth/login", json={
            "email": "tourist@test.com",
            "password": "password123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["role"] == "tourist"
        assert data["user_id"] == "USR001"
        assert "access_token" in data

    @pytest.mark.asyncio
    async def test_login_guide_success(self, client: AsyncClient, seed_guide):
        resp = await client.post("/api/auth/login", json={
            "email": "guide@test.com",
            "password": "password123",
        })
        assert resp.status_code == 200
        assert resp.json()["role"] == "guide"

    @pytest.mark.asyncio
    async def test_login_manager_success(self, client: AsyncClient, seed_manager):
        resp = await client.post("/api/auth/login", json={
            "email": "manager@test.com",
            "password": "password123",
        })
        assert resp.status_code == 200
        assert resp.json()["role"] == "manager"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, seed_user):
        resp = await client.post("/api/auth/login", json={
            "email": "tourist@test.com",
            "password": "wrongpass",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_email(self, client: AsyncClient):
        resp = await client.post("/api/auth/login", json={
            "email": "nobody@test.com",
            "password": "pass",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_empty_fields(self, client: AsyncClient):
        resp = await client.post("/api/auth/login", json={
            "email": "",
            "password": "",
        })
        assert resp.status_code == 400


class TestSignupTourist:
    """POST /api/auth/signup/tourist"""

    @pytest.mark.asyncio
    async def test_signup_success(self, client: AsyncClient):
        resp = await client.post("/api/auth/signup/tourist", json={
            "user_id": "USR_NEW",
            "user_name": "New Tourist",
            "user_email": "new@test.com",
            "user_phone": "01800000000",
            "password": "password123",
            "confirm_password": "password123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["role"] == "tourist"
        assert data["user_id"] == "USR_NEW"

    @pytest.mark.asyncio
    async def test_signup_duplicate_id(self, client: AsyncClient, seed_user):
        resp = await client.post("/api/auth/signup/tourist", json={
            "user_id": "USR001",
            "user_name": "Another",
            "user_email": "another@test.com",
            "user_phone": "01900000000",
            "password": "password123",
            "confirm_password": "password123",
        })
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_signup_password_mismatch(self, client: AsyncClient):
        resp = await client.post("/api/auth/signup/tourist", json={
            "user_id": "USR_X",
            "user_name": "User",
            "user_email": "x@test.com",
            "user_phone": "017",
            "password": "password123",
            "confirm_password": "different",
        })
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_signup_short_password(self, client: AsyncClient):
        resp = await client.post("/api/auth/signup/tourist", json={
            "user_id": "USR_S",
            "user_name": "User",
            "user_email": "s@test.com",
            "user_phone": "017",
            "password": "ab",
            "confirm_password": "ab",
        })
        assert resp.status_code == 400


class TestSignupGuide:
    """POST /api/auth/signup/guide"""

    @pytest.mark.asyncio
    async def test_signup_guide_success(self, client: AsyncClient):
        resp = await client.post("/api/auth/signup/guide", json={
            "guide_nid": "GID_NEW",
            "guide_name": "New Guide",
            "guide_email": "newguide@test.com",
            "guide_mobile": "01700000099",
            "guide_division": "Sylhet",
            "guide_district": "Sylhet",
            "password": "password123",
            "confirm_password": "password123",
        })
        assert resp.status_code == 200
        assert resp.json()["role"] == "guide"

    @pytest.mark.asyncio
    async def test_signup_guide_duplicate(self, client: AsyncClient, seed_guide):
        resp = await client.post("/api/auth/signup/guide", json={
            "guide_nid": "GID001",
            "guide_name": "Dup",
            "guide_email": "dup@test.com",
            "guide_mobile": "017",
            "guide_division": "Dhaka",
            "guide_district": "Dhaka",
            "password": "password123",
            "confirm_password": "password123",
        })
        assert resp.status_code == 400


class TestSignupManager:
    """POST /api/auth/signup/manager"""

    @pytest.mark.asyncio
    async def test_signup_manager_success(self, client: AsyncClient, seed_hotel):
        resp = await client.post("/api/auth/signup/manager", json={
            "manager_id": "MGR_NEW",
            "manager_name": "New Manager",
            "manager_email": "newmgr@test.com",
            "manager_mobile": "01700000088",
            "hotel_registration_number": "H001",
            "password": "password123",
            "confirm_password": "password123",
        })
        assert resp.status_code == 200
        assert resp.json()["role"] == "manager"

    @pytest.mark.asyncio
    async def test_signup_manager_invalid_hotel(self, client: AsyncClient):
        resp = await client.post("/api/auth/signup/manager", json={
            "manager_id": "MGR_X",
            "manager_name": "X",
            "manager_email": "x@mgr.com",
            "manager_mobile": "017",
            "hotel_registration_number": "INVALID",
            "password": "password123",
            "confirm_password": "password123",
        })
        assert resp.status_code == 400


class TestLogout:
    """POST /api/auth/logout"""

    @pytest.mark.asyncio
    async def test_logout(self, client: AsyncClient):
        resp = await client.post("/api/auth/logout")
        assert resp.status_code == 200
        assert "Logged out" in resp.json()["message"]


class TestForgotPassword:
    """POST /api/auth/forgot-password"""

    @pytest.mark.asyncio
    async def test_forgot_password_tourist(self, client: AsyncClient, seed_user):
        resp = await client.post("/api/auth/forgot-password", json={
            "email": "tourist@test.com",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert data["type"] == "tourist"

    @pytest.mark.asyncio
    async def test_forgot_password_not_found(self, client: AsyncClient):
        resp = await client.post("/api/auth/forgot-password", json={
            "email": "nobody@test.com",
        })
        assert resp.status_code == 404


class TestHealthCheck:
    """GET /api/health"""

    @pytest.mark.asyncio
    async def test_health(self, client: AsyncClient):
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"
