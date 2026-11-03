import json

from sqlalchemy.orm import Session
from app.repositories.lead_repository import LeadRepository
from app.repositories.call_repository import CallRepository
from app.services.pricing_service import PricingService, PricingUnavailable


class LeadService:
    """
    Business logic and orchestration layer for managing leads.

    Coordinates data access repositories (LeadRepository, CallRepository)
    and external integrations (PricingService) to process lead workflows.
    """

    def __init__(self, db: Session):
        """
        Initialize the service with required repository and integration instances.

        :param db: Active SQLAlchemy database session passed to repositories.
        """
        self.lead_repo = LeadRepository(db)
        self.call_repo = CallRepository(db)
        self.pricing_service = PricingService()

    async def create_lead_from_call(
        self,
        name: str,
        contact: str,
        call_sid: str,
        job_factors: dict,
        quote: float | None = None,
        status: str = "new",
    ) -> dict:
        """
        Orchestrates lead creation originating from a call log event.

        1. Looks up the associated CallLog using the provider SID.
        2. Uses the supplied quote, or requests one via the PricingService (MCP)
           when the caller didn't already get one (e.g. the AI agent quoted
           live on the call, or staff typed one in when logging manually).
        3. Persists the new Lead entity to the database.
        4. Returns a response payload with core lead details.
        """
        # Look up matching call log to link foreign key relationship if present
        # Retrieve call details
        call = self.call_repo.get_call_by_sid(call_sid)
        call_id = call.id if call else None

        # An incomplete call ended before a quote, so the lead stays unquoted:
        # pricing it now would record a figure the caller never heard.
        if quote is None and status != "incomplete":
            quote = await self._price(job_factors)

        # Persist new lead record via the lead repository
        lead = self.lead_repo.create_lead(
            name=name,
            contact=contact,
            job_details=json.dumps(job_factors),
            quote=quote,
            status=status,
            call_id=call_id,
        )

        # Format and return a summary payload
        return {
            "id": lead.id,
            "lead_id": lead.id,
            "name": lead.name,
            "contact": lead.contact,
            "job_details": lead.job_details,
            "quote": lead.quote,
            "status": lead.status,
            "call_id": lead.call_id,
        }

    async def _price(self, job_factors: dict) -> float | None:
        """Asks the pricing server for a quote. Returns None (the lead is saved
        with no quote, shown as pending) when pricing fails, never 0."""
        try:
            response = await self.pricing_service.get_quote_from_mcp(job_factors)
        except PricingUnavailable:
            return None
        if response.get("status") != "ok":
            return None
        return response.get("estimated_quote")

    def update_status(self, lead_id: int, status: str):
        """
        Updates the status of an existing lead by delegating to the lead repository.

        :param lead_id: Integer ID of the lead to update.
        :param status: New status string (e.g., "contacted", "closed").
        :return: Updated Lead object or None if not found.
        """
        return self.lead_repo.update_lead_status(lead_id, status)
