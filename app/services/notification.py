from typing import List
from app.models import IncidentResponse, LawyerProfile

class NotificationService:
    def dispatch_to_lawyers(self, incident: IncidentResponse, lawyers: List[LawyerProfile]) -> None:
        """
        Dispatches push notifications to the provided list of lawyers.
        This is currently a stub for Firebase Cloud Messaging (FCM) integration.
        """
        pass
