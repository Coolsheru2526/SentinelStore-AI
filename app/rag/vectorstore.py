# rag/vectorstore.py

import chromadb
from chromadb.config import Settings
import os

class VectorStore:
    def __init__(self):
        # Use absolute path to app/chroma_db
        chroma_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "chroma_db")
        chroma_path = os.path.abspath(chroma_path)
        self.client = chromadb.PersistentClient(path=chroma_path)
        try:
            self.collection = self.client.get_or_create_collection(name="incidents_and_policies")
        except Exception as e:
            # If there's an issue, try to delete and recreate
            import shutil
            if os.path.exists(chroma_path):
                shutil.rmtree(chroma_path)
            os.makedirs(chroma_path, exist_ok=True)
            self.client = chromadb.PersistentClient(path=chroma_path)
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
        try:
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
        except Exception as e:
            # If collection doesn't exist, recreate it
            self.collection = self.client.get_or_create_collection(name="incidents_and_policies")
            # But since it's empty, return empty results
            return []
