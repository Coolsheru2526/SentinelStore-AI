import logging
from config.logging_config import get_logger

logger = get_logger(__name__)

def escalation_node(state):
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [ESCALATION] Starting escalation node")
    
    severity = state.get("severity", 0)
    logger.debug(f"[INCIDENT-{incident_id}] [ESCALATION] Current severity: {severity}")
    
    if severity >= 4:
        logger.critical(f"[INCIDENT-{incident_id}] [ESCALATION] Emergency services notified - Severity: {severity}")
        state["escalation_required"] = True
    else:
        logger.info(f"[INCIDENT-{incident_id}] [ESCALATION] Severity {severity} below threshold (4) - No escalation needed")
    
    logger.info(f"[INCIDENT-{incident_id}] [ESCALATION] Escalation check completed - Required: {state.get('escalation_required', False)}")
    return state
