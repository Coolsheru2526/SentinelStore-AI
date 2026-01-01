# app/rag/vectorstore.py

import chromadb
import os
from typing import List, Dict, Any, Optional

class VectorStore:
    def __init__(self):
        # Use absolute path to app/chroma_db
        chroma_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "chroma_db")
        chroma_path = os.path.abspath(chroma_path)
        self.client = chromadb.PersistentClient(path=chroma_path)
        self.collections: Dict[str, Any] = {}  # Store collection references
        self.base_path = chroma_path

    def _get_collection_name(self, store_id: str) -> str:
        """Generate a consistent collection name for a store"""
        return f"store_{store_id}_policies"

    def get_collection(self, store_id: str):
        """Get or create a collection for a specific store"""
        collection_name = self._get_collection_name(store_id)
        if store_id not in self.collections:
            self.collections[store_id] = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"store_id": store_id}
            )
        return self.collections[store_id]

    def add(self, store_id: str, embedding: list, document: str, metadata: dict):
        """Add a document to a store-specific collection"""
        collection = self.get_collection(store_id)
        doc_id = metadata.get("id", str(hash(document)))
        collection.add(
            embeddings=[embedding],
            documents=[document],
            metadatas=[{**metadata, "store_id": store_id}],
            ids=[doc_id]
        )

    def search(self, store_id: str, embedding: list, k: int) -> List[Dict[str, Any]]:
        """Search within a store's collection"""
        try:
            collection = self.get_collection(store_id)
            results = collection.query(
                query_embeddings=[embedding],
                n_results=k,
                where={"store_id": store_id}  # Ensure we only get results for this store
            )
            return [
                {
                    "text": doc,
                    "metadata": meta
                }
                for doc, meta in zip(results["documents"][0], results["metadatas"][0])
            ]
        except Exception as e:
            # If collection doesn't exist or is empty, return empty results
            return []

    def delete_store_policies(self, store_id: str) -> bool:
        """Delete all policies for a specific store"""
        try:
            collection_name = self._get_collection_name(store_id)
            self.client.delete_collection(collection_name)
            if store_id in self.collections:
                del self.collections[store_id]
            return True
        except Exception as e:
            return False