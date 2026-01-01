import logging
from config.logging_config import get_logger

logger = get_logger(__name__)

def human_review_node(state):
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [HUMAN] Review node")

    if not state.get("requires_human"):
        return state

    if state.get("human_decision") is None:
        logger.info(f"[INCIDENT-{incident_id}] [HUMAN] Awaiting human input")
        state["execution_blocked"] = True
        return state  # STOP HERE

    logger.info(f"[INCIDENT-{incident_id}] [HUMAN] Decision: {state['human_decision']}")

    if state["human_decision"] == "abort":
        state["resolved"] = True
        state["execution_blocked"] = True
        return state

    state["requires_human"] = False
    state["execution_blocked"] = False
    return state
