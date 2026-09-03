import os
from google.cloud import firestore

_db_client = None

def get_db() -> firestore.Client:
    """
    Returns a global Firestore client instance.
    Initializes it lazily to reuse the connection pool across requests.
    """
    global _db_client
    if _db_client is None:
        # Uses default Google Cloud credentials (e.g. from GCP_SA_KEY or Cloud Run)
        project_id = os.environ.get("GCP_PROJECT_ID")
        if project_id:
            _db_client = firestore.Client(project=project_id)
        else:
            _db_client = firestore.Client()
    return _db_client
