import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.models import IncidentResponse

class TestIncidentAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    @patch('app.api.incidents.IncidentService')
    def test_create_incident_api_success(self, mock_service_class):
        mock_service_instance = mock_service_class.return_value

        mock_incident_response = IncidentResponse(
            incident_id='uuid-test-123',
            client_id='client-123',
            detainee_name='John Doe',
            latitude=-23.5505,
            longitude=-46.6333,
            geohash='6gyf4',
            status='PENDING',
            extracted_data={},
            created_at='2023-01-01T00:00:00Z'
        )
        mock_service_instance.create_incident.return_value = mock_incident_response

        payload = {
            "client_id": "client-123",
            "detainee_name": "John Doe",
            "detainee_cpf": "123.456.789-00",
            "latitude": -23.5505,
            "longitude": -46.6333,
            "document_base64": "base64encodeddocument==",
            "warrant_number": "12345-67.2023.8.26.0000"
        }

        response = self.client.post("/incidents", json=payload)

        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data['incident_id'], 'uuid-test-123')
        self.assertEqual(data['status'], 'PENDING')

        mock_service_instance.create_incident.assert_called_once()

    def test_create_incident_api_invalid_payload(self):
        payload = {
            "client_id": "client-123"
            # Missing fields
        }

        response = self.client.post("/incidents", json=payload)
        self.assertEqual(response.status_code, 422) # Unprocessable Entity
