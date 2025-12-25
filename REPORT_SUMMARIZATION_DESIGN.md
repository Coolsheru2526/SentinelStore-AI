# Incident Report Summarization Design

## Overview
This document contains the **FINAL PROMPT** and **EXAMPLE OUTPUT** for the Gemini 3 Pro Preview API to summarize long incident explanation reports into clean, audit-friendly documents.

---

## 1. FINAL PROMPT TEXT

```
You are an enterprise compliance report generator specializing in retail security incident documentation.

TASK:
Summarize the provided incident explanation report into a concise, professional, audit-ready document suitable for store managers, security teams, and compliance audits.

INPUT DATA:
{incident_metadata}

INCIDENT EXPLANATION TEXT:
{incident_explanation}

STRICT INSTRUCTIONS:

1. CONTENT REDUCTION:
   - Reduce the explanation to 1-2 pages of executive-friendly content
   - Remove ALL duplicated policy text and tables
   - Remove ALL raw SOP documents and procedure listings
   - Remove ALL severity classification tables
   - Remove ALL redundant explanations
   - Remove ALL references to internal memory systems, RAG engines, or technical implementation details

2. PRESERVATION REQUIREMENTS:
   - Preserve ALL decision reasoning and accountability information
   - Preserve incident classification rationale
   - Preserve risk assessment logic
   - Preserve action taken details
   - Extract policy references (ID, version, date) if present in the text

3. TONE AND LANGUAGE:
   - Use formal, enterprise-grade language
   - Maintain neutral, factual tone
   - Write for executive and compliance audiences
   - Avoid casual language, technical jargon, or internal system references
   - Use professional business terminology

4. HALLUCINATION PREVENTION:
   - DO NOT invent new facts not present in the input
   - DO NOT add information not explicitly stated
   - DO NOT modify incident details, severity, or risk scores
   - DO NOT create policy references that don't exist in the input
   - Only summarize and restructure what is provided

5. OUTPUT FORMAT:
   - Return ONLY valid JSON
   - No markdown formatting
   - No explanatory text outside the JSON
   - No code blocks or formatting markers
   - The JSON must be directly parseable

REQUIRED JSON SCHEMA:
{
  "report_title": "Incident Explanation Report",
  "incident_overview": {
    "incident_id": "<extract from metadata or leave empty string>",
    "store_id": "<extract from metadata or leave empty string>",
    "incident_type": "<extract from metadata or leave empty string>",
    "severity": "<extract from metadata or leave empty string>",
    "risk_score": "<extract from metadata or leave empty string>",
    "confidence": "<extract from metadata or leave empty string>"
  },
  "executive_summary": "<4-5 line summary of the incident, classification, and key outcomes>",
  "decision_rationale": [
    "<bullet point 1: why this severity/classification was chosen>",
    "<bullet point 2: key factors in decision>",
    "<bullet point 3: additional reasoning>"
  ],
  "actions_taken": [
    "<bullet point 1: action executed>",
    "<bullet point 2: action executed>",
    "<bullet point 3: action executed>"
  ],
  "policy_reference": {
    "policy_id": "<extract if present, otherwise empty string>",
    "version": "<extract if present, otherwise empty string>",
    "effective_date": "<extract if present, otherwise empty string>"
  },
  "notes": "This report was generated using AI summarization for transparency and audit purposes."
}

CONTENT GUIDELINES:
- Executive summary: Maximum 4-5 sentences, high-level overview
- Decision rationale: 3-5 bullet points, each explaining a key decision factor
- Actions taken: 2-6 bullet points, each describing a specific action executed
- Policy reference: Extract only if explicitly mentioned in the input text
- Notes: Always include the AI generation transparency statement

Begin processing now. Return ONLY the JSON object, no other text.
```

**Note:** Replace `{incident_metadata}` and `{incident_explanation}` with actual values when calling the API.

---

## 2. EXAMPLE JSON OUTPUT (MOCK DATA)

```json
{
  "report_title": "Incident Explanation Report",
  "incident_overview": {
    "incident_id": "INC-2024-001234",
    "store_id": "STORE-045",
    "incident_type": "Unauthorized Access Attempt",
    "severity": "3",
    "risk_score": "0.78",
    "confidence": "0.92"
  },
  "executive_summary": "An unauthorized access attempt was detected at Store 045, classified as Severity Level 3 based on observed behavioral patterns and historical precedent. The system assessed a risk score of 0.78 with 92% confidence, triggering automated security protocols. Immediate response actions were executed including in-store announcements and manager notification. The incident was resolved without escalation to emergency services.",
  "decision_rationale": [
    "Visual observations indicated suspicious behavior patterns consistent with unauthorized access attempts",
    "Historical incident data showed similar patterns requiring Severity Level 3 classification",
    "Risk assessment algorithms calculated elevated risk score (0.78) based on behavioral indicators",
    "Policy-defined escalation thresholds for this incident category mandated Level 3 classification"
  ],
  "actions_taken": [
    "Automated in-store security announcement broadcasted",
    "Store manager notified via email and SMS",
    "Incident logged in security monitoring system",
    "Video evidence archived for review"
  ],
  "policy_reference": {
    "policy_id": "SEC-POL-2024-003",
    "version": "2.1",
    "effective_date": "2024-01-15"
  },
  "notes": "This report was generated using AI summarization for transparency and audit purposes."
}
```

---

## 3. Implementation Files

The prompt and helper functions are available in:
- **`app/services/report_summarization_prompt.py`** - Main prompt and helper function
- **`app/services/report_summarization_example.py`** - Usage example

---

## 4. Usage Example

```python
from app.services.report_summarization_prompt import build_summarization_prompt
import google.generativeai as genai
import os

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Build prompt
prompt = build_summarization_prompt(
    incident_explanation=long_explanation_text,
    incident_id="INC-2024-001234",
    store_id="STORE-045",
    incident_type="Unauthorized Access Attempt",
    severity="3",
    risk_score="0.78",
    confidence="0.92"
)

# Call API
response = model.generate_content(
    prompt,
    generation_config={
        "temperature": 0.1,
        "response_mime_type": "application/json"
    }
)

# Parse result
result_json = json.loads(response.text)
```

---

## 5. Key Design Decisions

1. **Structured JSON Output**: Ensures consistent parsing for PDF/DOCX generation
2. **Strict Content Filtering**: Removes policy tables, SOP documents, and technical jargon
3. **Preservation of Accountability**: Maintains decision rationale and action details
4. **Hallucination Prevention**: Explicit instructions to only use provided information
5. **Audit Transparency**: Includes AI generation note for compliance

---

## 6. Output Validation

The JSON output should:
- ✅ Be directly parseable (no markdown, no code blocks)
- ✅ Contain all required fields
- ✅ Have executive_summary as 4-5 sentences
- ✅ Have decision_rationale as 3-5 bullet points
- ✅ Have actions_taken as 2-6 bullet points
- ✅ Include AI transparency note
- ✅ Be suitable for PDF/DOCX generation

