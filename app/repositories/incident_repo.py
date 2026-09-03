from datetime import datetime, timezone
from google.cloud import firestore

from app.repositories.base import BaseRepository
from app.models import IncidentResponse
from app.db import get_db

class IncidentAlreadyAcceptedError(Exception):
    pass

@firestore.transactional
def _accept_incident_transaction(transaction, doc_ref, lawyer_id):
    snapshot = doc_ref.get(transaction=transaction)
    if not snapshot.exists:
        raise Exception("Incident not found")

    data = snapshot.to_dict()
    if data.get("status") != "PENDING":
        raise IncidentAlreadyAcceptedError(f"Incident is not pending. Status: {data.get('status')}")

    transaction.update(doc_ref, {
        "status": "ACCEPTED",
        "lawyer_id": lawyer_id
    })
    return True

class IncidentRepository(BaseRepository[IncidentResponse]):
    def __init__(self):
        super().__init__(collection_name="incidents", model=IncidentResponse)

    def create_new_incident(self, incident_id: str, client_id: str) -> IncidentResponse:
        """
        Creates a new incident document enforcing 'PENDING' status.
        """
        incident_data = IncidentResponse(
            incident_id=incident_id,
            client_id=client_id,
            lawyer_id=None,
            status="PENDING",
            extracted_data={},
            created_at=datetime.now(timezone.utc)
        )
        return super().create(document_id=incident_id, data=incident_data)

    def accept_incident(self, incident_id: str, lawyer_id: str) -> None:
        """
        Atomically updates the incident status to ACCEPTED and assigns the lawyer_id.
        Raises IncidentAlreadyAcceptedError if the incident is already accepted or not pending.
        """
        db = get_db()
        doc_ref = self._collection.document(incident_id)
        transaction = db.transaction()
        _accept_incident_transaction(transaction, doc_ref, lawyer_id)
