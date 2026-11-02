from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base


class CallLog(Base):
    """
    Represents a call log record in the database.

    Tracks Twilio/telephony call metrics, transcripts, and associations to leads.
    """

    # Name of the database table
    __tablename__ = "call_logs"

    # Primary key: Unique auto-incrementing integer ID for each log entry
    id = Column(Integer, primary_key=True, index=True)

    # Telephony provider's unique call identifier (e.g., Twilio Call SID)
    # Indexed and constrained to be unique for fast lookup and data integrity
    call_sid = Column(String(100), unique=True, nullable=False, index=True)

    # Duration of the call recorded in seconds (defaults to 0)
    duration = Column(Integer, default=0)

    # Full text transcript of the call conversation (optional)
    transcript = Column(Text, nullable=True)

    # Call status outcome (e.g., "completed", "incomplete", "failed")
    outcome = Column(
        String(50), nullable=True
    )  # e.g., "completed", "incomplete", "failed"

    # Timestamp when the record was created in the database (defaults to UTC time)
    created_at = Column(DateTime, default=datetime.utcnow)

    # ORM Relationship: Establishes a bidirectional link with the Lead model.
    # Enables accessing associated leads via `call_log_instance.leads`.
    leads = relationship("Lead", back_populates="call_log")
