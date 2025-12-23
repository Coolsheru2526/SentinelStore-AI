from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    username: str
    email: str
    hashed_password: str
    full_name: str = ""
    role: str = "employee"  # "manager", "employee", etc.
    store_id: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('id', mode='before')
    @classmethod
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class Store(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class Incident(BaseModel):
    id: str = Field(alias="_id")
    store_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved: bool = False
    severity: Optional[int] = None
    risk_score: Optional[float] = None
    incident_type: Optional[str] = None
    plan: Optional[str] = None  # JSON string
    execution_results: Optional[str] = None  # JSON string
    reflection: Optional[str] = None
    explanation: Optional[str] = None
    state: Dict[str, Any] = Field(default_factory=dict)  # Full incident state

    class Config:
        populate_by_name = True