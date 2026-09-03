import logging
from fastapi import APIRouter, HTTPException

from app.models import IncidentCreate, IncidentResponse, IncidentAcceptRequest
from app.services.incident_service import IncidentService
from app.repositories.incident_repo import IncidentAlreadyAcceptedError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.post("", response_model=IncidentResponse, status_code=201)
def create_incident(payload: IncidentCreate):
    try:
        service = IncidentService()
        return service.create_incident(payload)
    except Exception as e:
        logger.error(f"Error creating incident: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{incident_id}/accept", response_model=dict, status_code=200)
def accept_incident(incident_id: str, payload: IncidentAcceptRequest):
    try:
        service = IncidentService()
        service.accept_incident(incident_id, payload.lawyer_id)
        return {"status": "success", "message": "Incident accepted"}
    except IncidentAlreadyAcceptedError as e:
        logger.warning(f"Conflict accepting incident {incident_id}: {e}")
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        logger.error(f"Error accepting incident {incident_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
