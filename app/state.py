from typing import TypedDict, Dict, List, Optional, Any

class IncidentState(TypedDict):
    # Identity
    incident_id: str
    store_id: str

    vision_observation: Optional[Dict[str, Any]]
    audio_observation: Optional[Dict[str, Any]]
    video_observation: Optional[Dict[str, Any]]

    # judged signals
    vision_signal: Optional[Dict[str, Any]]
    audio_signal: Optional[Dict[str, Any]]
    video_signal: Optional[Dict[str, Any]]

    # Fusion output
    fused_incident: Optional[Dict[str, Any]]


    # Memory
    episode_memory: List[str]          # short-term
    working_memory: Dict[str, Any]     # reasoning context
    long_term_context: Optional[str]   # retrieved history

    # Understanding
    incident_type: Optional[str]
    confidence: float

    # Risk
    severity: Optional[int]
    risk_score: Optional[float]
    requires_human: bool

    # Planning & execution
    plan: Optional[List[str]]
    execution_actions: Optional[Dict]
    execution_results: Dict
    execution_blocked: bool

    # Lifecycle
    resolved: bool
    escalation_required: bool
    human_decision: Optional[str]

    # Explainability
    explanation: Optional[str]

    # Engines
    rag_engine: object
    llm: object
    reflection: Optional[str]
    reflection_tags: Optional[List[str]]
