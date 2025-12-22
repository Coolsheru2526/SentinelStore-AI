import logging
from config.logging_config import get_logger

logger = get_logger(__name__)

def explainability_node(state):
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [EXPLAINABILITY] Starting explainability node")

    rag = state["rag_engine"]
    severity = state.get("severity", 0)
    incident_type = state.get("incident_type", "unknown")
    confidence = state.get("confidence", 0.0)

    # High-quality, targeted RAG query
    rag_query = f"""
Retail safety and security policy justification.

Incident type: {incident_type}
Severity level: {severity}

Retrieve:
- Relevant policy clauses
- Risk classification rules
- Escalation criteria
- Any similar precedent incidents
"""

    logger.debug(f"[INCIDENT-{incident_id}] [EXPLAINABILITY] RAG query prepared")

    refs = rag.query(rag_query)
    policy_context = refs.get("context", "")

    logger.debug(
        f"[INCIDENT-{incident_id}] [EXPLAINABILITY] Retrieved {len(policy_context)} chars of policy context"
    )

    # Structured, human-readable explanation
    state["explanation"] = f"""
INCIDENT EXPLANATION REPORT
---------------------------

Incident Type:
{incident_type}

Assessed Severity:
{severity}

Confidence Score:
{confidence}

Decision Rationale:
The system classified this incident as **severity level {severity}** based on:
- Visual and/or audio observations indicating risk patterns aligned with this incident type
- Historical incident patterns retrieved from long-term memory
- Policy-defined escalation thresholds for similar events

Policy & Precedent References:
{policy_context}

Interpretation:
According to the referenced policies, incidents of this category require this severity
classification to ensure safety, regulatory compliance, and timely response.

This explanation is generated to support transparency, auditability,
and human review if required.
"""

    logger.info(
        f"[INCIDENT-{incident_id}] [EXPLAINABILITY] Explanation generated successfully"
    )

    return state
