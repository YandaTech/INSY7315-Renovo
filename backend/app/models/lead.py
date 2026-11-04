from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base

# The job factors a call (or Log a call) collects, stored as real columns so
# leads can be filtered and reported on. The keys match the pricing server's.
JOB_FIELDS = (
    "job_type",
    "quantity",
    "material",
    "damage_level",
    "travel_zone",
    "suburb",
)


class Lead(Base):
    """
    A customer lead from a call or a manually logged enquiry.

    Stores the contact details, the job factors, the quote and the lead's
    status, and links to the call log it came from if there was one.
    """

    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    contact = Column(String(50), nullable=False)

    # Job factors, e.g. job_type="bath_reenamel", travel_zone="northern_suburbs".
    # All optional: an incomplete call may end before every factor is known.
    job_type = Column(String(50), nullable=True, index=True)
    quantity = Column(Integer, nullable=True)
    material = Column(String(50), nullable=True)
    damage_level = Column(String(50), nullable=True)
    travel_zone = Column(String(50), nullable=True)
    suburb = Column(String(100), nullable=True)

    # The factors exactly as received, as a JSON string
    job_details = Column(Text, nullable=True)
    quote = Column(Float, nullable=True)
    status = Column(String(50), default="new")
    created_at = Column(DateTime, default=datetime.utcnow)

    call_id = Column(Integer, ForeignKey("call_logs.id"), nullable=True)
    call_log = relationship("CallLog", back_populates="leads")

    @property
    def call_sid(self) -> str | None:
        """Twilio SID of the originating call, if the lead came from one."""
        return self.call_log.call_sid if self.call_log else None
