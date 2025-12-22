import json
import logging
from state import IncidentState
from config.logging_config import get_logger

logger = get_logger(__name__)

def fusion_understanding_node(state: IncidentState) -> IncidentState:
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [FUSION] Starting fusion node")
    
    llm = state["llm"]
    vision_signal = state.get("vision_signal")
    audio_signal = state.get("audio_signal")
    
    logger.debug(f"[INCIDENT-{incident_id}] [FUSION] Vision signal: {vision_signal is not None}, Audio signal: {audio_signal is not None}")
    
    prompt = f"""
You are a retail fusion agent specializing in combining vision+audio signals from retail incidents into a single coherent JSON summary.
Use only the supplied evidence, do not hallucinate, and ALWAYS reply with this JSON shape (no commentary!):
{{
  "incident_type": <str>,
  "description": <str>,
  "combined_confidence": <float>,
  "supporting_evidence": <str>
}}

VISION SIGNAL: {vision_signal}
AUDIO SIGNAL: {audio_signal}
"""
    try:
        logger.debug(f"[INCIDENT-{incident_id}] [FUSION] Invoking LLM for fusion...")
        resp = llm.invoke(prompt)
        print(resp)
        state["fused_incident"] = json.loads(resp if isinstance(resp, str) else resp.content)
        incident_type = state["fused_incident"].get("incident_type", "unknown")
        confidence = state["fused_incident"].get("combined_confidence", 0.0)
        logger.info(f"[INCIDENT-{incident_id}] [FUSION] Fusion completed - Type: {incident_type}, Confidence: {confidence}")
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [FUSION] Fusion failed: {str(e)}", exc_info=True)
        state["fused_incident"] = {}
        state["episode_memory"].append(f"FUSION JSON ERROR: {str(e)}")
    return state
