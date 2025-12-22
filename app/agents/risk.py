import json
import logging
from state import IncidentState
from config.logging_config import get_logger

logger = get_logger(__name__)

def risk_node(state: IncidentState) -> IncidentState:
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [RISK] Starting risk assessment node")
    
    rag = state["rag_engine"]
    llm = state["llm"]
    
    logger.debug(f"[INCIDENT-{incident_id}] [RISK] Querying RAG for safety policies...")
    policies = rag.query("retail safety escalation rules")

    prompt = f"""
You are a careful, thorough retail RISK ASSESSMENT agent working for autonomous incident systems.
Your job: Analyze incident findings (JSON), review provided store policies, assign \\textbf{{severity}} (1--5), compute \\textbf{{risk_score}} (0.0--1.0), decide if human review is needed, and write a short justification summary.
DO NOT reveal internal reasoning or include commentary; reply with valid JSON object ONLY, e.g.:
{{
    "severity": <int>,
    "risk_score": <float>,
    "requires_human": <bool>,
    "justification_summary": <str>
}}
If unsure, set "requires_human": true, "risk_score": 0.5, "severity": 3.

INCIDENT:
{state['fused_incident']}
POLICIES:
{policies}
"""
    try:
        logger.debug(f"[INCIDENT-{incident_id}] [RISK] Invoking LLM for risk assessment...")
        resp = llm.invoke(prompt)
        result = json.loads(resp if isinstance(resp, str) else resp.content)
        state["severity"] = result["severity"]
        state["risk_score"] = result["risk_score"]
        state["requires_human"] = result["requires_human"]
        
        logger.info(f"[INCIDENT-{incident_id}] [RISK] Risk assessment completed - Severity: {result['severity']}, Risk Score: {result['risk_score']}, Requires Human: {result['requires_human']}")
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [RISK] Risk assessment failed: {str(e)}", exc_info=True)
        state["requires_human"] = True
        state["risk_score"] = 0.5
        state["severity"] = 3
        state["episode_memory"].append(f"RISK JSON ERROR: {str(e)}")
        logger.warning(f"[INCIDENT-{incident_id}] [RISK] Using default values: severity=3, risk_score=0.5, requires_human=True")
    return state
