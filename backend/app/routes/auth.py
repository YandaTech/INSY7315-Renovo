from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user, get_optional_user
from app.core.limiter import limiter
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db import get_db
from app.models.user import AdminUser

router = APIRouter(prefix="/auth", tags=["Authentication"])


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


class ProfileUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    email: str | None = Field(
        default=None, max_length=255, pattern=r"^$|^[^@\s]+@[^@\s]+\.[^@\s]+$"
    )


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_admin(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser | None = Depends(get_optional_user),
):
    """
    Create a staff account. Open only while no accounts exist (first-time
    setup); after that, only a logged-in staff member can add someone.
    """
    if current_user is None and db.query(AdminUser).first() is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sign up is closed. Ask a team member to add you.",
        )

    existing = (
        db.query(AdminUser).filter(AdminUser.username == user_in.username).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    hashed = get_password_hash(user_in.password)
    user = AdminUser(username=user_in.username, hashed_password=hashed)
    db.add(user)
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
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.username)

    is_production = settings.ENVIRONMENT.lower() == "production"
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response):
    """Clear the httpOnly authentication cookie."""
    response.delete_cookie(
        key="access_token",
        path="/",
        samesite="lax",
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: AdminUser = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_profile(
    profile: ProfileUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in profile.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value or None)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    change: PasswordChange,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(change.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    current_user.hashed_password = get_password_hash(change.new_password)
    db.commit()
