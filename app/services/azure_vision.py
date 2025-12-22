"""
Azure Vision service for processing images.
"""
import os
import base64
import logging
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.core.credentials import AzureKeyCredential
from config.logging_config import get_logger
from dotenv import load_dotenv
load_dotenv()

logger = get_logger(__name__)

# Load Azure Vision credentials from environment
AZURE_VISION_ENDPOINT = os.getenv("AZURE_VISION_ENDPOINT", "")
AZURE_VISION_KEY = os.getenv("AZURE_VISION_KEY", "")

def get_vision_client():
    """Get Azure Vision client."""
    if not AZURE_VISION_ENDPOINT or not AZURE_VISION_KEY:
        logger.warning("Azure Vision credentials not configured")
        return None
    
    try:
        client = ImageAnalysisClient(
            endpoint=AZURE_VISION_ENDPOINT,
            credential=AzureKeyCredential(AZURE_VISION_KEY)
        )
        return client
    except Exception as e:
        logger.error(f"Failed to create Vision client: {e}", exc_info=True)
        return None

from azure.ai.vision.imageanalysis import (
    ImageAnalysisClient,
)
from azure.core.credentials import AzureKeyCredential

def process_image(image_data: bytes) -> dict:
    client = get_vision_client()
    if not client:
        return {
            "processed": False,
            "error": "Vision service not configured",
            "objects": [],
            "people": [],
            "text": "",
            "caption": ""
        }

    try:
        # Analyze the image with specified features[citation:9]
        result = client.analyze(
            image_data=image_data,
            visual_features=[
                "objects",  
                "people",   
                "read",     
                "caption",
                # "dense_captions"   
            ]
        )

        objects = result.objects.as_dict()
        people = result.people.as_dict()
        text_lines = result.read.as_dict()
        caption_text = result.caption.as_dict()
        # dense_text = result.dense_captions.as_dict()

        observation = {
            "processed": True,
            "objects": objects,
            "people": people,
            "text": " ".join(text_lines),
            "caption": caption_text,
            # "description":dense_text
        }
        print(observation)
        logger.info(
            f"Vision OK | objects={len(objects)} people={len(people)} text_lines={len(text_lines)}"
        )
        return observation

    except Exception as e:
        logger.error(f"Vision processing failed: {e}", exc_info=True)
        return {
            "processed": False,
            "error": str(e),
            "objects": [],
            "people": [],
            "text": "",
            "caption": ""
        }

def decode_base64_image(base64_string: str) -> bytes:
    """Decode base64 string to image bytes."""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_bytes = base64.b64decode(base64_string)
        return image_bytes
    except Exception as e:
        logger.error(f"Failed to decode base64 image: {e}", exc_info=True)
        raise

