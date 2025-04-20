import os
import numpy as np
from typing import List, Dict, Any, Union
import logging
from sentence_transformers import SentenceTransformer
import torch

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class DocumentVectorizer:

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        logger.info(f"Инициализация векторизатора с моделью {model_name}")

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Используется устройство: {self.device}")

        try:
            self.model = SentenceTransformer(model_name, device=self.device)
            self.vector_size = self.model.get_sentence_embedding_dimension()
            logger.info(
                f"Модель {model_name} успешно загружена. Размерность векторов: {self.vector_size}")
        except Exception as e:
            logger.error(f"Ошибка при загрузке модели {model_name}: {str(e)}")
            raise

    def vectorize_chunk(self, chunk_text: str) -> np.ndarray:
        try:
            vector = self.model.encode(chunk_text, show_progress_bar=False)
            return vector
        except Exception as e:
            logger.error(f"Ошибка при векторизации чанка: {str(e)}")
            raise

    def vectorize_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        texts = [chunk["text"] for chunk in chunks]

        try:
            logger.info(f"Векторизация {len(texts)} чанков...")
            vectors = self.model.encode(
                texts, show_progress_bar=True, batch_size=32)

            for i, chunk in enumerate(chunks):
                chunk["vector"] = vectors[i]

            logger.info(f"Векторизация завершена успешно")
            return chunks
        except Exception as e:
            logger.error(f"Ошибка при векторизации чанков: {str(e)}")
            raise

    def compute_similarity(self, query_vector: np.ndarray, chunk_vector: np.ndarray) -> float:
        return np.dot(query_vector, chunk_vector) / (np.linalg.norm(query_vector) * np.linalg.norm(chunk_vector))
