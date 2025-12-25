"""
Example usage of the Gemini report summarization prompt.

This file demonstrates how to use the prompt with the Gemini 3 Pro Preview API.
"""

import os
import json
from dotenv import load_dotenv
from report_summarization_prompt import build_summarization_prompt, EXAMPLE_OUTPUT_JSON

# Load environment variables
load_dotenv()

# Example: How to call Gemini 3 Pro Preview API
def summarize_incident_report_example():
    """
    Example function showing how to use the summarization prompt with Gemini API.
    
    Note: This requires the google-generativeai package to be installed:
    pip install google-generativeai
    """
    
    # Example input data
    incident_explanation = """
    INCIDENT EXPLANATION REPORT
    ---------------------------
    
    Incident Type:
    Unauthorized Access Attempt
    
    Assessed Severity:
    3
    
    Confidence Score:
    0.92
    
    Decision Rationale:
    The system classified this incident as **severity level 3** based on:
    - Visual and/or audio observations indicating risk patterns aligned with this incident type
    - Historical incident patterns retrieved from long-term memory
    - Policy-defined escalation thresholds for similar events
    
    Policy & Precedent References:
    [Long policy text here...]
    Policy ID: SEC-POL-2024-003
    Version: 2.1
    Effective Date: 2024-01-15
    
    [More redundant policy text and SOP documents...]
    
    Interpretation:
    According to the referenced policies, incidents of this category require this severity
    classification to ensure safety, regulatory compliance, and timely response.
    
    Actions Taken:
    - Automated in-store security announcement
    - Store manager notification
    - Incident logging
    - Video evidence archiving
    
    This explanation is generated to support transparency, auditability,
    and human review if required.
    """
    
    # Build the prompt
    prompt = build_summarization_prompt(
        incident_explanation=incident_explanation,
        incident_id="INC-2024-001234",
        store_id="STORE-045",
        incident_type="Unauthorized Access Attempt",
        severity="3",
        risk_score="0.78",
        confidence="0.92"
    )
    
    # Example API call (requires google-generativeai package)
    # import google.generativeai as genai
    # 
    # genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    # model = genai.GenerativeModel('gemini-2.0-flash-exp')
    # 
    # response = model.generate_content(
    #     prompt,
    #     generation_config={
    #         "temperature": 0.1,
    #         "response_mime_type": "application/json"
    #     }
    # )
    # 
    # result_json = json.loads(response.text)
    # return result_json
    
    print("Example prompt built successfully!")
    print("\nExpected output structure:")
    print(json.dumps(EXAMPLE_OUTPUT_JSON, indent=2))
    
    return EXAMPLE_OUTPUT_JSON


if __name__ == "__main__":
    summarize_incident_report_example()

