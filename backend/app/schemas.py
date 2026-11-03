from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

LeadStatus = Literal["new", "contacted", "confirmed", "closed", "incomplete"]


class CallCreate(BaseModel):
    """A call log sent by the voice-bridge (or an admin) in the request body,
    so the caller's transcript never appears in a URL."""

    call_sid: str = Field(min_length=1, max_length=100)
    duration: int = Field(default=0, ge=0)
    transcript: str = ""
    outcome: str = Field(default="initiated", max_length=50)


class LeadCreate(BaseModel):
    """A new lead sent in the request body, so names and phone numbers never
    appear in a URL. Leave `quote` out to have the pricing server price the
    job from `job_details`."""

    name: str = Field(min_length=1, max_length=100)
    contact: str = Field(min_length=1, max_length=50)
    call_sid: str = Field(min_length=1, max_length=100)
    job_details: dict[str, Any] = Field(default_factory=dict)
    quote: float | None = Field(default=None, ge=0)
    status: LeadStatus = "new"


class LeadOut(BaseModel):
    """A lead as the dashboard sees it, including the Twilio SID of the call
    it came from so the lead detail panel can load that call's transcript."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    contact: str
    job_details: str | None = None
    job_type: str | None = None
    quantity: int | None = None
    material: str | None = None
    damage_level: str | None = None
    travel_zone: str | None = None
    suburb: str | None = None
    quote: float | None = None
    status: str
    created_at: datetime
    call_id: int | None = None
    call_sid: str | None = None


class NotificationCreate(BaseModel):
    """A sent (or failed) SMS or email, logged by the voice-bridge in the
    request body so phone numbers and quote text never appear in a URL."""

    type: Literal["sms", "email"]
    recipient: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)
    status: Literal["sent", "failed"] = "sent"
    subject: str | None = Field(default=None, max_length=255)
    provider_id: str | None = Field(default=None, max_length=255)


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
