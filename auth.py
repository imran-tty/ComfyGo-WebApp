from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, text

from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.models.models import User, Guide, Manager, Hotel, Admin
from app.schemas.schemas import (
    LoginRequest, TokenResponse, TouristSignupRequest,
    GuideSignupRequest, ManagerSignupRequest, ForgotPasswordRequest,
    PasswordResetRequest,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Login for tourist, guide, or manager. Checks tables sequentially like original PHP."""
    email = req.email.strip()
    password = req.password.strip()

    if not email or not password:
        raise HTTPException(status_code=400, detail="Please fill in all fields.")

    # Check Users (tourist)
    stmt = select(User).where(User.user_email == email).limit(1)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if user and verify_password(password, user.password):
        token = create_access_token({"sub": user.user_id, "role": "tourist", "name": user.user_name})
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,  # Set True in production with HTTPS
            samesite="lax",
            max_age=86400,
        )
        return TokenResponse(access_token=token, role="tourist", user_id=user.user_id, user_name=user.user_name)

    # Check Guide
    stmt = select(Guide).where(Guide.guide_email == email).limit(1)
    result = await db.execute(stmt)
    guide = result.scalar_one_or_none()
    if guide and verify_password(password, guide.password):
        token = create_access_token({"sub": guide.guide_nid, "role": "guide", "name": guide.guide_name})
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=86400,
        )
        return TokenResponse(access_token=token, role="guide", user_id=guide.guide_nid, user_name=guide.guide_name)

    # Check Manager
    stmt = select(Manager).where(Manager.manager_email == email).limit(1)
    result = await db.execute(stmt)
    manager = result.scalar_one_or_none()
    if manager and verify_password(password, manager.password):
        token = create_access_token({"sub": manager.manager_id, "role": "manager", "name": manager.manager_name})
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=86400,
        )
        return TokenResponse(access_token=token, role="manager", user_id=manager.manager_id, user_name=manager.manager_name)

    # Check Admin
    stmt = select(Admin).where(Admin.admin_email == email).limit(1)
    result = await db.execute(stmt)
    admin = result.scalar_one_or_none()
    if admin and verify_password(password, admin.password):
        token = create_access_token({"sub": admin.admin_id, "role": "admin", "name": admin.admin_name})
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=86400,
        )
        return TokenResponse(access_token=token, role="admin", user_id=admin.admin_id, user_name=admin.admin_name)

    raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")


@router.post("/signup/tourist", response_model=TokenResponse)
async def signup_tourist(req: TouristSignupRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Register a new tourist account."""
    if not req.user_id or not req.user_name or not req.user_email or not req.user_phone or not req.password:
        raise HTTPException(status_code=400, detail="Please fill in all fields.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    # Check uniqueness
    existing = await db.execute(
        select(User).where(or_(User.user_id == req.user_id, User.user_email == req.user_email)).limit(1)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User ID or email already exists.")

    user = User(
        user_id=req.user_id,
        user_email=req.user_email,
        user_name=req.user_name,
        user_phone=req.user_phone,
        password=hash_password(req.password),
    )
    db.add(user)
    await db.flush()

    token = create_access_token({"sub": user.user_id, "role": "tourist", "name": user.user_name})
    response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=86400)
    return TokenResponse(access_token=token, role="tourist", user_id=user.user_id, user_name=user.user_name)


@router.post("/signup/guide", response_model=TokenResponse)
async def signup_guide(req: GuideSignupRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Register a new guide account."""
    if not all([req.guide_nid, req.guide_name, req.guide_email, req.guide_mobile, req.guide_division, req.guide_district, req.password]):
        raise HTTPException(status_code=400, detail="Please fill in all fields.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    existing = await db.execute(
        select(Guide).where(or_(Guide.guide_nid == req.guide_nid, Guide.guide_email == req.guide_email)).limit(1)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="A guide with this NID or email already exists.")

    guide = Guide(
        guide_nid=req.guide_nid,
        guide_name=req.guide_name,
        guide_email=req.guide_email,
        guide_mobile=req.guide_mobile,
        guide_division=req.guide_division,
        guide_district=req.guide_district,
        guide_rate=0,
        password=hash_password(req.password),
    )
    db.add(guide)
    await db.flush()

    token = create_access_token({"sub": guide.guide_nid, "role": "guide", "name": guide.guide_name})
    response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=86400)
    return TokenResponse(access_token=token, role="guide", user_id=guide.guide_nid, user_name=guide.guide_name)


@router.post("/signup/manager", response_model=TokenResponse)
async def signup_manager(req: ManagerSignupRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Register a new hotel manager account. Requires valid hotel registration number."""
    if not all([req.manager_id, req.manager_name, req.manager_email, req.manager_mobile, req.hotel_registration_number, req.password]):
        raise HTTPException(status_code=400, detail="Please fill in all fields.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    existing = await db.execute(
        select(Manager).where(or_(Manager.manager_id == req.manager_id, Manager.manager_email == req.manager_email)).limit(1)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Manager ID or email already exists.")

    hotel_check = await db.execute(
        select(Hotel).where(Hotel.hotel_registration_number == req.hotel_registration_number).limit(1)
    )
    if not hotel_check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Hotel registration number not found.")

    mgr = Manager(
        manager_id=req.manager_id,
        manager_name=req.manager_name,
        manager_email=req.manager_email,
        manager_mobile=req.manager_mobile,
        hotel_registration_number=req.hotel_registration_number,
        password=hash_password(req.password),
    )
    db.add(mgr)
    await db.flush()

    token = create_access_token({"sub": mgr.manager_id, "role": "manager", "name": mgr.manager_name})
    response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=86400)
    return TokenResponse(access_token=token, role="manager", user_id=mgr.manager_id, user_name=mgr.manager_name)


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Verify email exists across all user tables and return a reset token."""
    email = req.email.strip()
    if not email:
        raise HTTPException(status_code=400, detail="Please enter your email address.")

    # Check across all tables (matching original UNION query)
    user_result = await db.execute(select(User).where(User.user_email == email).limit(1))
    user = user_result.scalar_one_or_none()
    if user:
        reset_token = create_access_token({"sub": user.user_id, "role": "tourist", "purpose": "reset"}, timedelta(hours=1))
        return {"message": "Email verified. You can now reset your password.", "token": reset_token, "type": "tourist"}

    guide_result = await db.execute(select(Guide).where(Guide.guide_email == email).limit(1))
    guide = guide_result.scalar_one_or_none()
    if guide:
        reset_token = create_access_token({"sub": guide.guide_nid, "role": "guide", "purpose": "reset"}, timedelta(hours=1))
        return {"message": "Email verified. You can now reset your password.", "token": reset_token, "type": "guide"}

    mgr_result = await db.execute(select(Manager).where(Manager.manager_email == email).limit(1))
    mgr = mgr_result.scalar_one_or_none()
    if mgr:
        reset_token = create_access_token({"sub": mgr.manager_id, "role": "manager", "purpose": "reset"}, timedelta(hours=1))
        return {"message": "Email verified. You can now reset your password.", "token": reset_token, "type": "manager"}

    raise HTTPException(status_code=404, detail="No account found with this email address.")


@router.post("/reset-password")
async def reset_password(req: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using token from forgot-password."""
    from app.core.security import decode_access_token

    payload = decode_access_token(req.token)
    if not payload or payload.get("purpose") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    role = payload["role"]
    entity_id = payload["sub"]
    hashed = hash_password(req.new_password)

    if role == "tourist":
        stmt = select(User).where(User.user_id == entity_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if user:
            user.password = hashed
    elif role == "guide":
        stmt = select(Guide).where(Guide.guide_nid == entity_id)
        result = await db.execute(stmt)
        guide = result.scalar_one_or_none()
        if guide:
            guide.password = hashed
    elif role == "manager":
        stmt = select(Manager).where(Manager.manager_id == entity_id)
        result = await db.execute(stmt)
        mgr = result.scalar_one_or_none()
        if mgr:
            mgr.password = hashed

    return {"message": "Your password has been successfully reset. You can now log in with your new password."}


@router.post("/logout")
async def logout(response: Response):
    """Clear auth cookie."""
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}
