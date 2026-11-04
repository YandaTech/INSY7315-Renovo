"""Write security events to the append-only audit log.

Call record_event() in the same session as the change it describes; the
caller commits, so the change and its event are saved together.
"""

from typing import Any

from fastapi import Request
from sqlalchemy.orm import Session

from app.core.limiter import client_ip
from app.models.audit import AuditEvent
from app.models.user import AdminUser

# Detail keys that would mean a secret or personal data was about to be
# logged. Events describe what happened, never the sensitive values.
FORBIDDEN_DETAIL_KEYS = (
    "password",
    "token",
    "secret",
    "hash",
    "contact",
    "phone",
    "transcript",
    "email",
)


def _check_details(details: dict[str, Any] | None) -> None:
    if not details:
        return
    for key, value in details.items():
        lowered = key.lower()
        if any(word in lowered for word in FORBIDDEN_DETAIL_KEYS):
            raise ValueError(f"Audit details must not include {key!r}")
        if isinstance(value, dict):
            _check_details(value)


def record_event(
    db: Session,
    request: Request | None,
    event: str,
    actor: AdminUser | None = None,
    target_type: str | None = None,
    target_id: Any = None,
    details: dict[str, Any] | None = None,
) -> AuditEvent:
    """Add an event to the session (not committed)."""
    _check_details(details)
    entry = AuditEvent(
        event=event,
        actor_id=actor.id if actor else None,
        actor_username=actor.username if actor else None,
        ip_address=client_ip(request)[:45] if request else None,
        target_type=target_type,
        target_id=None if target_id is None else str(target_id),
        details=details or None,
    )
    db.add(entry)
    return entry
