from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, field_serializer
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db import get_db
from app.models.audit import AuditEvent
from app.models.user import AdminUser

# Read-only on purpose: the audit log is append-only, so there is no
# endpoint that edits or deletes an event.
router = APIRouter(prefix="/audit-events", tags=["Audit Log"])


class AuditEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    event: str
    actor_id: int | None = None
    actor_username: str | None = None
    ip_address: str | None = None
    target_type: str | None = None
    target_id: str | None = None
    details: dict[str, Any] | None = None

    @field_serializer("created_at")
    def as_utc(self, value: datetime) -> str:
        # Stored as UTC without tzinfo; say so, so browsers show local time
        return value.replace(tzinfo=timezone.utc).isoformat()


class AuditEventPage(BaseModel):
    total: int
    items: list[AuditEventOut]


def _as_naive_utc(value: datetime | None) -> datetime | None:
    if value is None or value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


@router.get("/", response_model=AuditEventPage)
def list_audit_events(
    actor_id: int | None = Query(default=None, description="Only this user's events"),
    start: datetime | None = Query(
        default=None, description="Events at or after this time (ISO 8601)"
    ),
    end: datetime | None = Query(
        default=None, description="Events before this time (ISO 8601)"
    ),
    event: str | None = Query(default=None, max_length=50),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
):
    """
    Security events, newest first (Admin only). Filter by user and by a
    time range; times without a timezone are taken as UTC.
    """
    start, end = _as_naive_utc(start), _as_naive_utc(end)
    if start and end and start >= end:
        raise HTTPException(status_code=422, detail="start must be before end")

    query = db.query(AuditEvent)
    if actor_id is not None:
        query = query.filter(AuditEvent.actor_id == actor_id)
    if start is not None:
        query = query.filter(AuditEvent.created_at >= start)
    if end is not None:
        query = query.filter(AuditEvent.created_at < end)
    if event:
        query = query.filter(AuditEvent.event == event)

    total = query.count()
    items = (
        query.order_by(AuditEvent.created_at.desc(), AuditEvent.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return {"total": total, "items": items}
