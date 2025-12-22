# rag/embeddings.py

import os
from openai import AzureOpenAI
from dotenv import load_dotenv
load_dotenv()

EMBEDDING_DEPLOYMENT_NAME = "text-embedding-3-large"

AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_VERSION = "2023-05-15"

if not AZURE_OPENAI_KEY or not AZURE_OPENAI_ENDPOINT:
    raise RuntimeError("Azure OpenAI environment variables not set")

client = AzureOpenAI(
    api_key=AZURE_OPENAI_KEY,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_version=AZURE_OPENAI_API_VERSION,
)

def embed_text(text: str) -> list[float]:
    """
    Generate embedding vector using Azure OpenAI embedding deployment.
    """
    response = client.embeddings.create(
        model=EMBEDDING_DEPLOYMENT_NAME, 
        input=text
    )
    return response.data[0].embedding
