import logging
from config.logging_config import get_logger

logger = get_logger(__name__)

def response_planning_node(state):
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [PLANNING] Starting response planning node")

    llm = state["llm"]
    rag = state["rag_engine"]

    incident_type = state.get("incident_type", "unknown")
    severity = state.get("severity", 0)

    # Retrieve SOPs
    logger.debug(
        f"[INCIDENT-{incident_id}] [PLANNING] Retrieving SOPs for "
        f"type={incident_type}, severity={severity}"
    )
    sop_context = rag.query(
        f"Standard operating procedures for {incident_type} incident with severity {severity}"
    )["context"]

    logger.debug(
        f"[INCIDENT-{incident_id}] [PLANNING] SOP context length: {len(sop_context)} chars"
    )

    # Build planner prompt
    prompt = f"""
You are an autonomous incident response planner for a retail store.

INCIDENT SUMMARY:
Type: {incident_type}
Severity: {severity}

FUSED INCIDENT UNDERSTANDING:
{state.get("fused_incident")}

CURRENT REASONING CONTEXT:
{state.get("working_memory")}

PAST INCIDENT LEARNINGS:
{state.get("long_term_context")}

STANDARD OPERATING PROCEDURES:
{sop_context}

TASK:
Generate a clear, ordered, step-by-step response plan.
- Steps must be actionable and operational
- Include escalation steps if severity is high
- Avoid explanations, output only steps
"""

    try:
        logger.debug(f"[INCIDENT-{incident_id}] [PLANNING] Invoking LLM...")
        plan_response = llm.invoke(prompt)
        
        plan_text = plan_response.content
        
        state["plan"] = [
            step.strip("- ").strip()
            for step in plan_text.split("\n")
            if step.strip()
]

        logger.info(
            f"[INCIDENT-{incident_id}] [PLANNING] Generated {len(state['plan'])} plan steps"
        )
        logger.debug(
            f"[INCIDENT-{incident_id}] [PLANNING] Plan: {state['plan']}"
        )

    except Exception as e:
        logger.error(
            f"[INCIDENT-{incident_id}] [PLANNING] Plan generation failed: {e}",
            exc_info=True
        )
        state["plan"] = []
        state["episode_memory"].append(f"PLANNING ERROR: {str(e)}")

    state["episode_memory"].append("Response plan generated")
    return state
