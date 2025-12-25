"""
Gemini API service for report summarization.
"""

import os
import json
import logging
import time
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

try:
    import google.genai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-genai package not installed. Install with: pip install google-genai")


def get_gemini_client():
    """Initialize and return Gemini client."""
    if not GEMINI_AVAILABLE:
        raise RuntimeError("Gemini SDK not available. Install with: pip install google-genai")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not found in environment variables")

    client = genai.Client(api_key=api_key)
    return client


def summarize_incident_report(
    incident_explanation: str,
    incident_id: str = "",
    store_id: str = "",
    incident_type: str = "",
    severity: str = "",
    risk_score: str = "",
    confidence: str = ""
) -> Dict:
    """
    Summarize an incident explanation report using Gemini.

    Args:
        incident_explanation: The long text field containing the full explanation
        incident_id: Optional incident identifier
        store_id: Optional store identifier
        incident_type: Optional incident type classification
        severity: Optional severity level
        risk_score: Optional risk score value
        confidence: Optional confidence score value

    Returns:
        Dictionary containing the summarized report in the required JSON structure
    """
    if not GEMINI_AVAILABLE:
        raise RuntimeError("Gemini SDK not available")

    try:
        from services.report_summarization_prompt import build_summarization_prompt

        # Build the prompt
        prompt = build_summarization_prompt(
            incident_explanation=incident_explanation,
            incident_id=incident_id,
            store_id=store_id,
            incident_type=incident_type,
            severity=str(severity) if severity else "",
            risk_score=str(risk_score) if risk_score else "",
            confidence=str(confidence) if confidence else ""
        )

        # Get Gemini client
        client = get_gemini_client()

        # Call Gemini API with JSON response format and retry logic
        logger.info(f"Calling Gemini API for report summarization (Incident: {incident_id})")

        # Get available models and use the best available one
        available_models_list = []
        try:
            available_models = list(client.models.list())
            # Filter for Gemini models that support generation
            for m in available_models:
                if 'gemini' in m.name.lower():
                    # Check if model supports generateContent
                    if hasattr(m, 'supported_generation_methods'):
                        methods = str(m.supported_generation_methods).lower()
                        if 'generate' in methods or 'content' in methods:
                            available_models_list.append(m.name)
                    else:
                        # If we can't check, assume it supports generation
                        available_models_list.append(m.name)
            logger.info(f"Available Gemini models: {available_models_list}")
        except Exception as e:
            logger.warning(f"Could not list models: {str(e)}")

        # Use available models, or fallback to known good models
        # Priority: 2.5 models (newest) > 2.0 models (non-exp) > 2.0-exp
        if available_models_list:
            # Extract model names without 'models/' prefix and prioritize
            model_names = []
            for model_path in available_models_list:
                model_name = model_path.replace('models/', '')
                # Skip embedding models
                if 'embedding' in model_name.lower():
                    continue
                if '2.5' in model_name:
                    model_names.insert(0, model_name)  # Prioritize 2.5
                elif '2.0' in model_name and 'exp' not in model_name:
                    # Insert 2.0 (non-exp) after 2.5 but before exp
                    insert_pos = len([m for m in model_names if '2.5' in m])
                    model_names.insert(insert_pos, model_name)
                elif '2.0' in model_name:
                    model_names.append(model_name)  # Add 2.0-exp last
            # Remove duplicates while preserving order
            model_names = list(dict.fromkeys(model_names))
        else:
            # Fallback to known models if listing fails
            model_names = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']

        logger.info(f"Will try models in order: {model_names}")

        max_retries = 3
        base_delay = 1
        
        for attempt in range(max_retries):
            try:
                # Try each model name until one works
                response = None
                last_error = None
                quota_errors = []
                
                for model_name in model_names:
                    try:
                        logger.info(f"Attempting to use model: {model_name}")
                        
                        # Use the client's generate_content method directly with model name
                        # The SDK handles the model path internally
                        response = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                            config={
                                'temperature': 0.1,
                                'response_mime_type': 'application/json'
                            }
                        )
                        logger.info(f"Successfully used model: {model_name}")
                        break  # Success, exit model name loop
                    except Exception as model_error:
                        error_str = str(model_error).lower()
                        # Skip quota errors for this model, try next one
                        if "429" in error_str or "quota" in error_str or "resourceexhausted" in error_str:
                            logger.warning(f"Model {model_name} quota exceeded, trying next model...")
                            quota_errors.append((model_name, model_error))
                            last_error = model_error
                            continue
                        # For 404, try next model
                        elif "404" in error_str or "not found" in error_str:
                            logger.debug(f"Model {model_name} not found, trying next model...")
                            last_error = model_error
                            continue
                        else:
                            # Other errors, log and try next
                            logger.debug(f"Model {model_name} failed: {str(model_error)}")
                            last_error = model_error
                            continue
                
                if response is None:
                    # If all models failed due to quota, raise quota error with helpful message
                    if quota_errors and len(quota_errors) == len(model_names):
                        raise RuntimeError(
                            "All available Gemini models have exceeded their quota limits. "
                            "You are using the free tier which has limited requests. "
                            "Please upgrade to a paid plan at https://ai.google.dev/gemini-api/docs/rate-limits "
                            "or wait for the quota to reset (typically daily). "
                            f"Tried models: {[m[0] for m in quota_errors]}"
                        )
                    raise last_error if last_error else RuntimeError(
                        f"None of the models {model_names} are available. "
                        "Please check your API key and ensure you have access to Gemini models."
                    )

                # Parse the JSON response
                result_text = response.text.strip()

                # Remove any markdown code blocks if present
                if result_text.startswith("```json"):
                    result_text = result_text[7:]
                if result_text.startswith("```"):
                    result_text = result_text[3:]
                if result_text.endswith("```"):
                    result_text = result_text[:-3]

                result_text = result_text.strip()
                result_json = json.loads(result_text)

                logger.info(f"Successfully summarized report for incident {incident_id}")
                return result_json

            except Exception as e:
                error_message = str(e).lower()

                # Check if it's a quota exceeded error
                if "429" in error_message or "quota" in error_message or "resourceexhausted" in error_message:
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)  # Exponential backoff
                        logger.warning(f"Quota exceeded, retrying in {delay} seconds (attempt {attempt + 1}/{max_retries})")
                        time.sleep(delay)
                        continue
                    else:
                        # Final attempt failed
                        raise RuntimeError(
                            "Gemini API quota exceeded. You are using the free tier which has limited requests. "
                            "Please upgrade to a paid plan at https://ai.google.dev/gemini-api/docs/rate-limits "
                            "or wait for the quota to reset (typically daily). "
                            "Alternatively, consider using a different AI service."
                        )
                else:
                    # Not a quota error, re-raise immediately
                    raise

        # This should not be reached, but just in case
        raise RuntimeError("Failed to generate report after all retries")

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini JSON response: {e}")
        logger.error(f"Response text: {result_text[:500] if 'result_text' in locals() else 'N/A'}")
        raise ValueError(f"Invalid JSON response from Gemini: {str(e)}")
    except Exception as e:
        logger.error(f"Error summarizing report: {str(e)}", exc_info=True)
        raise


def summarize_response_plan(
    response_plan: str | list,
    incident_id: str = "",
    incident_type: str = "",
    severity: str = ""
) -> Dict:
    """
    Summarize an incident response plan using Gemini.

    Args:
        response_plan: The response plan text (string) or list of plan steps
        incident_id: Optional incident identifier
        incident_type: Optional incident type classification
        severity: Optional severity level

    Returns:
        Dictionary containing the summarized response plan in the required JSON structure
    """
    if not GEMINI_AVAILABLE:
        raise RuntimeError("Gemini SDK not available")

    try:
        from services.response_plan_prompt import build_response_plan_prompt

        # Build the prompt
        prompt = build_response_plan_prompt(
            response_plan=response_plan,
            incident_id=incident_id,
            incident_type=incident_type,
            severity=str(severity) if severity else ""
        )

        # Get Gemini client
        client = get_gemini_client()

        # Call Gemini API with JSON response format and retry logic
        logger.info(f"Calling Gemini API for response plan summarization (Incident: {incident_id})")

        # Get available models and use the best available one
        available_models_list = []
        try:
            available_models = list(client.models.list())
            # Filter for Gemini models that support generation
            for m in available_models:
                if 'gemini' in m.name.lower():
                    # Check if model supports generateContent
                    if hasattr(m, 'supported_generation_methods'):
                        methods = str(m.supported_generation_methods).lower()
                        if 'generate' in methods or 'content' in methods:
                            available_models_list.append(m.name)
                    else:
                        # If we can't check, assume it supports generation
                        available_models_list.append(m.name)
            logger.info(f"Available Gemini models: {available_models_list}")
        except Exception as e:
            logger.warning(f"Could not list models: {str(e)}")

        # Use available models, or fallback to known good models
        # Priority: 2.5 models (newest) > 2.0 models (non-exp) > 2.0-exp
        if available_models_list:
            # Extract model names without 'models/' prefix and prioritize
            model_names = []
            for model_path in available_models_list:
                model_name = model_path.replace('models/', '')
                # Skip embedding models
                if 'embedding' in model_name.lower():
                    continue
                if '2.5' in model_name:
                    model_names.insert(0, model_name)  # Prioritize 2.5
                elif '2.0' in model_name and 'exp' not in model_name:
                    # Insert 2.0 (non-exp) after 2.5 but before exp
                    insert_pos = len([m for m in model_names if '2.5' in m])
                    model_names.insert(insert_pos, model_name)
                elif '2.0' in model_name:
                    model_names.append(model_name)  # Add 2.0-exp last
            # Remove duplicates while preserving order
            model_names = list(dict.fromkeys(model_names))
        else:
            # Fallback to known models if listing fails
            model_names = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']

        logger.info(f"Will try models in order: {model_names}")

        max_retries = 3
        base_delay = 1
        
        for attempt in range(max_retries):
            try:
                # Try each model name until one works
                response = None
                last_error = None
                quota_errors = []
                
                for model_name in model_names:
                    try:
                        logger.info(f"Attempting to use model: {model_name}")
                        
                        # Use the client's generate_content method directly with model name
                        # The SDK handles the model path internally
                        response = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                            config={
                                'temperature': 0.1,
                                'response_mime_type': 'application/json'
                            }
                        )
                        logger.info(f"Successfully used model: {model_name}")
                        break  # Success, exit model name loop
                    except Exception as model_error:
                        error_str = str(model_error).lower()
                        # Skip quota errors for this model, try next one
                        if "429" in error_str or "quota" in error_str or "resourceexhausted" in error_str:
                            logger.warning(f"Model {model_name} quota exceeded, trying next model...")
                            quota_errors.append((model_name, model_error))
                            last_error = model_error
                            continue
                        # For 404, try next model
                        elif "404" in error_str or "not found" in error_str:
                            logger.debug(f"Model {model_name} not found, trying next model...")
                            last_error = model_error
                            continue
                        else:
                            # Other errors, log and try next
                            logger.debug(f"Model {model_name} failed: {str(model_error)}")
                            last_error = model_error
                            continue
                
                if response is None:
                    # If all models failed due to quota, raise quota error with helpful message
                    if quota_errors and len(quota_errors) == len(model_names):
                        raise RuntimeError(
                            "All available Gemini models have exceeded their quota limits. "
                            "You are using the free tier which has limited requests. "
                            "Please upgrade to a paid plan at https://ai.google.dev/gemini-api/docs/rate-limits "
                            "or wait for the quota to reset (typically daily). "
                            f"Tried models: {[m[0] for m in quota_errors]}"
                        )
                    raise last_error if last_error else RuntimeError(
                        f"None of the models {model_names} are available. "
                        "Please check your API key and ensure you have access to Gemini models."
                    )

                # Parse the JSON response
                result_text = response.text.strip()

                # Remove any markdown code blocks if present
                if result_text.startswith("```json"):
                    result_text = result_text[7:]
                if result_text.startswith("```"):
                    result_text = result_text[3:]
                if result_text.endswith("```"):
                    result_text = result_text[:-3]

                result_text = result_text.strip()
                result_json = json.loads(result_text)

                logger.info(f"Successfully summarized response plan for incident {incident_id}")
                return result_json

            except Exception as e:
                error_message = str(e).lower()

                # Check if it's a quota exceeded error
                if "429" in error_message or "quota" in error_message or "resourceexhausted" in error_message:
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)  # Exponential backoff
                        logger.warning(f"Quota exceeded, retrying in {delay} seconds (attempt {attempt + 1}/{max_retries})")
                        time.sleep(delay)
                        continue
                    else:
                        # Final attempt failed
                        raise RuntimeError(
                            "Gemini API quota exceeded. You are using the free tier which has limited requests. "
                            "Please upgrade to a paid plan at https://ai.google.dev/gemini-api/docs/rate-limits "
                            "or wait for the quota to reset (typically daily). "
                            "Alternatively, consider using a different AI service."
                        )
                else:
                    # Not a quota error, re-raise immediately
                    raise

        # This should not be reached, but just in case
        raise RuntimeError("Failed to generate response plan summary after all retries")

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini JSON response: {e}")
        logger.error(f"Response text: {result_text[:500] if 'result_text' in locals() else 'N/A'}")
        raise ValueError(f"Invalid JSON response from Gemini: {str(e)}")
    except Exception as e:
        logger.error(f"Error summarizing response plan: {str(e)}", exc_info=True)
        raise