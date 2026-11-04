import secrets

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt import PyJWTError as JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import SESSION_COOKIE
from app.db import get_db
from app.models.user import AdminUser

optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def _extract_token_from_request(
    request: Request,
    header_token: str | None,
) -> str | None:
    """The session token, from the httpOnly cookie the dashboard sends or an
    Authorization: Bearer header (API clients and tests)."""
    if header_token:
        return header_token

    cookie_token = request.cookies.get(SESSION_COOKIE)
    if cookie_token:
        # Cookies set before this release held "Bearer <token>"
        cookie_token = cookie_token.strip('"')
        if cookie_token.startswith("Bearer "):
            return cookie_token.split(" ", 1)[1]
        return cookie_token

    return None


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    header_token: str | None = Depends(optional_oauth2_scheme),
) -> AdminUser:
    token = _extract_token_from_request(request, header_token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if user is None:
        raise credentials_exception
    return user


def get_optional_user(
    request: Request,
    db: Session = Depends(get_db),
    header_token: str | None = Depends(optional_oauth2_scheme),
) -> AdminUser | None:
    """
    Returns AdminUser if valid token/cookie is supplied, None if NO credentials
    were provided at all. Raises 401 if credentials WERE supplied but are invalid.
    """
    token = _extract_token_from_request(request, header_token)
    if not token:
        return None
    return get_current_user(request=request, db=db, header_token=token)


def require_admin_or_service(
    request: Request,
    db: Session = Depends(get_db),
    header_token: str | None = Depends(optional_oauth2_scheme),
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

    token = _extract_token_from_request(request, header_token)
    if token:
        return get_current_user(request=request, db=db, header_token=token).username

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Admin token or service key required",
        headers={"WWW-Authenticate": "Bearer"},
    )
