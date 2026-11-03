from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin_or_service
from app.db import get_db
from app.models.user import AdminUser
from app.repositories.lead_repository import LeadRepository
from app.schemas import LeadCreate, LeadOut, LeadStatus
from app.services.lead_service import LeadService

router = APIRouter(prefix="/leads", tags=["Lead Management"])


@router.post("/")
async def create_lead(
    lead: LeadCreate,
    db: Session = Depends(get_db),
    caller: str = Depends(require_admin_or_service),
):
    """
    Orchestrate lead creation from a call event or a manual log
    (Admin or service key).

    Pass `quote` when one was already given on the call; otherwise the
    pricing server is asked for one from `job_details`.
    """
    service = LeadService(db)
    return await service.create_lead_from_call(
        name=lead.name,
        contact=lead.contact,
        call_sid=lead.call_sid,
        job_factors=lead.job_details,
        quote=lead.quote,
        status=lead.status,
    )


@router.get("/", response_model=list[LeadOut])
def list_leads(
    status: LeadStatus | None = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Retrieve leads with optional filtering by status (Protected).
    """
    repo = LeadRepository(db)
    return repo.filter_leads(status=status)


@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Retrieve a single lead by ID (Protected).
    """
    lead = LeadRepository(db).get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/{lead_id}/status")
def update_lead_status(
    lead_id: int,
    status: LeadStatus,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Update the lifecycle status of a lead by ID (Protected).
    """
    repo = LeadRepository(db)
    updated = repo.update_lead_status(lead_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return updated


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Permanently delete a lead by ID (Protected), along with the call log
    and transcript it came from unless another lead still uses that call.
    """
    if not LeadRepository(db).delete_lead(lead_id):
        raise HTTPException(status_code=404, detail="Lead not found")
