import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.models import IncidentResponse
from app.repositories.incident_repo import IncidentAlreadyAcceptedError

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

    @patch('app.api.incidents.IncidentService')
    def test_accept_incident_success(self, mock_service_class):
        mock_service_instance = mock_service_class.return_value
        mock_service_instance.accept_incident.return_value = None

        payload = {"lawyer_id": "lawyer-123"}
        response = self.client.post("/incidents/test-incident-id/accept", json=payload)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "success", "message": "Incident accepted"})
        mock_service_instance.accept_incident.assert_called_once_with("test-incident-id", "lawyer-123")

    @patch('app.api.incidents.IncidentService')
    def test_accept_incident_conflict(self, mock_service_class):
        mock_service_instance = mock_service_class.return_value
        mock_service_instance.accept_incident.side_effect = IncidentAlreadyAcceptedError("Incident is not pending")

        payload = {"lawyer_id": "lawyer-123"}
        response = self.client.post("/incidents/test-incident-id/accept", json=payload)

        self.assertEqual(response.status_code, 409)
        self.assertIn("detail", response.json())
        mock_service_instance.accept_incident.assert_called_once_with("test-incident-id", "lawyer-123")

    @patch('app.api.incidents.IncidentService')
    def test_get_nearby_incidents_success(self, mock_service_class):
        mock_service_instance = mock_service_class.return_value

        mock_incident = IncidentResponse(
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
        mock_service_instance.get_nearby_incidents.return_value = [mock_incident]

        response = self.client.get("/incidents/nearby?lat=-23.5&lon=-46.6&radius=3000")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['incident_id'], 'uuid-test-123')

        mock_service_instance.get_nearby_incidents.assert_called_once_with(lat=-23.5, lon=-46.6, radius_m=3000.0)

    @patch('app.api.incidents.IncidentService')
    def test_get_nearby_incidents_default_radius(self, mock_service_class):
        mock_service_instance = mock_service_class.return_value
        mock_service_instance.get_nearby_incidents.return_value = []

        response = self.client.get("/incidents/nearby?lat=-23.5&lon=-46.6")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 0)

        mock_service_instance.get_nearby_incidents.assert_called_once_with(lat=-23.5, lon=-46.6, radius_m=5000.0)

    def test_get_nearby_incidents_missing_params(self):
        response = self.client.get("/incidents/nearby?lat=-23.5")
        self.assertEqual(response.status_code, 422) # Unprocessable Entity
