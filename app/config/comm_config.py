import os
from dotenv import load_dotenv

load_dotenv()

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")  # Your Twilio number

# SendGrid Configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "alerts@yourdomain.com")

# Store-specific contact mappings (can be loaded from DB/config file)
STORE_CONTACTS = {
    "store_1": {
        "email": os.getenv("STORE_1_EMAIL", "manager@store.com"),
        "phone": os.getenv("STORE_1_PHONE", "+1234567890")
    },
    "default": {
        "email": os.getenv("DEFAULT_STORE_EMAIL", "manager@store.com"),
        "phone": os.getenv("DEFAULT_STORE_PHONE", "+1234567890")
    }
}

def get_store_contact(store_id: str, contact_type: str = "email"):
    """Get store-specific contact info, fallback to default."""
    store_info = STORE_CONTACTS.get(store_id, STORE_CONTACTS["default"])
    return store_info.get(contact_type, STORE_CONTACTS["default"][contact_type])

