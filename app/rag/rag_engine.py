# rag/rag_engine.py

import logging
from rag.embeddings import embed_text
from rag.retriever import retrieve
from config.logging_config import get_logger

logger = get_logger(__name__)

class RAGEngine:
    def __init__(self, vector_store):
        self.vectorstore = vector_store
        logger.info("RAGEngine initialized")

    def query(self, query_text, top_k=5):
        logger.debug(f"[RAG] Query: {query_text[:100]}... (top_k={top_k})")
        
        raw_results = retrieve(query_text, self.vectorstore, k=20)
        logger.debug(f"[RAG] Found {len(raw_results)} raw results")
        
        context = "\n".join(d.get("text") for d in raw_results)
        logger.info(f"[RAG] Query completed - Returning {len(raw_results)} documents, {len(context)} chars of context")

        return {
            "context": context
        }
    
    def add_document(self, document: str, metadata: dict):
        """
        Add a document to the underlying vector store.
        """
        try:
            # Filter metadata to remove None values and ensure ChromaDB-compatible types
            filtered_metadata = {k: v for k, v in metadata.items() if v is not None}
            embedding = embed_text(document)
            self.vectorstore.add(
                embedding=embedding,
                document=document,
                metadata=filtered_metadata
            )
            logger.info("[RAG] Document added to vector store")
        except Exception as e:
            logger.error(f"[RAG] Failed to add document: {e}", exc_info=True)

    