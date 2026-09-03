from google.cloud import firestore
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

    @patch('app.repositories.base.get_db')
    def test_find_nearby_pending_incidents_batches_queries(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        mock_collection = MagicMock()
        mock_db.collection.return_value = mock_collection

        mock_query_pending = MagicMock()
        mock_collection.where.return_value = mock_query_pending

        mock_query_in = MagicMock()
        mock_query_pending.where.return_value = mock_query_in

        mock_doc1 = MagicMock()
        mock_doc1.to_dict.return_value = {
            "incident_id": "inc-1",
            "client_id": "client-1",
            "detainee_name": "John",
            "latitude": -23.5,
            "longitude": -46.6,
            "geohash": "6gyc",
            "status": "PENDING",
            "extracted_data": {},
            "created_at": datetime.now()
        }

        mock_doc2 = MagicMock()
        mock_doc2.to_dict.return_value = {
            "incident_id": "inc-2",
            "client_id": "client-2",
            "detainee_name": "Jane",
            "latitude": -23.51,
            "longitude": -46.61,
            "geohash": "6gyd",
            "status": "PENDING",
            "extracted_data": {},
            "created_at": datetime.now()
        }

        mock_query_in.stream.side_effect = [
            [mock_doc1, mock_doc2],
            [mock_doc2]
        ]

        repo = IncidentRepository()
        geohashes = [f"hash{i}" for i in range(15)]

        incidents = repo.find_nearby_pending_incidents(geohashes)

        self.assertEqual(len(incidents), 2)
        incident_ids = [inc.incident_id for inc in incidents]
        self.assertIn("inc-1", incident_ids)
        self.assertIn("inc-2", incident_ids)

        mock_db.collection.assert_called_with("incidents")
        self.assertEqual(mock_collection.where.call_count, 2)

        # Check arguments on calls manually since FieldFilter instances are unique
        calls = mock_collection.where.call_args_list
        for call in calls:
            kwargs = call[1]
            self.assertEqual(kwargs['filter'].field_path, "status")
            self.assertEqual(kwargs['filter'].op_string, "==")
            self.assertEqual(kwargs['filter'].value, "PENDING")
