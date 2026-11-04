from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db import get_db
from app.models.user import AdminUser
from app.routes.auth import Role, UserOut, create_user

router = APIRouter(prefix="/users", tags=["Staff Management"])


class StaffCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: Role = "staff"


class StaffUpdate(BaseModel):
    role: Role | None = None
    is_active: bool | None = None


@router.get("/", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
):
    """Every account, active or not (Admin only)."""
    return db.query(AdminUser).order_by(AdminUser.username).all()


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def add_user(
    body: StaffCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
):
    """Add an account with a temporary password (Admin only)."""
    user = create_user(db, body.username, body.password, body.role)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    body: StaffUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
):
    """
    Change someone's role or deactivate / reactivate them (Admin only).

    Deactivation takes effect on that person's very next request, since
    every request checks the account. Admins cannot demote or deactivate
    themselves, so there is always at least one admin who can log in.
    """
    user = db.get(AdminUser, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    changes = body.model_dump(exclude_unset=True, exclude_none=True)
    if user.id == admin.id:
        if changes.get("role", "admin") != "admin":
            raise HTTPException(
                status_code=400, detail="You cannot remove your own admin role"
            )
        if changes.get("is_active", True) is False:
            raise HTTPException(
                status_code=400, detail="You cannot deactivate your own account"
            )

    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
