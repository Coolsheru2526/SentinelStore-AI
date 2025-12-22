from rag.chunker import chunk_policy_text
from rag.vectorstore import VectorStore
from rag.embeddings import embed_text

def load_store_policy(file_path: str):
    policy_text = open(file_path, "r", encoding="utf-8").read()

    chunks = chunk_policy_text(policy_text)

    docs = [
        {
            "text": chunk,
            "metadata": {
                "source": "SOP_MASTER_RET_AI_4.1",
                "chunk_id": i,
                "policy_type": "store_operations",
                "version": "4.1"
            }
        }
        for i, chunk in enumerate(chunks)
    ]

    store = VectorStore()
    for d in docs:
        emb = embed_text(d["text"])
        store.add(emb, d["text"], d["metadata"])
    return store