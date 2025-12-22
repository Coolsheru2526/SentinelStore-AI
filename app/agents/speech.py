import json
import logging
from state import IncidentState
from config.logging_config import get_logger

logger = get_logger(__name__)

def speech_react_node(state: IncidentState) -> IncidentState:
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [SPEECH] Starting speech analysis node")
    
    llm = state["llm"]
    observation = state.get("audio_observation")
    
    if not observation:
        logger.warning(f"[INCIDENT-{incident_id}] [SPEECH] No audio observation provided")
        state["audio_signal"] = {}
        return state
    
    logger.debug(f"[INCIDENT-{incident_id}] [SPEECH] Processing audio observation...")
    
    prompt = f"""
You are a retail SPEECH incident detection agent. Given an audio observation, output strict JSON with these fields:
{{
  "is_incident": <bool>,
  "intent": <str>,
  "emotional_state": <str>,
  "confidence": <float>,
  "evidence_used": <str>
}}
OBSERVATION: {observation}
Reply ONLY with JSON. DO NOT include commentary.
"""
    try:
        logger.debug(f"[INCIDENT-{incident_id}] [SPEECH] Invoking LLM for speech analysis...")
        resp = llm.invoke(prompt)
        print(resp)
        state["audio_signal"] = json.loads(resp if isinstance(resp, str) else resp.content)
        
        is_incident = state["audio_signal"].get("is_incident", False)
        intent = state["audio_signal"].get("intent", "unknown")
        emotional_state = state["audio_signal"].get("emotional_state", "unknown")
        confidence = state["audio_signal"].get("confidence", 0.0)
        logger.info(f"[INCIDENT-{incident_id}] [SPEECH] Speech analysis completed - Incident: {is_incident}, Intent: {intent}, Emotion: {emotional_state}, Confidence: {confidence}")
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [SPEECH] Speech analysis failed: {str(e)}", exc_info=True)
        state["audio_signal"] = {}
        state.setdefault("episode_memory",[]).append(f"SPEECH JSON ERROR: {str(e)}")
    return state
