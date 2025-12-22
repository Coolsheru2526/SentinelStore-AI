import os
import logging
import azure.cognitiveservices.speech as speechsdk
from config.logging_config import get_logger
from dotenv import load_dotenv
load_dotenv()

logger = get_logger(__name__)

def voice_execution_node(state):
    incident_id = state.get("incident_id", "unknown")
    
    if not state.get("execution_actions") or not state["execution_actions"].get("announce"):
        logger.debug(f"[INCIDENT-{incident_id}] [VOICE] No announce action in execution_actions, skipping")
        return state
    
    a = state["execution_actions"]["announce"]
    if not a.get("enabled", False):
        logger.debug(f"[INCIDENT-{incident_id}] [VOICE] Voice announcement disabled, skipping")
        return state

    logger.info(f"[INCIDENT-{incident_id}] [VOICE] Starting voice announcement")
    
    azure_speech_key = os.getenv("AZURE_SPEECH_KEY", "")
    azure_region = os.getenv("AZURE_SPEECH_REGION", "")
    
    if not azure_speech_key or not azure_region:
        logger.error(f"[INCIDENT-{incident_id}] [VOICE] Azure Speech credentials not configured")
        state.setdefault("execution_results", {})["voice"] = {"status": "failed", "error": "Credentials missing"}
        return state

    try:
        text = a.get("text", "")
        logger.info(f"[INCIDENT-{incident_id}] [VOICE] Synthesizing speech: {text[:50]}...")
        
        synthesizer = speechsdk.SpeechSynthesizer(
            speechsdk.SpeechConfig(
                subscription=azure_speech_key,
                region=azure_region
            )
        )
        synthesizer.speak_text_async(text)
        
        logger.info(f"[INCIDENT-{incident_id}] [VOICE] Voice announcement completed")
        state.setdefault("execution_results", {})["voice"] = {"status": "sent", "text": text}
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [VOICE] Voice announcement failed: {str(e)}", exc_info=True)
        state.setdefault("execution_results", {})["voice"] = {"status": "failed", "error": str(e)}
    
    return state
