from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.models.base import Base

from datetime import datetime, timezone


class Notification(Base):
    """
    Represents an SMS or email notification sent by Renovo.
    """

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    # "sms" or "email"
    type = Column(String(20), nullable=False, index=True)

    # Phone number or email address
    recipient = Column(String(255), nullable=False)

    # Used mainly for email notifications
    subject = Column(String(255), nullable=True)

    # Notification body
    message = Column(Text, nullable=False)

    # Usually "sent" or "failed"
    status = Column(String(50), nullable=False, default="sent", index=True)

    # Twilio Message SID, SendGrid message ID, etc.
    provider_id = Column(String(255), nullable=True)

    created_at = Column(
    DateTime,
    default=lambda: datetime.now(timezone.utc),
    nullable=False
)