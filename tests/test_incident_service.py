import unittest
from unittest.mock import patch, MagicMock

from app.models import IncidentCreate, IncidentResponse
from app.services.incident_service import IncidentService

class TestIncidentService(unittest.TestCase):
    @patch('app.services.incident_service.uuid4')
    @patch('app.services.incident_service.LocationService')
    @patch('app.services.incident_service.IncidentRepository')
    @patch('app.services.incident_service.LawyerRepository')
    @patch('app.services.incident_service.NotificationService')
    def test_create_incident(self, mock_notification_class, mock_lawyer_repo_class, mock_incident_repo_class, mock_location_service, mock_uuid):
        # Mock UUID
        mock_uuid.return_value = 'test-uuid'

        # Mock LocationService
        mock_location_instance = mock_location_service.return_value
        mock_location_instance.get_geohash.return_value = 'geohash123'
        mock_location_instance.get_bounding_geohashes.return_value = ['geohash123', 'geohash124']

        # Mock IncidentRepository
        mock_incident_repo_instance = mock_incident_repo_class.return_value
        mock_incident_response = MagicMock(spec=IncidentResponse)
        mock_incident_response.incident_id = 'test-uuid'
        mock_incident_response.client_id = 'client-1'
        mock_incident_response.status = 'PENDING'
        mock_incident_repo_instance.create_new_incident.return_value = mock_incident_response

        # Mock LawyerRepository
        mock_lawyer_repo_instance = mock_lawyer_repo_class.return_value
        mock_lawyer_profile = MagicMock()
        mock_lawyer_repo_instance.find_available_lawyers.return_value = [mock_lawyer_profile]

        # Mock NotificationService
        mock_notification_instance = mock_notification_class.return_value

        # Payload
        payload = IncidentCreate(
            client_id='client-1',
            detainee_name='Jane Doe',
            latitude=-23.5505,
            longitude=-46.6333,
            document_base64='base64data'
        )

        service = IncidentService()
        result = service.create_incident(payload)

        # Asserts
        mock_location_instance.get_geohash.assert_called_once_with(-23.5505, -46.6333, precision=6)
        mock_location_instance.get_bounding_geohashes.assert_called_once_with(-23.5505, -46.6333, radius_m=10000)

        mock_incident_repo_instance.create_new_incident.assert_called_once_with(
            incident_id='test-uuid',
            payload=payload,
            geohash='geohash123'
        )

        mock_lawyer_repo_instance.find_available_lawyers.assert_called_once_with(['geohash123', 'geohash124'])
        mock_notification_instance.dispatch_to_lawyers.assert_called_once_with(mock_incident_response, [mock_lawyer_profile])

        self.assertEqual(result, mock_incident_response)
