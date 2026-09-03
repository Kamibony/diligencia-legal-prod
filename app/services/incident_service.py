from uuid import uuid4

from app.models import IncidentCreate, IncidentResponse
from app.repositories.incident_repo import IncidentRepository
from app.services.location import LocationService

class IncidentService:
    def __init__(self):
        self.repository = IncidentRepository()
        self.location_service = LocationService()

    def create_incident(self, payload: IncidentCreate) -> IncidentResponse:
        incident_id = str(uuid4())

        # Calculate geohash, though it isn't explicitly persisted in IncidentResponse model yet
        geohash = self.location_service.get_geohash(payload.latitude, payload.longitude, precision=6)

        # Create incident
        incident = self.repository.create_new_incident(
            incident_id=incident_id,
            payload=payload,
            geohash=geohash
        )

        return incident
