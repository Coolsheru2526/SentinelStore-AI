import json
import logging
from config.logging_config import get_logger

logger = get_logger(__name__)

def response_llm_node(state):
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [RESPONSE-LLM] Starting response LLM node")
    
    llm = state["llm"]
    severity = state.get("severity", 0)
    
    prompt = f"""
You are a highly prompt disciplined emergency COMMUNICATION agent.
Analyze the given CONTEXT, PLAN, and PAST OUTCOMES, then generate valid JSON specifying announcement, email, call, and emergency actions (see below structure!):

CONTEXT: {state['working_memory']}
PLAN: {state['plan']}
PAST INCIDENT OUTCOMES: {state['long_term_context']}

Return only valid compact JSON, e.g.:
{{
    "announce": {{"enabled": <bool>, "text": <str>}},
    "email": {{"enabled": <bool>, "subject": <str>, "body": <str>}},
    "call": {{"enabled": <bool>, "subject": <str>, "script": <str>}},
    "emergency": {{"enabled": <bool>}}
}}
Note: Both email and call should include a "subject" field for context/tracking.
Tone MUST match severity {severity}. DO NOT explain/annotate.
"""
    try:
        logger.debug(f"[INCIDENT-{incident_id}] [RESPONSE-LLM] Invoking LLM for action generation (severity: {severity})...")
        resp = llm.invoke(prompt)
        state["execution_actions"] = json.loads(resp if isinstance(resp, str) else resp.content)
        
        enabled_actions = [k for k, v in state["execution_actions"].items() if v.get("enabled", False)]
        logger.info(f"[INCIDENT-{incident_id}] [RESPONSE-LLM] Generated execution actions - Enabled: {enabled_actions}")
        logger.debug(f"[INCIDENT-{incident_id}] [RESPONSE-LLM] Actions: {state['execution_actions']}")
        
        state["episode_memory"].append("Execution messages generated")
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [RESPONSE-LLM] Action generation failed: {str(e)}", exc_info=True)
        state["execution_actions"] = {}
        state["episode_memory"].append(f"LLM JSON ERROR: {str(e)}")
    return state
