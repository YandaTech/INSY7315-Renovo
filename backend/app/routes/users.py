from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.core.security import MIN_PASSWORD_LENGTH
from app.core.validation import RowId
from app.db import get_db
from app.models.user import AdminUser
from app.routes.auth import Role, UserOut, create_user, set_password
from app.services.audit import record_event

router = APIRouter(prefix="/users", tags=["Staff Management"])


class StaffCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=MIN_PASSWORD_LENGTH)
    role: Role = "staff"


class PasswordReset(BaseModel):
    new_password: str = Field(..., min_length=MIN_PASSWORD_LENGTH)


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
    request: Request,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
):
    """Add an account with a temporary password (Admin only)."""
    user = create_user(db, body.username, body.password, body.role)
    record_event(
        db,
        request,
        "user_created",
        actor=admin,
        target_type="user",
        target_id=user.id,
        details={"username": user.username, "role": user.role},
    )
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: RowId,
    body: StaffUpdate,
    request: Request,
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

    target = {"target_type": "user", "target_id": user.id}
    if "role" in changes and changes["role"] != user.role:
        record_event(
            db,
            request,
            "user_role_changed",
            actor=admin,
            details={"username": user.username, "from": user.role, "to": body.role},
            **target,
        )
        user.role = changes["role"]
    if "is_active" in changes and changes["is_active"] != user.is_active:
        record_event(
            db,
            request,
            "user_reactivated" if changes["is_active"] else "user_deactivated",
            actor=admin,
            details={"username": user.username},
            **target,
        )
        user.is_active = changes["is_active"]
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(
    user_id: RowId,
    body: PasswordReset,
    request: Request,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
):
    """
    Set a new temporary password for someone else (Admin only).

    Every session that person has open ends at once, so this is also how
    to end a session that may have been stolen. Admins change their own
    password on the Profile page, which asks for the current one.
    """
    user = db.get(AdminUser, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(
            status_code=400,
            detail="Change your own password on your Profile page",
        )
    set_password(user, body.new_password)
    record_event(
        db,
        request,
        "password_reset",
        actor=admin,
        target_type="user",
        target_id=user.id,
        details={"username": user.username},
    )
    db.commit()
