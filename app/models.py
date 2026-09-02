from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

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
    is_online: bool
    updated_at: datetime

class IncidentCreate(BaseModel):
    client_id: str
    latitude: float
    longitude: float
    document_base64: str

class IncidentResponse(BaseModel):
    incident_id: str
    client_id: str
    lawyer_id: Optional[str] = None
    status: str
    extracted_data: Dict[str, Any]
    created_at: datetime
