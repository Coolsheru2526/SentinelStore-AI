import logging
from config.logging_config import get_logger

logger = get_logger(__name__)

def monitoring_node(state):
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [MONITORING] Starting monitoring node")
    
    risk_score = state.get("risk_score", 0.0)
    current_severity = state.get("severity", 0)
    
    logger.debug(f"[INCIDENT-{incident_id}] [MONITORING] Current risk_score: {risk_score}, severity: {current_severity}")
    
    if risk_score > 0.85:
        new_severity = current_severity + 1
        logger.warning(f"[INCIDENT-{incident_id}] [MONITORING] High risk detected ({risk_score}) - Escalating severity from {current_severity} to {new_severity}")
        state["severity"] = new_severity
        state["resolved"] = False
    else:
        logger.info(f"[INCIDENT-{incident_id}] [MONITORING] Risk score acceptable ({risk_score}) - Marking as resolved")
        state["resolved"] = True
    
    logger.info(f"[INCIDENT-{incident_id}] [MONITORING] Monitoring completed - Resolved: {state['resolved']}")
    return state
