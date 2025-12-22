# rag/retriever.py

from rag.embeddings import embed_text
from rag.config import TOP_K

def retrieve(query: str, store, k: int = TOP_K):
    query_emb = embed_text(query)
    return store.search(query_emb, k)
