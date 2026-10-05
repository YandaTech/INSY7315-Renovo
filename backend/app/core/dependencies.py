import secrets

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import AdminUser
from app.db import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> AdminUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if user is None:
        raise credentials_exception
    return user


def get_optional_user(
    db: Session = Depends(get_db),
    token: str | None = Depends(optional_oauth2_scheme),
) -> AdminUser | None:
    """The logged-in admin if a valid token was sent, otherwise None."""
    if not token:
        return None
    return get_current_user(db=db, token=token)


def require_admin_or_service(
    db: Session = Depends(get_db),
    token: str | None = Depends(optional_oauth2_scheme),
    x_service_key: str | None = Header(default=None),
) -> str:
    """
    Allows a logged-in admin (dashboard) or an internal service presenting
    SERVICE_API_KEY (voice-bridge). Returns who made the call.
    """
    if (
        x_service_key
        and settings.SERVICE_API_KEY
        and secrets.compare_digest(x_service_key, settings.SERVICE_API_KEY)
    ):
        return "service"

    if token:
        return get_current_user(db=db, token=token).username

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Admin token or service key required",
        headers={"WWW-Authenticate": "Bearer"},
    )
