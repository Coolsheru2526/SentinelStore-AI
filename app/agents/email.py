import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from config.comm_config import SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, get_store_contact
from config.logging_config import get_logger

logger = get_logger(__name__)

def email_execution_node(state):
    """Send email using Twilio SendGrid API."""
    incident_id = state.get("incident_id", "unknown")
    
    if not state.get("execution_actions") or not state["execution_actions"].get("email"):
        logger.debug(f"[INCIDENT-{incident_id}] [EMAIL] No email action in execution_actions, skipping")
        return state
    
    e = state["execution_actions"]["email"]
    if not e.get("enabled", False):
        logger.debug(f"[INCIDENT-{incident_id}] [EMAIL] Email action disabled, skipping")
        return state

    logger.info(f"[INCIDENT-{incident_id}] [EMAIL] Starting email execution")

    if not SENDGRID_API_KEY:
        logger.error(f"[INCIDENT-{incident_id}] [EMAIL] SendGrid API key not configured")
        state["episode_memory"].append("EMAIL ERROR: SendGrid API key not configured")
        state["execution_results"]["email"] = {"status": "failed", "error": "API key missing"}
        return state

    try:
        store_id = state.get("store_id", "default")
        to_email = e.get("to") or get_store_contact(store_id, "email")
        # Get subject from execution_actions - required field
        subject = state["execution_actions"]["email"].get("subject", "Incident Alert")
        body = e.get("body", "")
        
        logger.info(f"[INCIDENT-{incident_id}] [EMAIL] Sending email to {to_email} with subject: {subject}")
        logger.debug(f"[INCIDENT-{incident_id}] [EMAIL] Body length: {len(body)} chars")

        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            plain_text_content=body
        )

        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        logger.info(f"[INCIDENT-{incident_id}] [EMAIL] Email sent successfully - Status: {response.status_code}")
        
        state["execution_results"]["email"] = {
            "status": "sent",
            "status_code": response.status_code,
            "to": to_email,
            "subject": subject
        }
        state["episode_memory"].append(f"Email sent to {to_email}")
        
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [EMAIL] Email sending failed: {str(e)}", exc_info=True)
        state["episode_memory"].append(f"EMAIL ERROR: {str(e)}")
        state["execution_results"]["email"] = {"status": "failed", "error": str(e)}
    
    return state