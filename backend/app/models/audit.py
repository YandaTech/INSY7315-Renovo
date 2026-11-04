from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, event

from app.models.base import Base


def utc_now() -> datetime:
    """The current time in UTC, without tzinfo (stored the same way on SQLite
    and PostgreSQL)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class AuditEvent(Base):
    """
    One security-relevant action: who did it, when, from which IP, and to
    what. The log is append-only: rows are only ever inserted. The ORM
    refuses updates and deletes (below), the database refuses them too
    (triggers in migration 0004_audit_events), and the API has no endpoint
    that changes or removes an event.

    Events never hold passwords, tokens, phone numbers or call transcripts;
    app/services/audit.py rejects details that look like them.
    """

    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True)
    # When it happened, in UTC
    created_at = Column(DateTime, nullable=False, default=utc_now, index=True)
    # What happened, e.g. "login_failed" or "lead_deleted"
    event = Column(String(50), nullable=False, index=True)

    # Who did it. actor_username is copied in so the event still reads
    # correctly if the account is renamed; both are empty for an unknown
    # user (e.g. a failed login with a username that does not exist).
    actor_id = Column(Integer, ForeignKey("admin_users.id"), nullable=True, index=True)
    actor_username = Column(String(50), nullable=True)

    # The client IP (the real visitor, see app/core/limiter.py)
    ip_address = Column(String(45), nullable=True)

    # What it was done to, e.g. ("user", "4") or ("lead", "12")
    target_type = Column(String(30), nullable=True)
    target_id = Column(String(50), nullable=True)

    # Small, non-sensitive facts, e.g. {"from": "staff", "to": "admin"}
    details = Column(JSON, nullable=True)


class AuditLogIsAppendOnly(Exception):
    pass


@event.listens_for(AuditEvent, "before_update")
def _refuse_update(mapper, connection, target):
    raise AuditLogIsAppendOnly("Audit events cannot be changed")


@event.listens_for(AuditEvent, "before_delete")
def _refuse_delete(mapper, connection, target):
    raise AuditLogIsAppendOnly("Audit events cannot be deleted")
