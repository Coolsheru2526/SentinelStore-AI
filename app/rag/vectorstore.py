# rag/vectorstore.py

import faiss
import numpy as np
from rag.config import *

class VectorStore:
    def __init__(self):
        self.index = faiss.IndexFlatL2(VECTOR_DIM)
        self.documents = []

    def add(self, embedding: list, document: str, metadata: dict):
        self.index.add(np.array([embedding]).astype("float32"))
        self.documents.append({
            "text": document,
            "metadata": metadata
        })

    def search(self, embedding: list, k: int):
        distances, indices = self.index.search(
            np.array([embedding]).astype("float32"), k
        )
        return [self.documents[i] for i in indices[0]]
