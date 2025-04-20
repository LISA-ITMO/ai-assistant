from typing import List, Dict, Tuple
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import os
import pickle
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class VectorStoreService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.vector_store_path = "data/vector_store"
        self.chunk_size = 512
        self.vector_dim = 384  # Размерность векторов для all-MiniLM-L6-v2

        if not os.path.exists(self.vector_store_path):
            os.makedirs(self.vector_store_path)

        self.indexes = {}
        self.chunks_store = {}

    def _chunk_text(self, text: str) -> List[str]:
        words = text.split()
        chunks = []
        current_chunk = []
        current_length = 0

        for word in words:
            if current_length + len(word) > self.chunk_size:
                chunks.append(" ".join(current_chunk))
                current_chunk = [word]
                current_length = len(word)
            else:
                current_chunk.append(word)
                current_length += len(word) + 1

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    def _get_or_create_index(self, research_id: str) -> Tuple[faiss.Index, List[Dict]]:
        if research_id in self.indexes:
            return self.indexes[research_id], self.chunks_store[research_id]

        index_path = f"{self.vector_store_path}/{research_id}/index.faiss"
        chunks_path = f"{self.vector_store_path}/{research_id}/chunks.pkl"

        if os.path.exists(index_path) and os.path.exists(chunks_path):
            index = faiss.read_index(index_path)
            with open(chunks_path, 'rb') as f:
                chunks = pickle.load(f)
        else:
            index = faiss.IndexFlatL2(self.vector_dim)
            chunks = []

            os.makedirs(
                f"{self.vector_store_path}/{research_id}", exist_ok=True)

        self.indexes[research_id] = index
        self.chunks_store[research_id] = chunks
        return index, chunks

    async def vectorize_document(self, research_id: str, file_id: str, content: str):
        index, chunks = self._get_or_create_index(research_id)

        text_chunks = self._chunk_text(content)
        vectors = self.model.encode(text_chunks)

        index.add(vectors)

        start_idx = len(chunks)
        for i, chunk in enumerate(text_chunks):
            chunks.append({
                "text": chunk,
                "file_id": file_id,
                "chunk_id": start_idx + i
            })

        self._save_index(research_id)

    async def search_similar_chunks(self, research_id: str, query: str, top_k: int = 3) -> List[str]:
        try:
            index, chunks = self._get_or_create_index(research_id)

            query_vector = self.model.encode([query])[0].reshape(1, -1)

            D, I = index.search(query_vector, top_k)

            return [chunks[i]["text"] for i in I[0] if i < len(chunks)]
        except Exception as e:
            logger.error(f"Ошибка при поиске чанков: {str(e)}")
            return []

    def _save_index(self, research_id: str):
        try:
            index = self.indexes[research_id]
            chunks = self.chunks_store[research_id]

            index_path = f"{self.vector_store_path}/{research_id}/index.faiss"
            chunks_path = f"{self.vector_store_path}/{research_id}/chunks.pkl"

            faiss.write_index(index, index_path)

            with open(chunks_path, 'wb') as f:
                pickle.dump(chunks, f)

            logger.info(
                f"Индекс и чанки сохранены для research_id: {research_id}")
        except Exception as e:
            logger.error(f"Ошибка при сохранении индекса: {str(e)}")
            raise
