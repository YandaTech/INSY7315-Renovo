from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.repositories.call_repository import CallRepository

router = APIRouter(tags=["Calls"])

@router.post("/")
def log_call(call_sid: str, duration: int = 0, transcript: str = "", outcome: str = "initiated", db: Session = Depends(get_db)):
    repo = CallRepository(db)
    return repo.create_call_log(call_sid=call_sid, duration=duration, transcript=transcript, outcome=outcome)

@router.get("/")
def list_calls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = CallRepository(db)
    return repo.get_all_calls(skip=skip, limit=limit)