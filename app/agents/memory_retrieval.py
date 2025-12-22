import logging
from config.logging_config import get_logger

logger = get_logger(__name__)

def memory_retrieval_node(state):
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [MEMORY] Starting memory retrieval node")

    rag = state["rag_engine"]

    store_id = state.get("store_id", "unknown")
    incident_type = state.get("incident_type", "unknown")
    severity = state.get("severity", "unknown")
    vision_signal = state.get("vision_signal")
    audio_signal = state.get("audio_signal")

    # High-quality agentic query
    query = f"""
You are retrieving memory for a retail incident response system.

Store ID: {store_id}
Incident Type: {incident_type}
Estimated Severity: {severity}

Observed Signals:
Vision Analysis: {vision_signal}
Audio Analysis: {audio_signal}

Task:
- Retrieve similar historical incidents.
- Identify what actions were taken.
- Highlight outcomes and lessons learned.
- Surface relevant SOPs or escalation guidelines.

Return only relevant factual context.
"""

    logger.debug(
        f"[INCIDENT-{incident_id}] [MEMORY] Query Preview: {query[:200]}..."
    )

    result = rag.query(query)

    context = result.get("context", "")
    logger.info(
        f"[INCIDENT-{incident_id}] [MEMORY] Retrieved {len(context)} chars of long-term memory"
    )

    state["long_term_context"] = context
    state["episode_memory"].append("Retrieved long-term memory context")

    logger.info(f"[INCIDENT-{incident_id}] [MEMORY] Memory retrieval completed")
    return state
