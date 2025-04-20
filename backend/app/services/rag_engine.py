import os
import numpy as np
from typing import List, Dict, Any, Optional
import logging
from .vector_service import DocumentVectorizer
from .vector_store import VectorStore

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class RAGEngine:

    def __init__(self, vectorizer: DocumentVectorizer, vector_store: VectorStore):
        self.vectorizer = vectorizer
        self.vector_store = vector_store
        logger.info("Инициализирован RAG-движок")

    def retrieve_relevant_chunks(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        query_vector = self.vectorizer.vectorize_chunk(query)
        relevant_chunks = self.vector_store.search(query_vector, top_k=top_k)

        logger.info(
            f"Найдено {len(relevant_chunks)} релевантных чанков для запроса")
        return relevant_chunks

    def generate_context(self, query: str, top_k: int = 5, max_tokens: int = 4000) -> str:

        relevant_chunks = self.retrieve_relevant_chunks(query, top_k=top_k)
        relevant_chunks.sort(key=lambda x: x["score"], reverse=True)

        context = ""
        total_length = 0
        used_chunks = 0

        for chunk in relevant_chunks:
            chunk_text = chunk["text"]
            chunk_length = len(chunk_text.split())

            estimated_tokens = int(chunk_length * 1.3)

            if total_length + estimated_tokens > max_tokens:
                break

            source_info = f"Источник: {chunk['metadata']['title']}"
            if 'author' in chunk['metadata'] and chunk['metadata']['author']:
                source_info += f", Автор: {chunk['metadata']['author']}"

            context += f"\n\n--- {source_info} ---\n{chunk_text}"
            total_length += estimated_tokens
            used_chunks += 1

        logger.info(
            f"Сгенерирован контекст из {used_chunks} чанков, примерно {total_length} токенов")
        return context.strip()
