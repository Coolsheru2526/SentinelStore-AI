from pydantic import BaseModel, Field
from typing import Any, Dict, Optional

class IncidentCreateRequest(BaseModel):
    store_id: str = Field(..., description="Store (location) ID")
    store_state: Dict[str, Any] = Field(default_factory=dict, description="Store-wide contextual state/info")
    signals: Dict[str, Any] = Field(default_factory=dict, description="Initial signals, sensor, or system triggers")
    vision_observation: Optional[str] = Field(None, description="Image data as base64 encoded string")
    audio_observation: Optional[str] = Field(None, description="Audio data as base64 encoded string")
    video_observation: Optional[str] = Field(None, description="Video data as base64 encoded string")

class IncidentCreateResponse(BaseModel):
    incident_id: str
    # Optionally expand with more details if needed

class HumanDecisionRequest(BaseModel):
    decision: str

# Auth schemas
class UserCreate(BaseModel):
    """User registration payload.

    Only username and password are required for authentication. Email is optional
    so that accounts can be created without providing an email address.
    """

    username: str
    password: str
    full_name: str = ""
    role: str = "employee"
    store_id: str
    email: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

