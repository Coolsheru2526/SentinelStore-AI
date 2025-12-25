# rag/vectorstore.py

import chromadb
from chromadb.config import Settings
import os

class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=os.path.join(os.getcwd(), "chroma_db"))
        self.collection = self.client.get_or_create_collection(name="incidents_and_policies")

    def add(self, embedding: list, document: str, metadata: dict):
        doc_id = metadata.get("id", str(hash(document)))
        self.collection.add(
            embeddings=[embedding],
            documents=[document],
            metadatas=[metadata],
            ids=[doc_id]
        )

    def search(self, embedding: list, k: int):
        results = self.collection.query(
            query_embeddings=[embedding],
            n_results=k
        )
        return [
            {
                "text": doc,
                "metadata": meta
            }
            for doc, meta in zip(results["documents"][0], results["metadatas"][0])
        ]
