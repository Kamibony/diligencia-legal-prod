from uuid import uuid4

from app.models import IncidentCreate, IncidentResponse
from app.repositories.incident_repo import IncidentRepository
from app.repositories.lawyer_repo import LawyerRepository
from app.services.location import LocationService
from app.services.notification import NotificationService

class IncidentService:
    def __init__(self):
        self.repository = IncidentRepository()
        self.lawyer_repository = LawyerRepository()
        self.location_service = LocationService()
        self.notification_service = NotificationService()

    def create_incident(self, payload: IncidentCreate) -> IncidentResponse:
        incident_id = str(uuid4())

        # Calculate geohash
        geohash = self.location_service.get_geohash(payload.latitude, payload.longitude, precision=6)

        # Calculate geohash prefixes for querying at different zoom levels
        geohashes = [geohash[:i] for i in range(1, 7)]

        # Create incident
        incident = self.repository.create_new_incident(
            incident_id=incident_id,
            payload=payload,
            geohash=geohash,
            geohashes=geohashes
        )

        # Find available lawyers in a 10km radius
        # Typically you'd use a configurable radius
        search_radius_m = 10000
        bounding_geohashes = self.location_service.get_bounding_geohashes(
            payload.latitude, payload.longitude, radius_m=search_radius_m
        )

        available_lawyers = self.lawyer_repository.find_available_lawyers(bounding_geohashes)

        # Dispatch notifications
        if available_lawyers:
            self.notification_service.dispatch_to_lawyers(incident, available_lawyers)

        return incident

    def accept_incident(self, incident_id: str, lawyer_id: str) -> None:
        self.repository.accept_incident(incident_id, lawyer_id)

    def get_nearby_incidents(self, lat: float, lon: float, radius_m: float = 5000.0) -> list[IncidentResponse]:
        bounding_geohashes = self.location_service.get_bounding_geohashes(
            lat, lon, radius_m=radius_m
        )
        return self.repository.find_nearby_pending_incidents(bounding_geohashes)

    def get_lawyer_incidents(self, lawyer_id: str) -> list[IncidentResponse]:
        return self.repository.find_accepted_incidents_by_lawyer(lawyer_id)
