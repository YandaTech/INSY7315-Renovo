from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user, require_admin_or_service
from app.repositories.lead_repository import LeadRepository
from app.services.lead_service import LeadService
from app.models.user import AdminUser

router = APIRouter(tags=["Leads"])

@router.post("/")
async def create_lead(
    name: str, 
    contact: str, 
    call_sid: str, 
    job_details: dict, 
    quote: float | None = None,
    status: str = "new",
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin_or_service)
):
    service = LeadService(db)
    return await service.create_lead_from_call(
        name=name, 
        contact=contact, 
        call_sid=call_sid, 
        job_factors=job_details, 
        quote=quote, 
        status=status
    )

@router.get("/")
def list_leads(
    status: str | None = None, 
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user)
):
    repo = LeadRepository(db)
    leads = repo.filter_leads(status=status)
    
    result = []
    for lead in leads:
        created_at_str = None
        if lead.created_at:
            if hasattr(lead.created_at, "isoformat"):
                created_at_str = lead.created_at.isoformat()
            else:
                created_at_str = str(lead.created_at)

        # Safely resolve call_sid
        call_sid_val = None
        if hasattr(lead, "call") and lead.call:
            call_sid_val = lead.call.call_sid
        elif lead.call_id:
            from app.models.call import CallLog
            call_obj = db.query(CallLog).filter(CallLog.id == lead.call_id).first()
            if call_obj:
                call_sid_val = call_obj.call_sid

        result.append({
            "id": lead.id,
            "lead_id": lead.id,
            "name": lead.name,
            "contact": lead.contact,
            "job_details": lead.job_details,
            "quote": lead.quote,
            "status": lead.status,
            "call_id": lead.call_id,
            "call_sid": call_sid_val,
            "created_at": created_at_str
        })
    return result

@router.patch("/{lead_id}/status")
def update_lead_status(
    lead_id: int, 
    status: str, 
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user)
):
    repo = LeadRepository(db)
    updated = repo.update_lead_status(lead_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return updated