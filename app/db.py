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
        _db_client = firestore.Client()
    return _db_client
