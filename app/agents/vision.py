import json
import logging
from state import IncidentState
from config.logging_config import get_logger

logger = get_logger(__name__)

def vision_react_node(state: IncidentState) -> IncidentState:
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [VISION] Starting vision analysis node")
    
    llm = state["llm"]
    observation = state.get("vision_observation")
    
    if not observation:
        logger.warning(f"[INCIDENT-{incident_id}] [VISION] No vision observation provided")
        state["vision_signal"] = {}
        return state
    
    logger.debug(f"[INCIDENT-{incident_id}] [VISION] Processing vision observation...")
    
    prompt = f"""
You are a highly reliable VISION incident detector for a retail AI system.
Given a visual observation, output strict JSON object with these fields only:
{{
  "is_incident": <bool>,
  "scenario_label": <str>,
  "confidence": <float between 0 and 1>,
  "evidence_used": <str>
}}
Example:
{{"is_incident":true,"scenario_label":"theft","confidence":0.95,"evidence_used":"shelf empty, person running"}}
OBSERVATION: {observation}
Do NOT add any explanation outside JSON.
"""
    try:
        logger.debug(f"[INCIDENT-{incident_id}] [VISION] Invoking LLM for vision analysis...")
        resp = llm.invoke(prompt)
        print(resp)
        state["vision_signal"] = json.loads(resp if isinstance(resp, str) else resp.content)
        
        is_incident = state["vision_signal"].get("is_incident", False)
        scenario = state["vision_signal"].get("scenario_label", "unknown")
        confidence = state["vision_signal"].get("confidence", 0.0)
        logger.info(f"[INCIDENT-{incident_id}] [VISION] Vision analysis completed - Incident: {is_incident}, Scenario: {scenario}, Confidence: {confidence}")
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [VISION] Vision analysis failed: {str(e)}", exc_info=True)
        state["vision_signal"] = {}
        state.setdefault("episode_memory",[]).append(f"VISION JSON ERROR: {str(e)}")
    return state
