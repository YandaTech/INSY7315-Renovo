from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.call import CallLog
from fastapi import HTTPException, status


class CallRepository:
    """
    Repository layer handling database operations for CallLog entities.

    Encapsulates querying, creation, pagination, and status updates
    for telephony call logs.
    """

    def __init__(self, db: Session):
        """
        Initialize the repository with an active SQLAlchemy database session.

        :param db: Active SQLAlchemy Session instance.
        """
        self.db = db

    def create_call_log(
        self, call_sid: str, duration: int, transcript: str, outcome: str
    ) -> CallLog:
        """
        Create and persist a new CallLog entry in the database.

        Raises HTTP 400 Bad Request if a record with the given call_sid already exists.
        """
        # Check for pre-existing call log to prevent duplicate call_sid constraint violations
        existing_call = (
            self.db.query(CallLog).filter(CallLog.call_sid == call_sid).first()
        )
        if existing_call:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Call SID '{call_sid}' already exists.",
            )

        # Instantiate the new CallLog ORM object
        call = CallLog(
            call_sid=call_sid, duration=duration, transcript=transcript, outcome=outcome
        )

        # Stage, commit, and refresh the instance to populate DB-generated attributes (e.g., id, created_at)
        self.db.add(call)
        self.db.commit()
        self.db.refresh(call)
        return call

    def get_call_by_sid(self, call_sid: str) -> CallLog | None:
        """
        Retrieve a single CallLog by its unique telephony provider Call SID.

        :param call_sid: Unique provider SID string.
        :return: Matching CallLog instance or None if not found.
        """
        return self.db.query(CallLog).filter(CallLog.call_sid == call_sid).first()

    def get_all_calls(self, skip: int = 0, limit: int = 100) -> list[CallLog]:
        """
        Fetch a paginated list of all call logs, newest first.

        :param skip: Number of records to skip (offset).
        :param limit: Maximum number of records to return.
        :return: List of CallLog records.
        """
        return (
            self.db.query(CallLog)
            .order_by(CallLog.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_incomplete_calls(self) -> list[CallLog]:
        """
        Fetch all call logs where the outcome status is marked as 'incomplete'.

        :return: List of incomplete CallLog instances.
        """
        return self.db.query(CallLog).filter(CallLog.outcome == "incomplete").all()

    def flag_incomplete(self, call_sid: str) -> CallLog | None:
        """
        Update an existing call record's outcome status to 'incomplete'.

        :param call_sid: Unique identifier of the call to update.
        :return: The updated CallLog instance, or None if the record was not found.
        """
        call = self.get_call_by_sid(call_sid)
        if call:
            call.outcome = "incomplete"
            self.db.commit()  # Save status change to database
            self.db.refresh(call)  # Refresh instance with updated DB state
        return call
