import logging
from typing import List
from fastapi import APIRouter, HTTPException, Query

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

@router.get("/nearby", response_model=List[IncidentResponse], status_code=200)
def get_nearby_incidents(
    lat: float = Query(...),
    lon: float = Query(...),
    radius: float = Query(5000.0)
):
    try:
        service = IncidentService()
        return service.get_nearby_incidents(lat=lat, lon=lon, radius_m=radius)
    except Exception as e:
        logger.error(f"Error fetching nearby incidents: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/me", response_model=List[IncidentResponse], status_code=200)
def get_my_incidents(
    lawyer_id: str = Query(...)
):
    try:
        service = IncidentService()
        return service.get_lawyer_incidents(lawyer_id)
    except Exception as e:
        logger.error(f"Error fetching lawyer incidents: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{incident_id}", response_model=IncidentResponse, status_code=200)
def get_incident(incident_id: str):
    try:
        service = IncidentService()
        return service.get_incident(incident_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching incident {incident_id}: {e}")
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
