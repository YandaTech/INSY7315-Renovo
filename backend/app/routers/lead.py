from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.repositories.lead_repository import LeadRepository
from app.services.lead_service import LeadService

router = APIRouter(tags=["Leads"])

@router.post("/")
async def create_lead(name: str, contact: str, call_sid: str, job_details: dict, db: Session = Depends(get_db)):
    service = LeadService(db)
    return await service.create_lead_from_call(name=name, contact=contact, call_sid=call_sid, job_factors=job_details)

@router.get("/")
def list_leads(status: str | None = None, db: Session = Depends(get_db)):
    try:
        repo = LeadRepository(db)
        leads = repo.filter_leads(status=status)
        
        result = []
        for lead in leads:
            # Handle created_at safely whether it's a datetime object or a string
            created_at_str = None
            if lead.created_at:
                if hasattr(lead.created_at, "isoformat"):
                    created_at_str = lead.created_at.isoformat()
                else:
                    created_at_str = str(lead.created_at)

            result.append({
                "id": lead.id,
                "name": lead.name,
                "contact": lead.contact,
                "job_details": lead.job_details,
                "quote": lead.quote,
                "status": lead.status,
                "call_id": lead.call_id,
                "created_at": created_at_str
            })
        return result
    except Exception as e:
        # This will catch the exact error and display it in Swagger UI instead of a generic 500
        raise HTTPException(status_code=500, detail=f"Database or serialization error: {str(e)}")

@router.patch("/{lead_id}/status")
def update_lead_status(lead_id: int, status: str, db: Session = Depends(get_db)):
    repo = LeadRepository(db)
    updated = repo.update_lead_status(lead_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return updated