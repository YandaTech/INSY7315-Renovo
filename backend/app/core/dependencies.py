import secrets
from datetime import timezone

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
    """The logged-in user. The account is loaded from the database on every
    request, so a deactivated account is refused at once, even with a token
    that has not expired, and the role used is always the current one (the
    role claim in the token is ignored). A token issued before the last
    password change or reset is refused too."""
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
    if user is None or not user.is_active:
        raise credentials_exception
    if not _issued_after_password_change(payload, user):
        raise credentials_exception
    return user


def _issued_after_password_change(payload: dict, user: AdminUser) -> bool:
    """False for a token issued before the account's password was last
    changed or reset: changing the password ends every older session."""
    changed_at = user.password_changed_at
    if changed_at is None:
        return True
    issued_at = payload.get("iat")
    if not isinstance(issued_at, (int, float)):
        return False
    return issued_at >= changed_at.replace(tzinfo=timezone.utc).timestamp()


def require_admin(current_user: AdminUser = Depends(get_current_user)) -> AdminUser:
    """A logged-in admin; staff get 403. Used for managing accounts, prices
    and reading the audit log."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only an admin can do this",
        )
    return current_user


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
    Allows any logged-in user, admin or staff (dashboard), or an internal
    service presenting SERVICE_API_KEY (voice-bridge). Returns who made the call.
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
