from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationRepository:
    """
    Repository layer for Notification database operations.
    """

    def __init__(self, db: Session):
        self.db = db

    def create_notification(
        self,
        type: str,
        recipient: str,
        message: str,
        status: str = "sent",
        subject: str | None = None,
        provider_id: str | None = None,
    ) -> Notification:
        notification = Notification(
            type=type,
            recipient=recipient,
            subject=subject,
            message=message,
            status=status,
            provider_id=provider_id,
        )

        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)

        return notification

    def get_all_notifications(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Notification]:
        return (
            self.db.query(Notification)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_by_type(self, type: str) -> int:
        return (
            self.db.query(Notification)
            .filter(
                Notification.type == type,
                Notification.status == "sent",
            )
            .count()
        )

    