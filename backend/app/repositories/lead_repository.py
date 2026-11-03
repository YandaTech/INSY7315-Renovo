from sqlalchemy.orm import Session
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
        job_type: str | None = None,
        scope: str | None = None,
        urgency: str | None = None,
        materials_grade: str | None = None,
        travel_zone: str | None = None
    ) -> Lead:
        lead = Lead(
            name=name,
            contact=contact,
            job_details=job_details,
            quote=quote,
            status=status,
            call_id=call_id,
            job_type=job_type,
            scope=scope,
            urgency=urgency,
            materials_grade=materials_grade,
            travel_zone=travel_zone
        )

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
            self.db.commit() # Persist the status modification
            self.db.refresh(lead) # Refresh instance with the latest database state
        return lead

    def delete_lead(self, lead_id: int) -> bool:
        lead = self.db.query(Lead).filter(Lead.id == lead_id).first()
        if lead:
            self.db.delete(lead)
            self.db.commit()
            return True
        return False