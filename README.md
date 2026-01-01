# SentinelStore-AI

An intelligent, multi-agent AI system built with LangGraph that autonomously detects, assesses, and responds to retail incidents using multimodal inputs (vision + audio), RAG-enhanced policy retrieval, and automated communication channels.

## 🎯 Overview

This system combines **Azure OpenAI**, **LangGraph**, **RAG (Retrieval-Augmented Generation)**, **Video Processing**, and **Twilio/SendGrid** to create an autonomous incident management pipeline for retail environments. It processes visual, audio, and video observations, assesses risk, plans responses, executes communications (voice, email, calls), and learns from outcomes through self-reflection.

### Key Capabilities

- **Multimodal Incident Detection**: Processes visual (images), audio, and video inputs
- **Video Analysis**: Real-time video processing for security and incident detection
- **Intelligent Risk Assessment**: AI-powered severity scoring and human-in-the-loop decisions
- **Automated Response Planning**: Generates context-aware response plans using RAG-retrieved policies
- **Multi-Channel Communication**: Sends voice announcements, emails, and phone calls via Twilio/SendGrid
- **Self-Learning**: Reflects on outcomes and updates long-term memory
- **Explainability**: Provides reasoning and policy justification for decisions

## Architecture

### System Components

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Layer                           │
│                                                              │
│  ┌──────────────┐     ┌──────────────────┐                  │
│  │  Streamlit   │     │   Frontend Apps   │                  │
│  │  Testbench   │     │ (POS / IoT / CCTV)│                  │
│  └──────┬───────┘     └─────────┬────────┘                  │
│         │                         │                           │
└─────────┼─────────────────────────┼───────────────────────────┘
          ▼                         ▼
┌──────────────────────────────────────────────────────────────┐
│                         API Layer                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    FastAPI Server                       │ │
│  │  • Incident Ingestion                                   │ │
│  │  • Base64 Image / Audio Upload                           │ │
│  │  • Human-in-the-Loop Endpoints                           │ │
│  └───────────────┬────────────────────────────────────────┘ │
└──────────────────┼───────────────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Agentic Orchestration Layer                        │
│                    (LangGraph State Machine)                              │
│                                                                           │
│  ┌────────────┐ → ┌──────────────┐ → ┌──────────────┐                    │
│  │  Memory    │   │ Vision Agent │   │ Speech Agent │                    │
│  │ Retrieval │   │ (Azure CV)   │   │ (Azure STT)  │                    │
│  └────────────┘   └──────────────┘   └──────────────┘                    │
│                                   → ┌──────────────┐                    │
│                                     │ Video Agent  │                    │
│                                     └──────┬───────┘                    │
│                                            ▼                            │
│                                  ┌──────────────────┐                  │
│                                  │ Fusion Agent     │                  │
│                                  │ (Multimodal)    │                  │
│                                  └──────┬──────────┘                  │
│                                         ▼                               │
│                                  ┌──────────────────┐                  │
│                                  │ Risk Assessment  │                  │
│                                  │ (Policy + AI)   │                  │
│                                  └──────┬──────────┘                  │
│                                         │                               │
│              ┌──────────────────────────┴──────────────────────────┐   │
│              ▼                                                     ▼   │
│     ┌──────────────────┐                               ┌──────────────────┐
│     │ Human Review     │                               │ Planning Agent   │
│     │ (HITL Gate)      │                               │ (LLM + SOPs)     │
│     └──────┬───────────┘                               └──────┬───────────┘
│            │ (blocks execution)                                │
│            └──────────────┬───────────────────────────────────┘
│                           ▼
│                  ┌──────────────────┐
│                  │ Response LLM     │
│                  │ (Action Builder)│
│                  └──────┬──────────┘
│                         ▼
│      ┌────────────┬────────────┬────────────┬────────────┐
│      ▼            ▼            ▼            ▼            │
│ ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────────┐   │
│ │ Voice  │→ │ Email  │→ │  Call  │→ │ Escalation   │   │
│ │ Agent  │  │ Agent  │  │ Agent  │  │ Agent        │   │
│ └────────┘  └────────┘  └────────┘  └──────┬───────┘   │
│                                            ▼           │
│                                ┌──────────────────┐   │
│                                │ Monitoring Agent │   │
│                                └──────┬───────────┘   │
│                                       ▼               │
│        ┌──────────────┐ → ┌──────────────┐ → ┌──────────────┐
│        │ Explainability│   │ Self-Reflect │   │ Learning     │
│        │ Agent         │   │ Agent        │   │ Agent        │
│        └──────────────┘   └──────────────┘   └──────────────┘
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                   │                          │
                   ▼                          ▼
┌──────────────────────────────┐   ┌──────────────────────────────────┐
│        RAG Engine             │   │        Azure AI Services          │
│  • SOPs & Store Policies     │   │  • Azure OpenAI (LLMs)             │
│  • Incident History          │   │  • Azure Vision                    │
│  • Vector Store (ChromaDB)   │   │  • Azure Speech-to-Text            │
└──────────────────────────────┘   └──────────────────────────────────┘
```

### Agent Nodes

1. **Memory Retrieval**: Retrieves similar past incidents from RAG vector store
2. **Fusion**: Combines vision, audio, and video signals into unified incident understanding
3. **Video Analysis**: Processes video streams for object detection, activity recognition, and anomaly detection
4. **Risk Assessment**: Evaluates severity (1-5) and risk score (0-1), determines if human review needed
4. **Human Review**: Handles human-in-the-loop decisions when required
5. **Planning**: Generates step-by-step response plan using RAG-retrieved SOPs
6. **Response LLM**: Generates execution actions (voice, email, call, emergency)
7. **Voice Execution**: Azure Speech Synthesis for in-store announcements
8. **Email Execution**: SendGrid API for email notifications
9. **Call Execution**: Twilio API for voice calls to managers
10. **Escalation**: Triggers emergency services for high-severity incidents
11. **Monitoring**: Tracks incident resolution status
12. **Self-Reflection**: Analyzes response effectiveness and identifies improvements
13. **Explainability**: Generates policy-based explanations for decisions
14. **Learning**: Updates long-term memory with incident outcomes

## 📋 Prerequisites

- Python 3.9+
- Azure OpenAI account with API key
- Twilio account (for voice calls)
- SendGrid account (for emails)
- Azure Cognitive Services (for vision and speech)

## 🚀 Installation

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Clone the Repository

```bash
git clone <repository-url>
cd IC-Hackathon
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=alerts@yourdomain.com

# Store Contact Information (Optional)
STORE_1_EMAIL=manager@store1.com
STORE_1_PHONE=+1234567890
DEFAULT_STORE_EMAIL=manager@store.com
DEFAULT_STORE_PHONE=+1234567890

# RAG Policy Documents Path (Optional)
RAG_POLICY_DOCS=rag/policies.json
```

### 4. Configure Azure OpenAI

Edit `app/rag/config.py` with your Azure OpenAI credentials:

```python
AZURE_OPENAI_ENDPOINT = "https://your-resource.openai.azure.com/"
AZURE_OPENAI_KEY = "your_key"
AZURE_OPENAI_API_VERSION = "2024-02-15-preview"
EMBEDDING_MODEL = "text-embedding-3-large"
```

### 5. Set Up RAG Policies (Optional)

Create `rag/policies.json` with your policy documents:

```json
[
  {
    "text": "If customer aggression occurs near checkout, severity = 4...",
    "metadata": {"policy": "RetailSafety_v3", "timestamp": 1234567890}
  },
  {
    "text": "Emergency escalation required if risk_score > 0.8",
    "metadata": {"policy": "EscalationMatrix", "timestamp": 1234567890}
  }
]
```

## 🎮 Usage

## 🚀 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
Most endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Starting the API Server

```bash
cd app
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### System Endpoints

#### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok"
}
```

#### 2. System Info
```http
GET /info
```
**Response:**
```json
{
  "available_endpoints": [
    "/auth/login",
    "/auth/register",
    "/incident",
    "/human/{incident_id}",
    "/health",
    "/info"
  ],
  "description": "Retail Autonomous Incident System API with MongoDB and Authentication."
}
```

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
```
**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "securepassword123",
  "store_id": "store_123"
}
```

#### 2. Login
```http
POST /auth/login
```
**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "securepassword123"
}
```
**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

### Incident Management Endpoints

#### 1. Create Incident
```http
POST /incident
```
**Request Body:**
```json
{
  "store_id": "store_1",
  "store_state": {
    "location": "downtown",
    "staff_count": 5
  },
  "signals": {
    "sensor_id": "cam_01",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "vision_observation": "base64_encoded_image",
  "audio_observation": "base64_encoded_audio",
  "video_observation": "base64_encoded_video"
}
```
**Response:**
```json
{
  "incident_id": "uuid-here"
}
```

#### 2. Submit Human Decision
```http
POST /human/{incident_id}
```
**Request Body:**
```json
{
  "decision": "acknowledge|escalate|dismiss"
}
```
**Response:**
```json
{
  "status": "resumed"
}
```

#### 3. List Incidents
```http
GET /incidents
```
**Response:**
```json
{
  "incidents": [
    {
      "incident_id": "uuid-here",
      "store_id": "store_1",
      "incident_type": "security",
      "severity": 3,
      "risk_score": 0.75,
      "resolved": false,
      "requires_human": true,
      "escalation_required": false
    }
  ]
}
```

#### 4. Get Incident Details
```http
GET /incident/{incident_id}
```
**Response:**
```json
{
  "incident_id": "uuid-here",
  "store_id": "store_1",
  "resolved": false,
  "severity": 3,
  "risk_score": 0.75,
  "incident_type": "security",
  "plan": "Response plan details...",
  "execution_results": "Execution results...",
  "explanation": "Incident explanation...",
  "reflection": "System reflection on the incident...",
  "state": {
    "incident_id": "uuid-here",
    "store_id": "store_1",
    "vision_observation": {
      "description": "Processed image data..."
    },
    "audio_observation": {
      "transcript": "Processed audio transcript..."
    },
    "incident_type": "security",
    "severity": 3,
    "risk_score": 0.75,
    "requires_human": true,
    "escalation_required": false
  }
}
```

#### 5. Generate Incident Report
```http
POST /incident/{incident_id}/summarize-report
```
**Response:**
```json
{
  "summary": "Detailed incident report in markdown format...",
  "recommendations": ["Action item 1", "Action item 2"],
  "severity": "High",
  "risk_level": "Elevated"
}
```

#### 6. Generate Response Plan
```http
POST /incident/{incident_id}/summarize-plan
```
**Response:**
```json
{
  "executive_summary": "Brief summary of the response plan...",
  "action_items": ["Step 1", "Step 2"],
  "timeline": "Estimated resolution time..."
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "detail": "Error message describing the issue"
}
```

#### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

#### 403 Forbidden
```json
{
  "detail": "Access denied: Incident store does not match user store"
}
```

#### 404 Not Found
```json
{
  "detail": "Incident not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Error message describing the internal error"
}
```

## 📱 Frontend Features

### Dashboard
- Real-time incident monitoring
- Video feed integration
- Alert notifications
- Status overview

### Incident Management
- Create and track incidents
- Attach media (images, videos, audio)
- Assign to team members
- Add notes and updates

### Per-Store Policy Management** 
- Store-specific policy documents
- Real-time policy updates
- Version control for policies

### Real-time Chat** 💬
- Store-wide group chats
- Direct messaging between stores
- Online/offline status
- Typing indicators
- Message history

### Video Analysis
- Live video feed monitoring
- Object detection overlay
- Activity recognition
- Suspicious activity alerts

### Reporting
- Generate incident reports
- Export data (CSV, PDF)
- Performance metrics
- Audit logs

### Using the Streamlit Interface

```bash
streamlit run app/streamlit_interface.py
```

Access the UI at `http://localhost:8501` to upload images/audio and test incidents.

### API Endpoints

#### 1. Create Incident

```bash
POST /incident
Content-Type: application/json

{
  "store_id": "store_1",
  "store_state": {"location": "downtown", "staff_count": 5},
  "signals": {"sensor_id": "cam_01", "timestamp": "2024-01-01T12:00:00Z"},
  "vision_observation": "<base64_image_data>",
  "audio_observation": "<base64_audio_data>"
}
```

**Response:**
```json
{
  "incident_id": "uuid-here"
}
```

#### 2. Human Decision

```bash
POST /human/{incident_id}
Content-Type: application/json

{
  "decision": "force_escalation"
}
```

#### 3. Health Check

```bash
GET /health
```

#### 4. System Info

```bash
GET /info
```

## 🔄 Workflow Example

1. **Incident Detection**: System receives vision/audio observations
2. **Memory Retrieval**: Queries RAG for similar past incidents
3. **Signal Fusion**: Combines multimodal inputs into unified understanding
4. **Risk Assessment**: Assigns severity (1-5) and risk score (0-1)
5. **Human Review** (if required): Waits for human decision
6. **Planning**: Generates response plan using RAG-retrieved SOPs
7. **Action Generation**: LLM creates execution actions (voice, email, call)
8. **Execution**: 
   - Voice announcement via Azure Speech
   - Email via SendGrid
   - Phone call via Twilio
9. **Escalation**: Triggers emergency services if severity ≥ 4
10. **Monitoring**: Tracks resolution status
11. **Self-Reflection**: Analyzes response effectiveness
12. **Learning**: Updates long-term memory with outcomes

## 🧠 RAG System

The RAG (Retrieval-Augmented Generation) system provides:

- **Policy Retrieval**: Searches through safety policies and SOPs
- **Historical Context**: Retrieves similar past incidents and outcomes
- **Memory Decay**: Older incidents have lower relevance scores
- **Severity Boosting**: High-severity incidents rank higher in search

### RAG Components

- **Vector Store**: FAISS-based similarity search
- **Embeddings**: Azure OpenAI text-embedding-3-large
- **Memory Decay**: Exponential decay based on age and severity
- **Query Interface**: Context-aware retrieval with top-k results

## 📞 Communication Channels

### Email (SendGrid)

- **Configuration**: Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` in `.env`
- **Store-Specific**: Automatically selects recipient based on `store_id`
- **Customizable**: LLM can override recipient in `execution_actions`

### Voice Calls (Twilio)

- **Configuration**: Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **TwiML**: Generates TwiML for text-to-speech calls
- **Voice**: Uses Twilio's Alice voice (English)

### Voice Announcements (Azure Speech)

- **Configuration**: Azure Cognitive Services Speech SDK
- **In-Store**: Real-time text-to-speech for store announcements



### Integration Testing

```bash
# Test full workflow
curl -X POST http://localhost:8000/incident \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": "store_1",
    "store_state": {},
    "signals": {},
    "vision_observation": null,
    "audio_observation": null
  }'
```

### Streamlit Testing

Launch the Streamlit interface and upload test images/audio files.

## 📁 Project Structure

```bash
IC-Hackathon/
├── app/                      # Backend application
│   ├── agents/               # Agent implementations
│   │   ├── call.py           # Call handling agent
│   │   ├── email.py          # Email notification agent
│   │   ├── escalation.py     # Escalation management
│   │   ├── explainability.py # Explanation generation
│   │   ├── fusion.py         # Multi-modal fusion
│   │   ├── human.py          # Human-in-the-loop handling
│   │   ├── learning.py       # Learning from incidents
│   │   ├── memory_decay.py   # Memory decay logic
│   │   ├── memory_retrieval.py # Memory retrieval
│   │   ├── monitoring.py     # System monitoring
│   │   ├── planning.py       # Response planning
│   │   ├── response_llm.py   # LLM-based response generation
│   │   ├── risk.py           # Risk assessment
│   │   ├── self_reflection.py # System self-reflection
│   │   ├── speech.py         # Speech processing
│   │   ├── video.py          # Video analysis agent
│   │   ├── vision.py         # Computer vision processing
│   │   └── voice.py          # Voice response handling
│   ├── config/               # Configuration files
│   ├── rag/                  # RAG implementation
│   ├── services/             # External service integrations
│   │   ├── azure_speech.py   # Azure Speech Service
│   │   ├── azure_video_indexer.py # Azure Video Indexer
│   │   ├── azure_vision.py   # Azure Computer Vision
│   │   ├── gemini_service.py # Google Gemini integration
│   │   └── report_summarization_prompt.py # Report generation
│   ├── api.py                # Main FastAPI application
│   ├── auth.py               # Authentication logic
│   ├── auth_router.py        # Authentication routes
│   ├── database.py           # Database configuration
│   ├── graph.py              # LangGraph state machine
│   ├── models.py             # Database models
│   ├── schemas.py            # Pydantic schemas
│   ├── state.py              # State management
│   └── streamlit_interface.py # Streamlit UI
│
├── frontend/                 # React frontend application
│   ├── public/               # Static files
│   └── src/                  # Source code
│       ├── components/       # Reusable UI components
│       ├── pages/            # Page components
│       ├── services/         # API service layer
│       ├── store/            # State management
│       └── App.tsx           # Main application component
│
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── AZURE_SERVICES_SETUP.md  # Azure services setup guide
├── README.md                # This file
├── REPORT_SUMMARIZATION_DESIGN.md # Report design doc
├── requirements.txt         # Python dependencies
├── TESTING_GUIDE.md        # Testing documentation
└── TWILIO_SETUP.md         # Twilio setup guide
```

## 🔧 Configuration

### Environment Variables

All sensitive configuration should be in `.env`:

- **Azure OpenAI**: Endpoint, API key, version
- **Twilio**: Account SID, auth token, phone number
- **SendGrid**: API key, from email
- **Store Contacts**: Per-store email/phone mappings

### RAG Policy Documents

Policies can be loaded from:
1. `rag/policies.json` (if `RAG_POLICY_DOCS` env var points to it)
2. Default hardcoded policies (fallback)

## 🚢 Deployment

### Production Considerations

1. **Database**: Replace in-memory `INCIDENTS` dict with persistent storage (PostgreSQL, Redis)
2. **Async Processing**: Use Celery or similar for long-running graph executions
3. **Monitoring**: Add logging, metrics (Prometheus), and tracing
4. **Security**: Implement authentication, rate limiting, input validation
5. **Scaling**: Use container orchestration (Kubernetes, Docker Compose)


```

## 🐛 Troubleshooting

### Common Issues

1. **LLM Not Responding**: Check Azure OpenAI credentials in `rag/config.py`
2. **Email Not Sending**: Verify SendGrid API key and sender verification
3. **Calls Not Working**: Check Twilio credentials and phone number format (+country code)
4. **RAG Not Finding Policies**: Ensure `rag/policies.json` exists or default policies are loaded
5. **Import Errors**: Ensure all dependencies are installed: `pip install -r requirements.txt`



