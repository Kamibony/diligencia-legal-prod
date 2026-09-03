import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime

from app.repositories.incident_repo import IncidentRepository
from app.models import IncidentResponse, IncidentCreate

class TestIncidentRepository(unittest.TestCase):
    @patch('app.repositories.base.get_db')
    def test_create_incident_enforces_pending_status(self, mock_get_db):
        mock_db = MagicMock()
        mock_collection = MagicMock()
        mock_document = MagicMock()

        mock_get_db.return_value = mock_db
        mock_db.collection.return_value = mock_collection
        mock_collection.document.return_value = mock_document

        repo = IncidentRepository()
        incident_id = "test-incident-123"
        payload = IncidentCreate(
            client_id="client-456",
            detainee_name="John Doe",
            latitude=-23.5505,
            longitude=-46.6333,
            document_base64="base64"
        )
        geohash = "6gyf4"

        repo.create_new_incident(incident_id=incident_id, payload=payload, geohash=geohash)

        mock_db.collection.assert_called_once_with('incidents')
        mock_collection.document.assert_called_once_with(incident_id)
        mock_document.set.assert_called_once()
        args, kwargs = mock_document.set.call_args
        saved_data = args[0]

        self.assertEqual(saved_data['status'], 'PENDING')
        self.assertEqual(saved_data['client_id'], payload.client_id)
        self.assertEqual(saved_data['incident_id'], incident_id)
        self.assertEqual(saved_data['detainee_name'], payload.detainee_name)
        self.assertEqual(saved_data['geohash'], geohash)
        self.assertEqual(saved_data['extracted_data'], {})
        self.assertIsNone(saved_data['lawyer_id'])
        self.assertIn('created_at', saved_data)

    @patch('app.repositories.incident_repo.get_db')
    @patch('app.repositories.base.get_db')
    def test_accept_incident_success(self, mock_base_get_db, mock_incident_get_db):
        from app.repositories.incident_repo import IncidentAlreadyAcceptedError

        mock_db = MagicMock()
        mock_base_get_db.return_value = mock_db
        mock_incident_get_db.return_value = mock_db

        mock_collection = MagicMock()
        mock_db.collection.return_value = mock_collection

        mock_doc_ref = MagicMock()
        mock_collection.document.return_value = mock_doc_ref

        mock_transaction = MagicMock()
        mock_db.transaction.return_value = mock_transaction

        mock_snapshot = MagicMock()
        mock_snapshot.exists = True
        mock_snapshot.to_dict.return_value = {"status": "PENDING"}
        mock_doc_ref.get.return_value = mock_snapshot

        repo = IncidentRepository()

        repo.accept_incident("test-inc-1", "lawyer-1")

        mock_doc_ref.get.assert_called_once_with(transaction=mock_transaction)
        mock_transaction.update.assert_called_once_with(mock_doc_ref, {
            "status": "ACCEPTED",
            "lawyer_id": "lawyer-1"
        })

    @patch('app.repositories.incident_repo.get_db')
    @patch('app.repositories.base.get_db')
    def test_accept_incident_failure(self, mock_base_get_db, mock_incident_get_db):
        from app.repositories.incident_repo import IncidentAlreadyAcceptedError

        mock_db = MagicMock()
        mock_base_get_db.return_value = mock_db
        mock_incident_get_db.return_value = mock_db

        mock_collection = MagicMock()
        mock_db.collection.return_value = mock_collection

        mock_doc_ref = MagicMock()
        mock_collection.document.return_value = mock_doc_ref

        mock_transaction = MagicMock()
        mock_db.transaction.return_value = mock_transaction

        mock_snapshot = MagicMock()
        mock_snapshot.exists = True
        mock_snapshot.to_dict.return_value = {"status": "ACCEPTED"}
        mock_doc_ref.get.return_value = mock_snapshot

        repo = IncidentRepository()

        with self.assertRaises(IncidentAlreadyAcceptedError):
            repo.accept_incident("test-inc-1", "lawyer-1")

        mock_transaction.update.assert_not_called()
