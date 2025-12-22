"""
Azure Speech service for processing audio.
"""

import os
import base64
import azure.cognitiveservices.speech as speechsdk
from config.logging_config import get_logger
from dotenv import load_dotenv
load_dotenv()

logger = get_logger(__name__)

AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY", "")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "")

def process_audio(audio_data: bytes, language: str = "en-US") -> dict:
    if not AZURE_SPEECH_KEY or not AZURE_SPEECH_REGION:
        return {
            "processed": False,
            "error": "Speech service not configured",
            "transcript": "",
            "confidence": None,
            "language": language
        }

    try:
        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY,
            region=AZURE_SPEECH_REGION
        )
        speech_config.speech_recognition_language = language

        stream_format = speechsdk.audio.AudioStreamFormat(
            samples_per_second=16000,
            bits_per_sample=16,
            channels=1
        )

        push_stream = speechsdk.audio.PushAudioInputStream(stream_format)
        push_stream.write(audio_data)
        push_stream.close()

        audio_config = speechsdk.audio.AudioConfig(stream=push_stream)

        recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            audio_config=audio_config
        )

        result = recognizer.recognize_once()
        print(result.text)
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return {
                "processed": True,
                "transcript": result.text,
                "confidence": None,  # Azure does not return confidence here
                "language": language
            }

        if result.reason == speechsdk.ResultReason.NoMatch:
            return {
                "processed": False,
                "error": "No speech detected",
                "transcript": "",
                "confidence": None,
                "language": language
            }

        return {
            "processed": False,
            "error": str(result.reason),
            "transcript": "",
            "confidence": None,
            "language": language
        }

    except Exception as e:
        logger.error(f"Audio processing failed: {e}", exc_info=True)
        return {
            "processed": False,
            "error": str(e),
            "transcript": "",
            "confidence": None,
            "language": language
        }


def decode_base64_audio(base64_string: str) -> bytes:
    """Decode base64 string to audio bytes."""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        audio_bytes = base64.b64decode(base64_string)
        return audio_bytes
    except Exception as e:
        logger.error(f"Failed to decode base64 audio: {e}", exc_info=True)
        raise
