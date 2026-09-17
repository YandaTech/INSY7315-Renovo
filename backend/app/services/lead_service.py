from sqlalchemy.orm import Session
from app.repositories.lead_repository import LeadRepository
from app.repositories.call_repository import CallRepository
from app.services.pricing_service import PricingService

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

    async def create_lead_from_call(self, name: str, contact: str, call_sid: str, job_factors: dict) -> dict:
        """
        Orchestrates lead creation originating from a call log event.
        
        1. Looks up the associated CallLog using the provider SID.
        2. Asynchronously requests a pricing quote via the PricingService (MCP).
        3. Persists the new Lead entity to the database.
        4. Returns a response payload with core lead details.
        """
        # Look up matching call log to link foreign key relationship if present
        # Retrieve call details
        call = self.call_repo.get_call_by_sid(call_sid)
        call_id = call.id if call else None

        # Fetch external calculated quote estimation asynchronously
        mcp_response = await self.pricing_service.get_quote_from_mcp(job_factors)
        calculated_quote = mcp_response.get("estimated_quote", 0.0)

        # Persist new lead record via the lead repository
        lead = self.lead_repo.create_lead(
            name=name,
            contact=contact,
            job_details=str(job_factors),
            quote=calculated_quote,
            status="new",
            call_id=call_id
        )

        # Format and return a summary payload
        return {
            "lead_id": lead.id,
            "name": lead.name,
            "quote": lead.quote,
            "status": lead.status
        }

    def update_status(self, lead_id: int, status: str):
        """
        Updates the status of an existing lead by delegating to the lead repository.
        
        :param lead_id: Integer ID of the lead to update.
        :param status: New status string (e.g., "contacted", "closed").
        :return: Updated Lead object or None if not found.
        """
        return self.lead_repo.update_lead_status(lead_id, status)