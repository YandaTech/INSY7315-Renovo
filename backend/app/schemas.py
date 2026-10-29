from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LeadOut(BaseModel):
    """A lead as the dashboard sees it, including the Twilio SID of the call
    it came from so the lead detail panel can load that call's transcript."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    contact: str
    job_details: str | None = None
    quote: float | None = None
    status: str
    created_at: datetime
    call_id: int | None = None
    call_sid: str | None = None

class NotificationOut(BaseModel):
    """Notification record returned to the dashboard/statistics UI."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    recipient: str
    subject: str | None = None
    message: str
    status: str
    provider_id: str | None = None
    created_at: datetime
    