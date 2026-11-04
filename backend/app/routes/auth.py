from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_optional_user
from app.core.limiter import limiter
from app.core.security import (
    clear_session_cookie,
    create_access_token,
    get_password_hash,
    set_session_cookie,
    verify_password,
)
from app.db import get_db
from app.models.user import AdminUser
from app.services.audit import record_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

Role = Literal["admin", "staff"]


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    role: Role
    is_active: bool


class ProfileUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    email: str | None = Field(
        default=None, max_length=255, pattern=r"^$|^[^@\s]+@[^@\s]+\.[^@\s]+$"
    )


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


def create_user(db: Session, username: str, password: str, role: Role) -> AdminUser:
    """Add an account (the caller commits). 400 if the username is taken."""
    if db.query(AdminUser).filter(AdminUser.username == username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    user = AdminUser(
        username=username,
        hashed_password=get_password_hash(password),
        role=role,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_admin(
    user_in: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: AdminUser | None = Depends(get_optional_user),
):
    """
    First-time setup: while no accounts exist anyone may create one, and it
    becomes the first admin. After that sign-up is closed; an admin can
    still add a staff account here, but the Staff page uses POST /users.
    """
    first_account = db.query(AdminUser).first() is None
    if not first_account:
        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sign up is closed. Ask an admin to add you.",
            )
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only an admin can do this",
            )

    user = create_user(
        db,
        user_in.username,
        user_in.password,
        role="admin" if first_account else "staff",
    )
    record_event(
        db,
        request,
        "user_created",
        actor=user if first_account else current_user,
        target_type="user",
        target_id=user.id,
        details={"username": user.username, "role": user.role},
    )
    db.commit()
    db.refresh(user)
    return user


@router.get("/registration-open")
def registration_open(db: Session = Depends(get_db)):
    """Whether anyone may sign up (true only before the first account exists)."""
    return {"open": db.query(AdminUser).first() is None}


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(AdminUser).filter(AdminUser.username == form_data.username).first()
    valid = user is not None and verify_password(
        form_data.password, user.hashed_password
    )
    # A deactivated account gets the same answer as a wrong password
    if not valid or not user.is_active:
        # The typed username is only logged when it is a real account: a
        # password typed into the username box must never reach the log.
        reason = (
            "unknown_user" if user is None else "inactive" if valid else "bad_password"
        )
        record_event(
            db, request, "login_failed", actor=user, details={"reason": reason}
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.username, role=user.role)
    set_session_cookie(response, access_token)
    record_event(db, request, "login_succeeded", actor=user)
    db.commit()

    # The dashboard relies on the cookie and ignores this; the token is
    # still returned for API clients such as the /docs "Authorize" button.
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    """End the browser session by clearing the session cookie. Always
    succeeds, even when the session had already expired."""
    try:
        user = get_optional_user(request=request, db=db, header_token=None)
    except HTTPException:
        user = None
    if user is not None:
        record_event(db, request, "logout", actor=user)
        db.commit()
    clear_session_cookie(response)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: AdminUser = Depends(get_current_user)):
    """Who is logged in. The dashboard calls this on load to restore the
    session from the cookie."""
    return current_user


@router.patch("/me", response_model=UserOut)
def update_profile(
    profile: ProfileUpdate,
    request: Request,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    changed = []
    for field, value in profile.model_dump(exclude_unset=True).items():
        if getattr(current_user, field) != (value or None):
            changed.append(field)
        setattr(current_user, field, value or None)
    if changed:
        # Which fields changed, not their values (names and email are
        # personal data)
        record_event(
            db,
            request,
            "profile_updated",
            actor=current_user,
            target_type="user",
            target_id=current_user.id,
            details={"fields": sorted(changed)},
        )
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    change: PasswordChange,
    request: Request,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target = {"target_type": "user", "target_id": current_user.id}
    if not verify_password(change.current_password, current_user.hashed_password):
        record_event(
            db, request, "password_change_failed", actor=current_user, **target
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    current_user.hashed_password = get_password_hash(change.new_password)
    record_event(db, request, "password_changed", actor=current_user, **target)
    db.commit()
