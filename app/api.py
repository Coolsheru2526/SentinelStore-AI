from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
import logging
from langchain_openai import AzureChatOpenAI
import base64
from pydantic import ValidationError
from schemas import IncidentCreateRequest, IncidentCreateResponse, HumanDecisionRequest
from graph import incident_graph
from openai import AzureOpenAI
from rag.loader import load_store_policy
from rag.rag_engine import RAGEngine
from config.logging_config import setup_logging, get_logger
from services.azure_vision import process_image, decode_base64_image
from services.azure_speech import process_audio, decode_base64_audio
# from services.azure_video_indexer import process_video  # Commented out - using direct frame extraction instead
import os
from dotenv import load_dotenv
from database import connect_to_mongo, close_mongo_connection, incidents_collection
from auth_router import router as auth_router
from models import User
from auth import get_current_user
load_dotenv()
# Setup logging
setup_logging(logging.INFO)
logger = get_logger(__name__)

AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY", "")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "")
from langchain_openai import AzureChatOpenAI
import os

AZURE_CHAT_DEPLOYMENT = "gpt-4.1"

llm = AzureChatOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    api_key=os.environ["AZURE_OPENAI_KEY"],
    api_version="2025-01-01-preview",
    deployment_name=AZURE_CHAT_DEPLOYMENT,
    temperature=0.2,
)

import os
import json as _json

vector_store = load_store_policy("rag/policy.txt")
rag_engine = RAGEngine(vector_store)
logger.info(f"RAG Engine initialized with {vector_store.collection.count()} policy documents")

app = FastAPI()
logger.info("FastAPI application initialized")

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

def sanitize_state_for_json(state: dict) -> dict:
    """Remove or convert binary data from state to make it JSON-serializable."""
    if not isinstance(state, dict):
        return state
    
    sanitized = {}
    for key, value in state.items():
        if value is None:
            sanitized[key] = None
        elif isinstance(value, bytes):
            # For binary data, just indicate its presence and size (don't send actual bytes)
            sanitized[key] = f"<binary data: {len(value)} bytes>"
        elif isinstance(value, dict):
            # Recursively sanitize nested dictionaries
            sanitized_value = sanitize_state_for_json(value)
            # Special handling for video_observation - remove video_bytes entirely
            if key in ['vision_observation', 'audio_observation', 'video_observation']:
                # Remove binary data from observations, keep only metadata
                if 'video_bytes' in sanitized_value:
                    sanitized_value = {k: v for k, v in sanitized_value.items() if k != 'video_bytes'}
                    sanitized_value['_note'] = 'video_bytes removed for JSON serialization'
                if 'image_bytes' in sanitized_value:
                    sanitized_value = {k: v for k, v in sanitized_value.items() if k != 'image_bytes'}
                    sanitized_value['_note'] = 'image_bytes removed for JSON serialization'
                if 'audio_bytes' in sanitized_value:
                    sanitized_value = {k: v for k, v in sanitized_value.items() if k != 'audio_bytes'}
                    sanitized_value['_note'] = 'audio_bytes removed for JSON serialization'
            sanitized[key] = sanitized_value
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_state_for_json(item) if isinstance(item, dict) else
                (f"<binary data: {len(item)} bytes>" if isinstance(item, bytes) else item)
                for item in value
            ]
        elif isinstance(value, (str, int, float, bool)):
            sanitized[key] = value
        else:
            # For other types (like objects), convert to string
            try:
                sanitized[key] = str(value)
            except Exception:
                sanitized[key] = "<non-serializable object>"
    
    return sanitized

@app.get("/health", tags=["System"])
def health():
    logger.debug("Health check requested")
    return {"status": "ok"}

@app.get("/info", tags=["System"])
def info():
    logger.debug("Info endpoint requested")
    return {
        "available_endpoints": ["/auth/login", "/auth/register", "/incident", "/human/{incident_id}", "/health", "/info"],
        "description": "Retail Autonomous Incident System API with MongoDB and Authentication."
    }

@app.post("/incident", response_model=IncidentCreateResponse, tags=["Incidents"])
async def create_incident(payload: IncidentCreateRequest, current_user: User = Depends(get_current_user)):
    """Create a new incident and run through initial state machine."""
    # Check if user has access to the store
    if current_user.store_id != payload.store_id:
        raise HTTPException(status_code=403, detail="Access denied: Incident store does not match user store")

    incident_id = str(uuid.uuid4())
    logger.info(f"[INCIDENT-{incident_id}] Creating new incident for store: {payload.store_id} by user: {current_user.username}")
    logger.debug(f"[INCIDENT-{incident_id}] Payload: store_id={payload.store_id}, signals={payload.signals}")
    """Create a new incident and run through initial state machine."""
    incident_id = str(uuid.uuid4())
    logger.info(f"[INCIDENT-{incident_id}] Creating new incident for store: {payload.store_id}")
    logger.debug(f"[INCIDENT-{incident_id}] Payload: store_id={payload.store_id}, signals={payload.signals}")
    
    # Process vision observation if provided
    vision_observation = None
    if payload.vision_observation:
        try:
            logger.info(f"[INCIDENT-{incident_id}] Processing vision observation with Azure Vision...")
            image_bytes = decode_base64_image(payload.vision_observation)
            vision_observation = process_image(image_bytes)
            logger.info(f"[INCIDENT-{incident_id}] Vision processing completed")
        except Exception as e:
            logger.error(f"[INCIDENT-{incident_id}] Vision processing failed: {e}", exc_info=True)
            vision_observation = {"error": str(e), "processed": False}
    
    # Process audio observation if provided
    audio_observation = None
    if payload.audio_observation:
        try:
            logger.info(f"[INCIDENT-{incident_id}] Processing audio observation with Azure Speech...")
            audio_bytes = decode_base64_audio(payload.audio_observation)
            audio_observation = process_audio(audio_bytes)
            logger.info(f"[INCIDENT-{incident_id}] Audio processing completed")
        except Exception as e:
            logger.error(f"[INCIDENT-{incident_id}] Audio processing failed: {e}", exc_info=True)
            audio_observation = {"error": str(e), "processed": False}
    
    # Process video observation if provided
    video_observation = None
    if payload.video_observation:
        try:
            logger.info(f"[INCIDENT-{incident_id}] Processing video observation - extracting frames for vision analysis...")
            video_bytes = decode_base64_image(payload.video_observation)  # Reuse decode function
            # NEW: Pass raw video bytes instead of using Azure Video Indexer
            video_observation = {"video_bytes": video_bytes, "filename": "uploaded_video.mp4"}
            logger.info(f"[INCIDENT-{incident_id}] Video bytes extracted for frame processing")
        except Exception as e:
            logger.error(f"[INCIDENT-{incident_id}] Video processing failed: {e}", exc_info=True)
            video_observation = {"error": str(e), "processed": False}
    
    # Initialize complete state according to IncidentState TypedDict
    state = {
        # Identity
        "incident_id": incident_id,
        "store_id": payload.store_id,
        
        # Observations (processed by Azure services)
        "vision_observation": vision_observation,
        "audio_observation": audio_observation,
        "video_observation": video_observation,
        
        # ReAct judged signals (will be populated by vision/speech nodes)
        "vision_signal": None,
        "audio_signal": None,
        "video_signal": None,
        
        # Fusion output (will be populated by fusion node)
        "fused_incident": None,
        
        # Memory
        "episode_memory": [],
        "working_memory": {},
        "long_term_context": None,
        
        # Understanding (will be populated by fusion/risk nodes)
        "incident_type": None,
        "confidence": 0.0,
        
        # Risk (will be populated by risk node)
        "severity": None,
        "risk_score": None,
        "requires_human": False,
        
        # Planning & execution (will be populated by planning/response nodes)
        "plan": None,
        "execution_actions": None,
        "execution_results": {},
        
        # Lifecycle
        "resolved": False,
        "escalation_required": False,
        "human_decision": None,
        
        # Explainability (will be populated by explainability node)
        "explanation": None,
        
        # Engines
        "rag_engine": rag_engine,
        "llm": llm,
        
        # Reflection (will be populated by self-reflection node)
        "reflection": None,
        "reflection_tags": None,
    }
    
    try:
        logger.info(f"[INCIDENT-{incident_id}] Invoking incident graph...")
        result_state = incident_graph.invoke(state)
        logger.info(f"[INCIDENT-{incident_id}] Graph execution completed. Resolved: {result_state.get('resolved', False)}")

        # Save to MongoDB - create serializable state
        serializable_state = {k: v for k, v in result_state.items() if k not in ['rag_engine', 'llm']}
        # Handle reflection separately if it's an AIMessage
        if 'reflection' in result_state and hasattr(result_state['reflection'], 'content'):
            serializable_state['reflection'] = result_state['reflection'].content
        elif 'reflection' in result_state:
            serializable_state['reflection'] = str(result_state['reflection'])

        incident_doc = {
            "_id": incident_id,
            "store_id": payload.store_id,
            "state": serializable_state,
            "resolved": result_state.get("resolved", False),
            "severity": result_state.get("severity"),
            "risk_score": result_state.get("risk_score"),
            "incident_type": result_state.get("incident_type"),
            "plan": str(result_state.get("plan")),
            "execution_results": str(result_state.get("execution_results")),
            "reflection": serializable_state.get("reflection"),
            "explanation": result_state.get("explanation")
        }
        await incidents_collection.insert_one(incident_doc)
        logger.info(f"[INCIDENT-{incident_id}] Saved to database")

        return {"incident_id": incident_id}
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] Graph execution failed: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/human/{incident_id}", tags=["Incidents"])
async def human_decision(incident_id: str, payload: HumanDecisionRequest, current_user: User = Depends(get_current_user)):
    logger.info(f"[INCIDENT-{incident_id}] Human decision received: {payload.decision} by user: {current_user.username}")

    incident_doc = await incidents_collection.find_one({"_id": incident_id})
    if not incident_doc:
        logger.warning(f"[INCIDENT-{incident_id}] Incident not found")
        return JSONResponse(status_code=404, content={"error":"Incident not found."})

    # Check store access
    if incident_doc["store_id"] != current_user.store_id:
        raise HTTPException(status_code=403, detail="Access denied: Incident store does not match user store")

    state = incident_doc["state"]
    state["human_decision"] = payload.decision
    # Add back the required objects for graph execution
    state["rag_engine"] = rag_engine
    state["llm"] = llm

    try:
        logger.info(f"[INCIDENT-{incident_id}] Resuming graph execution with human decision...")
        updated_state = incident_graph.invoke(state)
        logger.info(f"[INCIDENT-{incident_id}] Graph resumed successfully")

        # Update in MongoDB - create serializable state
        serializable_updated_state = {k: v for k, v in updated_state.items() if k not in ['rag_engine', 'llm']}
        if 'reflection' in updated_state and hasattr(updated_state['reflection'], 'content'):
            serializable_updated_state['reflection'] = updated_state['reflection'].content
        elif 'reflection' in updated_state:
            serializable_updated_state['reflection'] = str(updated_state['reflection'])

        await incidents_collection.update_one(
            {"_id": incident_id},
            {"$set": {
                "state": serializable_updated_state,
                "resolved": updated_state.get("resolved", False),
                "severity": updated_state.get("severity"),
                "risk_score": updated_state.get("risk_score"),
                "incident_type": updated_state.get("incident_type"),
                "plan": str(updated_state.get("plan")),
                "execution_results": str(updated_state.get("execution_results")),
                "reflection": serializable_updated_state.get("reflection"),
                "explanation": updated_state.get("explanation")
            }}
        )

        return {"status":"resumed"}
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] Graph resume failed: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error":str(e)})


@app.get("/incidents", tags=["Incidents"])
async def list_incidents(current_user: User = Depends(get_current_user)):
    """List recent incidents for the current user's store.

    Returns a lightweight summary of each incident plus key fields from the
    stored state so the frontend can render current status."""
    query = {"store_id": current_user.store_id}
    cursor = incidents_collection.find(query).sort("_id", -1).limit(20)
    docs = await cursor.to_list(length=20)

    incidents = []
    for doc in docs:
        state = doc.get("state", {})
        incidents.append({
            "incident_id": doc.get("_id"),
            "store_id": doc.get("store_id"),
            "incident_type": doc.get("incident_type") or state.get("incident_type"),
            "severity": doc.get("severity") or state.get("severity"),
            "risk_score": doc.get("risk_score") or state.get("risk_score"),
            "resolved": doc.get("resolved", False),
            "requires_human": state.get("requires_human"),
            "escalation_required": state.get("escalation_required"),
        })

    return {"incidents": incidents}


@app.get("/incident/{incident_id}", tags=["Incidents"])
async def get_incident(incident_id: str, current_user: User = Depends(get_current_user)):
    """Return full incident document including stored state for a single incident."""
    incident_doc = await incidents_collection.find_one({"_id": incident_id})
    if not incident_doc:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident_doc["store_id"] != current_user.store_id:
        raise HTTPException(status_code=403, detail="Access denied: Incident store does not match user store")

    state = incident_doc.get("state", {})
    
    # Sanitize state to remove binary data that can't be JSON-serialized
    sanitized_state = sanitize_state_for_json(state)

    return {
        "incident_id": incident_doc.get("_id"),
        "store_id": incident_doc.get("store_id"),
        "resolved": incident_doc.get("resolved", False),
        "severity": incident_doc.get("severity"),
        "risk_score": incident_doc.get("risk_score"),
        "incident_type": incident_doc.get("incident_type"),
        "plan": incident_doc.get("plan"),
        "execution_results": incident_doc.get("execution_results"),
        "explanation": incident_doc.get("explanation"),
        "state": sanitized_state,
    }
