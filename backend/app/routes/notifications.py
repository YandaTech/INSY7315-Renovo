from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin_or_service
from app.db import get_db
from app.models.user import AdminUser
from app.repositories.notification_repository import NotificationRepository
from app.schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])

NotificationType = Literal["sms", "email"]
NotificationStatus = Literal["sent", "failed"]


@router.post("/", response_model=NotificationOut)
def create_notification(
    type: NotificationType,
    recipient: str,
    message: str,
    status: NotificationStatus = "sent",
    subject: str | None = None,
    provider_id: str | None = None,
    db: Session = Depends(get_db),
    caller: str = Depends(require_admin_or_service),
):
    """
    Log an SMS or email notification in the database.
    Intended for trusted backend services such as the Voice Bridge.
    """
    repo = NotificationRepository(db)

    return repo.create_notification(
        type=type,
        recipient=recipient,
        subject=subject,
        message=message,
        status=status,
        provider_id=provider_id,
    )


@router.get("/", response_model=list[NotificationOut])
def list_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Return notification history for the dashboard.
    """
    return NotificationRepository(db).get_all_notifications(
        skip=skip,
        limit=limit,
    )


@router.get("/stats")
def notification_stats(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Return successful SMS and email counts for the Statistics page.
    """
    repo = NotificationRepository(db)

    return {
        "sms_sent": repo.count_by_type("sms"),
        "email_sent": repo.count_by_type("email"),
    }
