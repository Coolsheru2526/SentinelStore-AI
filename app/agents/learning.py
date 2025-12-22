import logging
from config.logging_config import get_logger

logger = get_logger(__name__)

def learning_node(state):
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [LEARNING] Starting learning node")
    
    rag = state["rag_engine"]
    incident_type = state.get("incident_type", "unknown")
    severity = state.get("severity", 0)
    resolved = state.get("resolved", False)
    store_id = state.get("store_id", "unknown")

    memory_record = f"""
Incident Type: {incident_type}
Severity: {severity}
Actions Taken: {state['plan']}
Outcome: {"resolved" if resolved else "escalated"}
Lessons: {state['episode_memory']}
"""

    try:
        logger.debug(f"[INCIDENT-{incident_id}] [LEARNING] Adding incident to long-term memory...")
        logger.debug(f"[INCIDENT-{incident_id}] [LEARNING] Memory record: {memory_record[:100]}...")
        
        rag.add_document(
            memory_record,
            metadata={
                "store_id": store_id,
                "incident_type": incident_type,
                "severity": severity
            }
        )
        
        logger.info(f"[INCIDENT-{incident_id}] [LEARNING] Long-term memory updated - Type: {incident_type}, Severity: {severity}, Outcome: {'resolved' if resolved else 'escalated'}")
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [LEARNING] Failed to update long-term memory: {str(e)}", exc_info=True)
        state["episode_memory"].append(f"LEARNING ERROR: {str(e)}")
    
    return state
