"""
Prompt and configuration for Gemini response plan summarization.
This module contains the exact prompt and output structure for generating
clean, executive-friendly response plan summaries.
"""

# ============================================================================
# FINAL PROMPT FOR GEMINI - RESPONSE PLAN SUMMARIZATION
# ============================================================================

GEMINI_RESPONSE_PLAN_PROMPT = """You are an enterprise security operations report generator specializing in retail incident response planning.

TASK:
Summarize the provided incident response plan into a concise, professional, executive-ready document suitable for store managers, security teams, and compliance audits.

INPUT DATA:
{incident_metadata}

RESPONSE PLAN:
{response_plan}

STRICT INSTRUCTIONS:

1. CONTENT REDUCTION:
   - Reduce the plan to 1-2 pages of executive-friendly content
   - Remove ALL redundant explanations and repetitive instructions
   - Remove ALL verbose step-by-step details that are obvious or standard
   - Consolidate similar actions into single, clear statements
   - Remove ALL internal system references or technical implementation details
   - Keep only essential, actionable steps

2. PRESERVATION REQUIREMENTS:
   - Preserve ALL critical action items and escalation steps
   - Preserve severity-specific response protocols
   - Preserve safety and security priorities
   - Preserve communication and notification requirements
   - Preserve compliance and documentation requirements

3. TONE AND LANGUAGE:
   - Use formal, enterprise-grade language
   - Maintain clear, directive tone suitable for execution
   - Write for executive and operational audiences
   - Use professional business terminology
   - Make instructions clear and actionable

4. HALLUCINATION PREVENTION:
   - DO NOT invent new steps not present in the input
   - DO NOT add information not explicitly stated
   - DO NOT modify severity levels or critical actions
   - DO NOT create response protocols that don't exist in the input
   - Only summarize and restructure what is provided

5. OUTPUT FORMAT:
   - Return ONLY valid JSON
   - No markdown formatting
   - No explanatory text outside the JSON
   - No code blocks or formatting markers
   - The JSON must be directly parseable

REQUIRED JSON SCHEMA:
{{
  "plan_title": "Incident Response Plan",
  "incident_overview": {{
    "incident_id": "<extract from metadata or leave empty string>",
    "incident_type": "<extract from metadata or leave empty string>",
    "severity": "<extract from metadata or leave empty string>"
  }},
  "executive_summary": "<2-3 sentence overview of the response strategy and key priorities>",
  "critical_actions": [
    "<action 1: most critical immediate step>",
    "<action 2: next critical step>",
    "<action 3: additional critical action>"
  ],
  "response_phases": [
    {{
      "phase_name": "<phase name, e.g., 'Immediate Response'>",
      "phase_actions": [
        "<action in this phase>",
        "<another action in this phase>"
      ]
    }}
  ],
  "communication_protocol": [
    "<who to notify and when>",
    "<communication channel or method>"
  ],
  "safety_priorities": [
    "<priority 1: safety concern>",
    "<priority 2: safety concern>"
  ],
  "documentation_requirements": [
    "<what must be documented>",
    "<documentation standard or format>"
  ],
  "notes": "This response plan summary was generated using AI for clarity and executive review purposes."
}}

CONTENT GUIDELINES:
- Executive summary: 2-3 sentences, high-level strategy overview
- Critical actions: 3-6 most important immediate actions, prioritized
- Response phases: Group related actions into logical phases (e.g., Immediate Response, Escalation, Resolution)
- Communication protocol: Who needs to be notified and how
- Safety priorities: Key safety and security concerns to address
- Documentation requirements: What must be recorded for compliance
- Notes: Always include the AI generation transparency statement

Begin processing now. Return ONLY the JSON object, no other text."""


# ============================================================================
# EXAMPLE JSON OUTPUT (MOCK DATA)
# ============================================================================

EXAMPLE_RESPONSE_PLAN_OUTPUT = {
    "plan_title": "Incident Response Plan",
    "incident_overview": {
        "incident_id": "INC-2024-001234",
        "incident_type": "Armed Robbery",
        "severity": "5"
    },
    "executive_summary": "This Severity Level 5 response plan addresses an armed robbery incident requiring immediate escalation to law enforcement, silent alarm activation, and comprehensive safety protocols. The plan prioritizes customer and staff safety while ensuring proper documentation and coordination with authorities.",
    "critical_actions": [
        "Immediately assign unique Incident ID and confirm Severity Level 5 classification",
        "Activate silent alarm to alert management and designated staff",
        "Contact local law enforcement with incident details and location",
        "Initiate lockdown protocol by securing all external doors",
        "Direct staff to guide customers to safe areas via secure channels"
    ],
    "response_phases": [
        {
            "phase_name": "Immediate Response",
            "phase_actions": [
                "Assign Incident ID and timestamp",
                "Confirm Severity Level 5 classification",
                "Activate silent alarm system"
            ]
        },
        {
            "phase_name": "Authority Notification",
            "phase_actions": [
                "Contact local law enforcement with full incident details",
                "Provide location and live camera feed access if available",
                "Notify on-site security personnel with suspect description"
            ]
        },
        {
            "phase_name": "Safety & Security",
            "phase_actions": [
                "Lockdown all external doors and disable automatic entry systems",
                "Instruct staff to direct customers to safe areas",
                "Maintain visual contact with suspect(s) without approaching"
            ]
        },
        {
            "phase_name": "Monitoring & Documentation",
            "phase_actions": [
                "Continue real-time monitoring via CCTV and sensors",
                "Log all developments and actions with timestamps",
                "Maintain detailed incident log for post-incident review"
            ]
        }
    ],
    "communication_protocol": [
        "Notify management and designated staff via silent alarm",
        "Contact local law enforcement with incident details",
        "Alert on-site security personnel with location and suspect description",
        "Provide authorities with requested information and live updates"
    ],
    "safety_priorities": [
        "Protect customers and staff by directing them to safe areas",
        "Avoid public announcements unless imminent threat is confirmed",
        "Maintain visual contact with suspect(s) without direct approach",
        "Stand by for evacuation if situation escalates"
    ],
    "documentation_requirements": [
        "Maintain detailed incident log with timestamps",
        "Record all detection sources and actions taken",
        "Document all communications with authorities",
        "Prepare for post-incident debrief and effectiveness review"
    ],
    "notes": "This response plan summary was generated using AI for clarity and executive review purposes."
}


# ============================================================================
# HELPER FUNCTION TO BUILD PROMPT
# ============================================================================

def build_response_plan_prompt(
    response_plan: str | list,
    incident_id: str = "",
    incident_type: str = "",
    severity: str = ""
) -> str:
    """
    Build the complete prompt for Gemini response plan summarization.
    
    Args:
        response_plan: The response plan text (string) or list of plan steps
        incident_id: Optional incident identifier
        incident_type: Optional incident type classification
        severity: Optional severity level
    
    Returns:
        Complete formatted prompt string ready to send to Gemini API
    """
    # Convert list to string if needed
    if isinstance(response_plan, list):
        plan_text = "\n".join(str(step) for step in response_plan)
    else:
        plan_text = str(response_plan)
    
    metadata = f"""
Incident ID: {incident_id}
Incident Type: {incident_type}
Severity: {severity}
"""
    
    return GEMINI_RESPONSE_PLAN_PROMPT.format(
        incident_metadata=metadata.strip(),
        response_plan=plan_text
    )

