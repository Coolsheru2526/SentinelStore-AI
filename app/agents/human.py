import logging
from config.logging_config import get_logger

logger = get_logger(__name__)

def human_review_node(state):
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [HUMAN] Starting human review node")
    
    if not state.get("requires_human", False):
        logger.debug(f"[INCIDENT-{incident_id}] [HUMAN] Human review not required, skipping")
        return state

    human_decision = state.get("human_decision")
    if human_decision is None:
        logger.info(f"[INCIDENT-{incident_id}] [HUMAN] Waiting for human decision...")
        return state

    logger.info(f"[INCIDENT-{incident_id}] [HUMAN] Human decision received: {human_decision}")
    
    if human_decision == "force_escalation":
        logger.warning(f"[INCIDENT-{incident_id}] [HUMAN] Force escalation requested - Setting severity to 5")
        state["severity"] = 5

    state["requires_human"] = False
    logger.info(f"[INCIDENT-{incident_id}] [HUMAN] Human review completed")
    return state
