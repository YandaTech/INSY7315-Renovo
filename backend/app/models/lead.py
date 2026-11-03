from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    contact = Column(String(50), nullable=False)
    
    # Structured job factors (made nullable=True to prevent 500 errors on existing records)
    job_type = Column(String, nullable=True)
    scope = Column(String, nullable=True)
    urgency = Column(String, nullable=True)
    materials_grade = Column(String, nullable=True)
    travel_zone = Column(String, nullable=True)

    job_details = Column(Text, nullable=True)
    quote = Column(Float, nullable=True)
    status = Column(String(50), default="new")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    call_id = Column(Integer, ForeignKey("call_logs.id"), nullable=True)
    call_log = relationship("CallLog", back_populates="leads")

    @property
    def call_sid(self) -> str | None:
        """Safely expose call_sid from the related CallLog if it exists."""
        if self.call_log:
            return self.call_log.call_sid
        return None
