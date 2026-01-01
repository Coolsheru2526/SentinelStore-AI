# app/rag/retriever.py

from rag.embeddings import embed_text
from rag.config import TOP_K
from typing import Dict, Any

def retrieve(store_id: str, query: str, store, k: int = TOP_K) -> Dict[str, Any]:
    """Retrieve documents from a store-specific collection"""
    query_emb = embed_text(query)
    return store.search(store_id, query_emb, k)