def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200):
    """
    Corta el texto en trozos pequeños para que la IA no colapse
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap

    return chunks