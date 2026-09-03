import logging
from fastapi import APIRouter, HTTPException

from app.models import IncidentCreate, IncidentResponse
from app.services.incident_service import IncidentService

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
