from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class OcrExtractedData(BaseModel):
    detainee_name: str
    crime_classification: Optional[str] = None
    warrant_number: Optional[str] = None

class UserProfile(BaseModel):
    uid: str
    cpf_masked: str
    phone: str
    created_at: datetime

class LawyerProfile(BaseModel):
    uid: str
    oab_number: str
    office_name: str
    subscription_status: str
    latitude: float
    longitude: float
    geohash: str
    is_online: bool
    updated_at: datetime

class IncidentCreate(BaseModel):
    client_id: str
    detainee_name: str
    detainee_cpf: Optional[str] = None
    latitude: float
    longitude: float
    document_base64: str
    warrant_number: Optional[str] = None

class IncidentResponse(BaseModel):
    incident_id: str
    client_id: str
    detainee_name: str
    detainee_cpf: Optional[str] = None
    latitude: float
    longitude: float
    warrant_number: Optional[str] = None
    geohash: str
    lawyer_id: Optional[str] = None
    status: str
    extracted_data: Dict[str, Any]
    created_at: datetime

class IncidentAcceptRequest(BaseModel):
    lawyer_id: str
