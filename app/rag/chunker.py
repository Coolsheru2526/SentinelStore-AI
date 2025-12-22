from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_policy_text(text: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,          # ideal for policies
        chunk_overlap=150,       # preserves thresholds/context
        separators=[
            "\n\n",              # section breaks
            "\n",                # paragraphs
            ".",                 # sentences
            " ",                 # fallback
            ""
        ]
    )

    return splitter.split_text(text)
