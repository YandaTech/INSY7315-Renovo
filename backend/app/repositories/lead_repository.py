from sqlalchemy.orm import Session
from app.models.call import CallLog
from app.models.lead import Lead


class LeadRepository:
    """
    Repository layer handling database operations for Lead entities.

    Provides methods for creating, retrieving, dynamically filtering,
    and updating sales lead records.
    """

    def __init__(self, db: Session):
        """
        Initialize the repository with an active SQLAlchemy database session.

        :param db: Active SQLAlchemy Session instance.
        """
        self.db = db

    def create_lead(
        self,
        name: str,
        contact: str,
        job_details: str = "",
        quote: float = 0.0,
        status: str = "new",
        call_id: int | None = None,
    ) -> Lead:
        """
        Create and persist a new Lead record in the database.

        :param name: Full name or entity name of the lead.
        :param contact: Primary contact details (phone number or email).
        :param job_details: Optional description of the work requested.
        :param quote: Optional estimated monetary cost.
        :param status: Initial lifecycle status (defaults to "new").
        :param call_id: Optional foreign key ID linking to an associated CallLog.
        :return: The newly created Lead ORM instance.
        """
        # Instantiate the new Lead ORM object
        lead = Lead(
            name=name,
            contact=contact,
            job_details=job_details,
            quote=quote,
            status=status,
            call_id=call_id,
        )

        # Add to current transaction, save changes, and populate generated fields (e.g., id, created_at)
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get_lead_by_id(self, lead_id: int) -> Lead | None:
        """
        Fetch a single Lead record by its primary key ID.

        :param lead_id: The integer ID of the lead.
        :return: Matching Lead instance or None if not found.
        """
        return self.db.query(Lead).filter(Lead.id == lead_id).first()

    def filter_leads(
        self, status: str | None = None, skip: int = 0, limit: int = 100
    ) -> list[Lead]:
        """
        Fetch a paginated list of leads, with optional filtering by status.

        :param status: Optional lead status to filter by (e.g., "new", "contacted", "closed").
        :param skip: Number of records to offset for pagination.
        :param limit: Maximum number of records to return.
        :return: List of matching Lead records.
        """
        query = self.db.query(Lead)

        # Apply conditional status filter if specified
        if status:
            query = query.filter(Lead.status == status)

        # Newest first, then apply pagination offset/limit and execute query
        return query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()

    def update_lead_status(self, lead_id: int, new_status: str) -> Lead | None:
        """
        Update the status string for an existing Lead record.

        :param lead_id: Integer ID of the lead to update.
        :param new_status: New status string to assign.
        :return: The updated Lead instance, or None if no lead was found with lead_id.
        """
        lead = self.get_lead_by_id(lead_id)
        if lead:
            lead.status = new_status
            self.db.commit()  # Persist the status modification
            self.db.refresh(lead)  # Refresh instance with the latest database state
        return lead

    def delete_lead(self, lead_id: int) -> bool:
        """
        Delete a Lead record by ID, together with the call log (and its
        transcript) the lead came from.

        The call log is only removed when no other lead still links to it,
        so deleting one lead never strips another lead of its call record.
        Both deletes happen in one transaction.

        :param lead_id: Integer ID of the lead to delete.
        :return: True if a lead was deleted, False if none had that ID.
        """
        lead = self.get_lead_by_id(lead_id)
        if not lead:
            return False
        call_id = lead.call_id
        try:
            self.db.delete(lead)
            self.db.flush()
            if call_id is not None:
                still_linked = (
                    self.db.query(Lead).filter(Lead.call_id == call_id).count()
                )
                if not still_linked:
                    call = self.db.get(CallLog, call_id)
                    if call is not None:
                        self.db.delete(call)
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise
        return True
