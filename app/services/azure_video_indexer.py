"""
Azure Video Indexer – Service Module (ARM-based)
Designed to be called from backend (FastAPI / Flask / workers)
NO main(), NO CLI dependency
"""

import os
import time
import requests
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential
import uuid
from datetime import datetime

# -------------------------------------------------
# ENV
# -------------------------------------------------

load_dotenv()

SUBSCRIPTION_ID = os.getenv("AZURE_SUBSCRIPTION_ID")
RESOURCE_GROUP = os.getenv("AZURE_RESOURCE_GROUP")
ACCOUNT_NAME = os.getenv("AZURE_VIDEO_INDEXER_ACCOUNT_NAME")   # ARM resource name
ACCOUNT_ID = os.getenv("AZURE_VIDEO_INDEXER_ACCOUNT_ID")       # Video Indexer Account ID
REGION = os.getenv("AZURE_VIDEO_INDEXER_REGION", "eastus")

if not all([SUBSCRIPTION_ID, RESOURCE_GROUP, ACCOUNT_NAME, ACCOUNT_ID]):
    raise RuntimeError("Missing Azure Video Indexer configuration in .env")

# -------------------------------------------------
# CONSTANTS
# -------------------------------------------------

ARM_ENDPOINT = "https://management.azure.com"
VIDEO_INDEXER_ENDPOINT = "https://api.videoindexer.ai"
ARM_API_VERSION = "2024-01-01"

# -------------------------------------------------
# AUTH (SERVICE PRINCIPAL / MANAGED IDENTITY)
# -------------------------------------------------

def _get_arm_token() -> str:
    """
    Authentication priority:
    1. Service Principal via env vars (LOCAL DEV)
    2. Managed Identity (AZURE)
    """

    credential = DefaultAzureCredential(
        exclude_interactive_browser_credential=True,
        exclude_visual_studio_code_credential=True,
        exclude_azure_cli_credential=True
    )

    token = credential.get_token("https://management.azure.com/.default")
    return token.token


def _get_video_indexer_token(permission: str = "Contributor", scope: str = "Account") -> str:
    """
    Generate Video Indexer access token via ARM
    """

    arm_token = _get_arm_token()

    url = (
        f"{ARM_ENDPOINT}/subscriptions/{SUBSCRIPTION_ID}"
        f"/resourceGroups/{RESOURCE_GROUP}"
        f"/providers/Microsoft.VideoIndexer/accounts/{ACCOUNT_NAME}"
        f"/generateAccessToken?api-version={ARM_API_VERSION}"
    )

    headers = {
        "Authorization": f"Bearer {arm_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "permissionType": permission,
        "scope": scope,
    }

    resp = requests.post(url, headers=headers, json=payload, timeout=10)
    resp.raise_for_status()

    return resp.json()["accessToken"]

# -------------------------------------------------
# CORE VIDEO OPERATIONS
# -------------------------------------------------

def upload_video_bytes(video_bytes: bytes, filename: str) -> str:
    token = _get_video_indexer_token()

    unique_name = (
        f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_"
        f"{uuid.uuid4().hex[:8]}_{filename}"
    )

    url = f"{VIDEO_INDEXER_ENDPOINT}/{REGION}/Accounts/{ACCOUNT_ID}/Videos"

    params = {
        "accessToken": token,
        "name": unique_name,
        "privacy": "Private",
    }

    files = {
        "file": (unique_name, video_bytes, "video/mp4")
    }

    resp = requests.post(url, params=params, files=files)
    resp.raise_for_status()

    return resp.json()["id"]

def wait_for_video_processing(video_id: str, timeout_sec: int = 600) -> bool:
    """
    Poll until video processing completes
    """

    token = _get_video_indexer_token()
    start = time.time()

    while True:
        url = (
            f"{VIDEO_INDEXER_ENDPOINT}/{REGION}/Accounts/{ACCOUNT_ID}"
            f"/Videos/{video_id}/Index"
        )

        resp = requests.get(url, params={"accessToken": token}, timeout=10)
        resp.raise_for_status()

        state = resp.json().get("state")

        if state == "Processed":
            return True
        if state == "Failed":
            return False

        if time.time() - start > timeout_sec:
            raise TimeoutError("Video processing timed out")

        time.sleep(8)


def get_video_insights(video_id: str) -> dict:
    """
    Fetch indexed insights JSON
    """

    token = _get_video_indexer_token()

    url = (
        f"{VIDEO_INDEXER_ENDPOINT}/{REGION}/Accounts/{ACCOUNT_ID}"
        f"/Videos/{video_id}/Index"
    )

    resp = requests.get(url, params={"accessToken": token}, timeout=20)
    resp.raise_for_status()

    return resp.json()


def get_video_thumbnails(video_id: str) -> dict | None:
    """
    Get thumbnail metadata (OPTIONAL).
    Returns None if thumbnails are not available.
    """

    token = _get_video_indexer_token()

    url = (
        f"{VIDEO_INDEXER_ENDPOINT}/{REGION}/Accounts/{ACCOUNT_ID}"
        f"/Videos/{video_id}/Thumbnails"
    )

    resp = requests.get(url, params={"accessToken": token}, timeout=20)

    if resp.status_code == 404:
        # Thumbnails are optional in Video Indexer
        return None

    resp.raise_for_status()
    return resp.json()

def download_thumbnail(video_id: str, thumbnail_id: str) -> bytes:
    """
    Download thumbnail image bytes
    """

    token = _get_video_indexer_token()

    url = (
        f"{VIDEO_INDEXER_ENDPOINT}/{REGION}/Accounts/{ACCOUNT_ID}"
        f"/Videos/{video_id}/Thumbnails/{thumbnail_id}"
    )

    resp = requests.get(
        url,
        params={
            "accessToken": token,
            "format": "Jpeg"
        },
        timeout=20
    )
    resp.raise_for_status()

    return resp.content

# -------------------------------------------------
# HIGH-LEVEL PIPELINE (BACKEND ENTRYPOINT)
# -------------------------------------------------

def process_video_bytes(video_bytes: bytes, filename: str) -> dict:
    """
    End-to-end processing for backend usage
    """

    video_id = upload_video_bytes(video_bytes, filename)

    processed = wait_for_video_processing(video_id)
    if not processed:
        raise RuntimeError("Video indexing failed")
    
    thumbnails = get_video_thumbnails(video_id)

    return {
        "video_id": video_id,
        "insights": get_video_insights(video_id),
        "thumbnails": thumbnails,
    }


# -------------------------------------------------
# COMPATIBILITY FUNCTION (USED BY YOUR APP)
# -------------------------------------------------

def process_video(video_bytes: bytes, filename: str = "uploaded_video.mp4") -> dict:
    return process_video_bytes(video_bytes, filename)
