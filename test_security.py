"""Unit tests for app.core.security utilities."""

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    """Tests for hash_password and verify_password."""

    def test_hash_password_returns_string(self):
        hashed = hash_password("mypassword")
        assert isinstance(hashed, str)
        assert hashed != "mypassword"

    def test_verify_password_correct(self):
        plain = "securepass123"
        hashed = hash_password(plain)
        assert verify_password(plain, hashed) is True

    def test_verify_password_incorrect(self):
        hashed = hash_password("correct")
        assert verify_password("wrong", hashed) is False

    def test_different_hashes_for_same_input(self):
        """Bcrypt should produce different hashes due to random salt."""
        h1 = hash_password("same_password")
        h2 = hash_password("same_password")
        # They should both verify, but not be identical
        assert verify_password("same_password", h1)
        assert verify_password("same_password", h2)


class TestJWT:
    """Tests for create_access_token and decode_access_token."""

    def test_create_and_decode_token(self):
        payload = {"sub": "USR001", "role": "tourist"}
        token = create_access_token(payload)
        decoded = decode_access_token(token)
        assert decoded is not None
        assert decoded["sub"] == "USR001"
        assert decoded["role"] == "tourist"
        assert "exp" in decoded

    def test_decode_invalid_token(self):
        result = decode_access_token("totally.bogus.token")
        assert result is None

    def test_decode_empty_string(self):
        result = decode_access_token("")
        assert result is None

    def test_token_contains_expiration(self):
        token = create_access_token({"sub": "test"})
        decoded = decode_access_token(token)
        assert decoded is not None
        assert "exp" in decoded
