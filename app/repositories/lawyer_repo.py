from typing import List
from google.cloud import firestore
from app.models import LawyerProfile
from app.repositories.base import BaseRepository

class LawyerRepository(BaseRepository[LawyerProfile]):
    def __init__(self):
        super().__init__(collection_name="lawyers", model=LawyerProfile)

    def find_available_lawyers(self, geohashes: List[str]) -> List[LawyerProfile]:
        """
        Finds active and online lawyers for a given list of geohashes.
        Handles Firestore's IN query limit by batching requests into groups of 10.
        Deduplicates results by lawyer UID.
        """
        if not geohashes:
            return []

        lawyers_dict = {}

        # Chunk geohashes into batches of 10 max
        for i in range(0, len(geohashes), 10):
            chunk = geohashes[i:i + 10]

            query = self._collection \
                .where(filter=firestore.FieldFilter("is_online", "==", True)) \
                .where(filter=firestore.FieldFilter("subscription_status", "==", "ACTIVE")) \
                .where(filter=firestore.FieldFilter("geohash", "in", chunk))

            for doc in query.stream():
                lawyer_data = doc.to_dict()
                lawyer = self.model(**lawyer_data)
                lawyers_dict[lawyer.uid] = lawyer

        return list(lawyers_dict.values())
