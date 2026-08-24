from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User, Guide, Manager, Admin

security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[dict]:
    """Extract user from JWT if present, otherwise return None."""
    if credentials is None:
        return None

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None

    role = payload.get("role")
    entity_id = payload.get("sub")

    if role == "tourist":
        result = await db.execute(select(User).where(User.user_id == entity_id))
        user = result.scalar_one_or_none()
        if user:
            return {"role": "tourist", "id": user.user_id, "name": user.user_name, "email": user.user_email}
    elif role == "guide":
        result = await db.execute(select(Guide).where(Guide.guide_nid == entity_id))
        guide = result.scalar_one_or_none()
        if guide:
            return {"role": "guide", "id": guide.guide_nid, "name": guide.guide_name, "email": guide.guide_email}
    elif role == "manager":
        result = await db.execute(select(Manager).where(Manager.manager_id == entity_id))
        mgr = result.scalar_one_or_none()
        if mgr:
            return {"role": "manager", "id": mgr.manager_id, "name": mgr.manager_name, "email": mgr.manager_email}
    elif role == "admin":
        result = await db.execute(select(Admin).where(Admin.admin_id == entity_id))
        admin = result.scalar_one_or_none()
        if admin:
            return {"role": "admin", "id": admin.admin_id, "name": admin.admin_name, "email": admin.admin_email}

    return None


async def require_user(
    user: Optional[dict] = Depends(get_current_user_optional),
) -> dict:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


async def require_role(role: str):
    """Factory that returns a dependency requiring a specific role."""
    async def _check(user: dict = Depends(require_user)) -> dict:
        if user["role"] != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Requires role: {role}")
        return user
    return _check


async def require_admin(user: dict = Depends(require_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
