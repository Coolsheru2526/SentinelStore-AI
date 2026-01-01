# app/rag/rag_engine.py

import logging
from rag.chunker import chunk_policy_text
from rag.embeddings import embed_text
from rag.retriever import retrieve
from config.logging_config import get_logger
from typing import Optional, Dict, Any

logger = get_logger(__name__)

class RAGEngine:
    def __init__(self, vector_store):
        self.vectorstore = vector_store
        logger.info("RAGEngine initialized")

    def query(self, store_id: str, query_text: str, top_k: int = 5) -> Dict[str, Any]:
        """Query the RAG system for a specific store"""
        logger.debug(f"[RAG][Store:{store_id}] Query: {query_text[:100]}... (top_k={top_k})")
        
        # Get store-specific results
        raw_results = self.vectorstore.search(store_id, embed_text(query_text), k=top_k)
        logger.debug(f"[RAG][Store:{store_id}] Found {len(raw_results)} results")
        
        context = "\n".join(d.get("text", "") for d in raw_results)
        logger.info(f"[RAG][Store:{store_id}] Query completed - {len(raw_results)} documents")
        
        return {
            "context": context,
            "sources": [r.get("metadata", {}) for r in raw_results]
        }
    
    def add_document(self, store_id: str, policy_text: str, metadata: Optional[Dict] = None):
        """
        Add a document to a store's collection
        """
        if metadata is None:
            metadata = {}
            
        try:
            
            chunks = chunk_policy_text(policy_text)


            for i, chunk in enumerate(chunks):
                self.vectorstore.add(
                    store_id=store_id,
                    embedding=embed_text(chunk),
                    document=chunk,
                    metadata={**metadata, "chunk_index": i}
                )
            logger.info(f"[RAG][Store:{store_id}] Document added to vector store with {len(chunks)} chunks")
            return True
        except Exception as e:
            logger.error(f"[RAG][Store:{store_id}] Failed to add document: {e}", exc_info=True)
            return False

    def delete_store_policies(self, store_id: str) -> bool:
        """Delete all policies for a specific store"""
        try:
            return self.vectorstore.delete_store_policies(store_id)
        except Exception as e:
            logger.error(f"[RAG][Store:{store_id}] Failed to delete policies: {e}")
            return False