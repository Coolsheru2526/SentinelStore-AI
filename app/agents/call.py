import logging
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from config.comm_config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, get_store_contact
from config.logging_config import get_logger

logger = get_logger(__name__)

def call_execution_node(state):
    """Make voice call using Twilio API."""
    incident_id = state.get("incident_id", "unknown")
    
    if not state.get("execution_actions") or not state["execution_actions"].get("call"):
        logger.debug(f"[INCIDENT-{incident_id}] [CALL] No call action in execution_actions, skipping")
        return state
    
    c = state["execution_actions"]["call"]
    if not c.get("enabled", False):
        logger.debug(f"[INCIDENT-{incident_id}] [CALL] Call action disabled, skipping")
        return state

    logger.info(f"[INCIDENT-{incident_id}] [CALL] Starting call execution")

    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_PHONE_NUMBER:
        logger.error(f"[INCIDENT-{incident_id}] [CALL] Twilio credentials not configured")
        state["episode_memory"].append("CALL ERROR: Twilio credentials not configured")
        state["execution_results"]["call"] = {"status": "failed", "error": "Credentials missing"}
        return state

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        store_id = state.get("store_id", "default")
        to_phone = c.get("to") or get_store_contact(store_id, "phone")
        # Get subject from execution_actions for context/tracking
        subject = state["execution_actions"]["call"].get("subject", "")
        script = c.get("script", "This is an automated alert regarding an incident at your store.")
        
        # Optionally prefix script with subject if provided
        if subject:
            script = f"{subject}. {script}"
        
        logger.info(f"[INCIDENT-{incident_id}] [CALL] Initiating call to {to_phone} from {TWILIO_PHONE_NUMBER}")
        logger.debug(f"[INCIDENT-{incident_id}] [CALL] Script: {script[:100]}...")
        
        # Create TwiML for the call
        twiml_response = VoiceResponse()
        twiml_response.say(script, voice='alice', language='en-US')
        
        # Commented out actual call due to limited credit
        # call = client.calls.create(
        #     to=to_phone,
        #     from_=TWILIO_PHONE_NUMBER,
        #     twiml=twiml_response.to_xml()
        # )
        
        print("Call is made for now")
        
        logger.info(f"[INCIDENT-{incident_id}] [CALL] Call simulated successfully")
        
        state["execution_results"]["call"] = {
            "status": "simulated",
            "to": to_phone,
            "from": TWILIO_PHONE_NUMBER,
            "subject": subject if subject else None
        }
        state["episode_memory"].append(f"Call simulated to {to_phone}")
        
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [CALL] Call failed: {str(e)}", exc_info=True)
        state["episode_memory"].append(f"CALL ERROR: {str(e)}")
        state["execution_results"]["call"] = {"status": "failed", "error": str(e)}
    
    return state
