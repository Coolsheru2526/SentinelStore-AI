import logging
from config.logging_config import get_logger

logger = get_logger(__name__)

def self_reflection_node(state):
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [SELF-REFLECTION] Starting self-reflection node")
    
    llm = state["llm"]
    rag = state["rag_engine"]
    incident_type = state.get("incident_type", "unknown")
    severity = state.get("severity", 0)

    logger.debug(f"[INCIDENT-{incident_id}] [SELF-REFLECTION] Querying RAG for similar historical incidents...")
    historical = rag.query(
        f"Similar incidents to {incident_type} "
        f"with severity {severity}"
    )["context"]
    logger.debug(f"[INCIDENT-{incident_id}] [SELF-REFLECTION] Retrieved {len(historical)} chars of historical context")

    prompt = f"""
You are a SELF-REFLECTION AGENT for an autonomous retail incident system.

INCIDENT SUMMARY:
Type: {incident_type}
Severity: {severity}
Risk Score: {state['risk_score']}

PLAN EXECUTED:
{state['plan']}

EXECUTION RESULTS:
{state['execution_results']}

EPISODE MEMORY:
{state['episode_memory']}

HISTORICAL OUTCOMES:
{historical}

Tasks:
1. Was the severity appropriate?
2. Did any step over- or under-react?
3. What should change next time?

Return:
- Reflection summary (plain text)
- 2–4 improvement tags
"""

    try:
        logger.debug(f"[INCIDENT-{incident_id}] [SELF-REFLECTION] Invoking LLM for reflection...")
        output = llm.invoke(prompt)

        state["reflection"] = output
        print(output)
        message_text = output.content
        state["reflection_tags"] = [
            tag.strip()
            for tag in ["severity_tuning", "faster_escalation", "deescalation"]
            if tag.lower() in message_text.lower()
        ]
        
        logger.info(f"[INCIDENT-{incident_id}] [SELF-REFLECTION] Reflection completed - Tags: {state['reflection_tags']}")
        logger.debug(f"[INCIDENT-{incident_id}] [SELF-REFLECTION] Reflection summary: {output.content[:100]}...")
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [SELF-REFLECTION] Reflection failed: {str(e)}", exc_info=True)
        state["reflection"] = f"Reflection error: {str(e)}"
        state["reflection_tags"] = []

    state["episode_memory"].append("Self-reflection completed")
    return state
