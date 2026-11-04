from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin_or_service
from app.db import get_db
from app.models.user import AdminUser
from app.repositories.call_repository import CallRepository
from app.schemas import CallCreate

router = APIRouter(prefix="/calls", tags=["Call Operations"])


@router.post("/")
def log_call(
    call: CallCreate,
    db: Session = Depends(get_db),
    caller: str = Depends(require_admin_or_service),
):
    """
    Record a new telephony call log in the database (Admin or service key).
    """
    repo = CallRepository(db)
    return repo.create_call_log(
        call_sid=call.call_sid,
        duration=call.duration,
        transcript=call.transcript,
        outcome=call.outcome,
    )


@router.get("/")
def list_calls(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Retrieve a paginated list of call logs (Protected).
    """
    repo = CallRepository(db)
    return repo.get_all_calls(skip=skip, limit=limit)


@router.get("/{call_sid}")
def get_call(
    call_sid: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Retrieve a single call log, including its transcript (Protected).
    """
    call = CallRepository(db).get_call_by_sid(call_sid)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call
