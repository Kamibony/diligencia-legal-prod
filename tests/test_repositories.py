import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime

# Assuming the incident repo will be placed here
from app.repositories.incident_repo import IncidentRepository
from app.models import IncidentResponse

class TestIncidentRepository(unittest.TestCase):
    @patch('app.repositories.base.get_db')
    def test_create_incident_enforces_pending_status(self, mock_get_db):
        # Mocking the firestore structure
        mock_db = MagicMock()
        mock_collection = MagicMock()
        mock_document = MagicMock()

        mock_get_db.return_value = mock_db
        mock_db.collection.return_value = mock_collection
        mock_collection.document.return_value = mock_document

        # Initialize repository
        repo = IncidentRepository()

        # Action: Create a new incident
        incident_id = "test-incident-123"
        client_id = "client-456"

        repo.create_new_incident(incident_id=incident_id, client_id=client_id)

        # Verification: check that the parent BaseRepository create was called with correct data
        mock_db.collection.assert_called_once_with('incidents')
        mock_collection.document.assert_called_once_with(incident_id)

        # get the kwargs passed to document().set()
        mock_document.set.assert_called_once()
        args, kwargs = mock_document.set.call_args

        # The first argument should be a dictionary from IncidentResponse.model_dump()
        saved_data = args[0]

        self.assertEqual(saved_data['status'], 'PENDING')
        self.assertEqual(saved_data['client_id'], client_id)
        self.assertEqual(saved_data['incident_id'], incident_id)
        self.assertEqual(saved_data['extracted_data'], {})
        self.assertIsNone(saved_data['lawyer_id'])
        # created_at should be present
        self.assertIn('created_at', saved_data)
