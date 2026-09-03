import unittest
from unittest.mock import patch, MagicMock

from app.models import IncidentCreate, IncidentResponse
from app.services.incident_service import IncidentService

class TestIncidentService(unittest.TestCase):
    @patch('app.services.incident_service.uuid4')
    @patch('app.services.incident_service.LocationService')
    @patch('app.services.incident_service.IncidentRepository')
    def test_create_incident(self, mock_repo_class, mock_location_service, mock_uuid):
        # Mock UUID
        mock_uuid.return_value = 'test-uuid'

        # Mock Geohash
        mock_location_instance = mock_location_service.return_value
        mock_location_instance.get_geohash.return_value = 'geohash123'

        # Mock Repo Instance and Return Value
        mock_repo_instance = mock_repo_class.return_value

        mock_incident_response = MagicMock(spec=IncidentResponse)
        mock_incident_response.incident_id = 'test-uuid'
        mock_incident_response.client_id = 'client-1'
        mock_incident_response.status = 'PENDING'
        mock_repo_instance.create_new_incident.return_value = mock_incident_response

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
        # we mocked the LocationService class, so self.location_service is mock_location_service.return_value
        mock_location_instance = mock_location_service.return_value
        mock_location_instance.get_geohash.assert_called_once_with(-23.5505, -46.6333, precision=6)

        mock_repo_instance.create_new_incident.assert_called_once_with(
            incident_id='test-uuid',
            payload=payload,
            geohash='geohash123'
        )

        self.assertEqual(result, mock_incident_response)
