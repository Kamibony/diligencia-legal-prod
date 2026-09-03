import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone
from google.cloud import firestore

from app.models import LawyerProfile
from app.repositories.lawyer_repo import LawyerRepository

class TestLawyerRepository(unittest.TestCase):
    @patch('app.repositories.base.get_db')
    def test_find_available_lawyers_batches_queries(self, mock_get_db):
        # Setup mock db and collection
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        mock_collection = MagicMock()
        mock_db.collection.return_value = mock_collection

        # Setup mock query chain
        mock_query_online = MagicMock()
        mock_collection.where.return_value = mock_query_online

        mock_query_active = MagicMock()
        mock_query_online.where.return_value = mock_query_active

        mock_query_in = MagicMock()
        mock_query_active.where.return_value = mock_query_in

        # Mock query results
        mock_doc1 = MagicMock()
        mock_doc1.to_dict.return_value = {
            "uid": "lawyer-1",
            "oab_number": "12345",
            "office_name": "Office 1",
            "subscription_status": "ACTIVE",
            "latitude": -23.5,
            "longitude": -46.6,
            "geohash": "6gyc",
            "is_online": True,
            "updated_at": datetime.now(timezone.utc)
        }

        mock_doc2 = MagicMock()
        mock_doc2.to_dict.return_value = {
            "uid": "lawyer-2", # same lawyer from another query (should be deduplicated)
            "oab_number": "67890",
            "office_name": "Office 2",
            "subscription_status": "ACTIVE",
            "latitude": -23.51,
            "longitude": -46.61,
            "geohash": "6gyd",
            "is_online": True,
            "updated_at": datetime.now(timezone.utc)
        }

        # Mock stream to return docs for the first call and second call
        # The first call will return doc1 and doc2. The second call will return doc2 again to test deduplication
        mock_query_in.stream.side_effect = [
            [mock_doc1, mock_doc2],
            [mock_doc2]
        ]

        repo = LawyerRepository()

        # Create 15 geohashes to force 2 batches (10 + 5)
        geohashes = [f"hash{i}" for i in range(15)]

        lawyers = repo.find_available_lawyers(geohashes)

        # Asserts
        self.assertEqual(len(lawyers), 2)
        lawyer_uids = [l.uid for l in lawyers]
        self.assertIn("lawyer-1", lawyer_uids)
        self.assertIn("lawyer-2", lawyer_uids)

        # Verify collection was called correctly
        mock_db.collection.assert_called_with("lawyers")

        # Verify batching
        self.assertEqual(mock_collection.where.call_count, 2)

    @patch('app.repositories.base.get_db')
    def test_find_available_lawyers_empty(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        mock_collection = MagicMock()
        mock_db.collection.return_value = mock_collection

        mock_query_online = MagicMock()
        mock_collection.where.return_value = mock_query_online

        mock_query_active = MagicMock()
        mock_query_online.where.return_value = mock_query_active

        mock_query_in = MagicMock()
        mock_query_active.where.return_value = mock_query_in

        mock_query_in.stream.return_value = []

        repo = LawyerRepository()
        lawyers = repo.find_available_lawyers(["hash1"])

        self.assertEqual(len(lawyers), 0)
