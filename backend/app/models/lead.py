from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base


class Lead(Base):
    """
    Represents a sales or customer lead in the database.

    Stores client contact details, quote estimates, lead lifecycle status,
    and links directly to an associated call log record if available.
    """

    # Database table name
    __tablename__ = "leads"

    # Primary key: Unique auto-incrementing integer identifier for each lead
    id = Column(Integer, primary_key=True, index=True)

    # Full name or business name of the lead (required)
    name = Column(String(100), nullable=False)

    # Primary contact info such as phone number or email address (required)
    contact = Column(String(50), nullable=False)

    # Detailed description of the job or customer request (optional)
    job_details = Column(Text, nullable=True)

    # Estimated cost or price quote assigned to the lead (optional)
    quote = Column(Float, nullable=True)

    # Lifecycle stage of the lead (defaults to "new", e.g., "new", "contacted", "closed")
    status = Column(String(50), default="new")  # e.g., "new", "contacted", "closed"

    # Timestamp when the lead record was created (defaults to UTC time)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign Key: References the 'id' column in the 'call_logs' table (optional link)
    call_id = Column(Integer, ForeignKey("call_logs.id"), nullable=True)

    # ORM Relationship: Connects to the CallLog instance and links back to `CallLog.leads`
    call_log = relationship("CallLog", back_populates="leads")
