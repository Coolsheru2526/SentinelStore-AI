# Retail Autonomous Incident Response System

An intelligent, multi-agent AI system built with LangGraph that autonomously detects, assesses, and responds to retail incidents using multimodal inputs (vision + audio), RAG-enhanced policy retrieval, and automated communication channels.

## 🎯 Overview

This system combines **Azure OpenAI**, **LangGraph**, **RAG (Retrieval-Augmented Generation)**, and **Twilio/SendGrid** to create an autonomous incident management pipeline for retail environments. It processes visual and audio observations, assesses risk, plans responses, executes communications (voice, email, calls), and learns from outcomes through self-reflection.

### Key Capabilities

- **Multimodal Incident Detection**: Processes both visual (images) and audio inputs
- **Intelligent Risk Assessment**: AI-powered severity scoring and human-in-the-loop decisions
- **Automated Response Planning**: Generates context-aware response plans using RAG-retrieved policies
- **Multi-Channel Communication**: Sends voice announcements, emails, and phone calls via Twilio/SendGrid
- **Self-Learning**: Reflects on outcomes and updates long-term memory
- **Explainability**: Provides reasoning and policy justification for decisions

## 🏗️ Architecture

### System Components

```
┌─────────────────┐
│   FastAPI API   │  ← REST API for incident submission
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              LangGraph State Machine                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Memory   │→ │  Fusion  │→ │   Risk   │            │
│  │Retrieval │  │  Agent   │  │  Agent   │            │
│  └──────────┘  └──────────┘  └────┬─────┘            │
│                                    │                   │
│                    ┌───────────────┴───────────────┐   │
│                    ▼                               ▼   │
│              ┌──────────┐                    ┌────────┐│
│              │  Human   │                    │ Planning││
│              │  Review  │                    │  Agent  ││
│              └────┬──────┘                    └────┬───┘│
│                   │                               │     │
│                   └───────────┬──────────────────┘     │
│                               ▼                        │
│                    ┌──────────────────┐               │
│                    │  Response LLM    │               │
│                    │  (Generate Actions)│              │
│                    └─────────┬─────────┘               │
│                              │                         │
│        ┌─────────────────────┼─────────────────────┐ │
│        ▼                     ▼                     ▼  │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐│
│  │  Voice   │   →    │  Email   │   →    │   Call   ││
│  │  Agent   │        │  Agent   │        │  Agent   ││
│  └──────────┘        └──────────┘        └──────────┘│
│        │                     │                     │  │
│        └─────────────────────┼─────────────────────┘  │
│                              ▼                        │
│                    ┌──────────────────┐               │
│                    │   Escalation    │               │
│                    │   Monitoring    │               │
│                    │  Self-Reflect   │               │
│                    │    Learning     │               │
│                    └──────────────────┘               │
└─────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌──────────────┐    ┌──────────────────┐
│   RAG Engine │    │  Azure OpenAI    │
│  (Policies)  │    │  (LLM + Vision)  │
└──────────────┘    └──────────────────┘
```

### Agent Nodes

1. **Memory Retrieval**: Retrieves similar past incidents from RAG vector store
2. **Fusion**: Combines vision and audio signals into unified incident understanding
3. **Risk Assessment**: Evaluates severity (1-5) and risk score (0-1), determines if human review needed
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

### 1. Clone the Repository

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

### Starting the API Server

```bash
cd app
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

- **API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

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

## 🧪 Testing

### Unit Testing

```bash
# Test individual agents
python -m pytest tests/
```

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

```
IC-Hackathon/
├── app/
│   ├── agents/              # Agent node implementations
│   │   ├── call.py          # Twilio call execution
│   │   ├── email.py         # SendGrid email execution
│   │   ├── fusion.py        # Multimodal fusion
│   │   ├── learning.py      # Long-term memory updates
│   │   ├── memory_retrieval.py  # RAG queries
│   │   ├── planning.py      # Response planning
│   │   ├── response_llm.py  # Action generation
│   │   ├── risk.py          # Risk assessment
│   │   ├── self_reflection.py  # Post-incident analysis
│   │   └── ...
│   ├── config/              # Configuration modules
│   │   └── comm_config.py   # Twilio/SendGrid config
│   ├── rag/                 # RAG system
│   │   ├── config.py        # Azure OpenAI config
│   │   ├── embeddings.py    # Embedding generation
│   │   ├── loader.py        # Document loading
│   │   ├── rag_engine.py    # RAG query engine
│   │   ├── retriever.py     # Vector search
│   │   └── vectorstore.py   # FAISS vector store
│   ├── api.py               # FastAPI application
│   ├── graph.py             # LangGraph state machine
│   ├── schemas.py           # Pydantic models
│   ├── state.py             # State type definitions
│   └── streamlit_interface.py  # Testing UI
├── requirements.txt
├── README.md
└── TWILIO_SETUP.md          # Twilio configuration guide
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

### Docker Deployment

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ ./app/
CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🐛 Troubleshooting

### Common Issues

1. **LLM Not Responding**: Check Azure OpenAI credentials in `rag/config.py`
2. **Email Not Sending**: Verify SendGrid API key and sender verification
3. **Calls Not Working**: Check Twilio credentials and phone number format (+country code)
4. **RAG Not Finding Policies**: Ensure `rag/policies.json` exists or default policies are loaded
5. **Import Errors**: Ensure all dependencies are installed: `pip install -r requirements.txt`

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📚 Additional Documentation

- [Twilio Setup Guide](TWILIO_SETUP.md) - Detailed Twilio/SendGrid configuration
- [API Documentation](http://localhost:8000/docs) - Interactive API docs (when server running)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- **LangGraph**: Multi-agent orchestration framework
- **Azure OpenAI**: LLM and embeddings
- **Twilio**: Voice and SMS communication
- **SendGrid**: Email delivery
- **FastAPI**: Modern Python web framework

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for autonomous retail incident management**

