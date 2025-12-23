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

