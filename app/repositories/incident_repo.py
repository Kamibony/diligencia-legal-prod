from datetime import datetime, timezone
from app.repositories.base import BaseRepository
from app.models import IncidentResponse

class IncidentRepository(BaseRepository[IncidentResponse]):
    def __init__(self):
        super().__init__(collection_name="incidents", model=IncidentResponse)

    def create_new_incident(self, incident_id: str, client_id: str) -> IncidentResponse:
        """
        Creates a new incident document enforcing 'PENDING' status.
        """
        incident_data = IncidentResponse(
            incident_id=incident_id,
            client_id=client_id,
            lawyer_id=None,
            status="PENDING",
            extracted_data={},
            created_at=datetime.now(timezone.utc)
        )
        return super().create(document_id=incident_id, data=incident_data)
