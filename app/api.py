from fastapi import FastAPI, File, UploadFile
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
import os
from dotenv import load_dotenv
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
logger.info(f"RAG Engine initialized with {len(vector_store.documents)} policy documents")

app = FastAPI()
logger.info("FastAPI application initialized")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health():
    logger.debug("Health check requested")
    return {"status": "ok"}

@app.get("/info", tags=["System"])
def info():
    logger.debug("Info endpoint requested")
    return {
        "available_endpoints": ["/incident", "/human/{incident_id}", "/health", "/info"],
        "description": "Retail Autonomous Incident System API, Azure OpenAI LLM, dynamic RAG policies."
    }

INCIDENTS = {}

@app.post("/incident", response_model=IncidentCreateResponse, tags=["Incidents"])
def create_incident(payload: IncidentCreateRequest):
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
    
    # Initialize complete state according to IncidentState TypedDict
    state = {
        # Identity
        "incident_id": incident_id,
        "store_id": payload.store_id,
        
        # Observations (processed by Azure services)
        "vision_observation": vision_observation,
        "audio_observation": audio_observation,
        
        # ReAct judged signals (will be populated by vision/speech nodes)
        "vision_signal": None,
        "audio_signal": None,
        
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
        INCIDENTS[incident_id] = incident_graph.invoke(state)
        logger.info(f"[INCIDENT-{incident_id}] Graph execution completed. Resolved: {INCIDENTS[incident_id].get('resolved', False)}")
        return {"incident_id": incident_id}
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] Graph execution failed: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/human/{incident_id}", tags=["Incidents"])
def human_decision(incident_id: str, payload: HumanDecisionRequest):
    logger.info(f"[INCIDENT-{incident_id}] Human decision received: {payload.decision}")
    if incident_id not in INCIDENTS:
        logger.warning(f"[INCIDENT-{incident_id}] Incident not found")
        return JSONResponse(status_code=404, content={"error":"Incident not found."})
    INCIDENTS[incident_id]["human_decision"] = payload.decision
    try:
        logger.info(f"[INCIDENT-{incident_id}] Resuming graph execution with human decision...")
        INCIDENTS[incident_id] = incident_graph.invoke(INCIDENTS[incident_id])
        logger.info(f"[INCIDENT-{incident_id}] Graph resumed successfully")
        return {"status":"resumed"}
    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] Graph resume failed: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error":str(e)})
