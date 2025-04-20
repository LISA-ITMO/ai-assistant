import os
import json
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import logging
import faiss
import pickle
from datetime import datetime

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class VectorStore:

    def __init__(self, vector_dim: int, index_path: Optional[str] = None):
        self.vector_dim = vector_dim
        self.chunks = []
        self.research_id = None

        if index_path and os.path.exists(index_path):
            logger.info(f"Загрузка существующего индекса из {index_path}")
            self.index = faiss.read_index(index_path)
            self._load_chunks(os.path.join(
                os.path.dirname(index_path), "chunks.pkl"))
        else:
            logger.info(f"Создание нового индекса с размерностью {vector_dim}")
            self.index = faiss.IndexFlatIP(vector_dim)

    def add_chunks(self, chunks: List[Dict[str, Any]], research_id: str) -> None:
        self.research_id = research_id

        vectors = np.array([chunk["vector"]
                           for chunk in chunks], dtype=np.float32)

        faiss.normalize_L2(vectors)

        self.index.add(vectors)

        start_idx = len(self.chunks)
        for i, chunk in enumerate(chunks):
            chunk_copy = chunk.copy()
            chunk_copy["vector"] = chunk["vector"].tolist()
            chunk_copy["index_id"] = start_idx + i
            self.chunks.append(chunk_copy)

        logger.info(
            f"Добавлено {len(chunks)} чанков в индекс. Всего чанков: {len(self.chunks)}")

    def search(self, query_vector: np.ndarray, top_k: int = 5) -> List[Dict[str, Any]]:
        if len(self.chunks) == 0:
            logger.warning("Хранилище пусто, нет данных для поиска")
            return []

        query_vector = query_vector.reshape(1, -1).astype(np.float32)
        faiss.normalize_L2(query_vector)

        scores, indices = self.index.search(
            query_vector, min(top_k, len(self.chunks)))

        results = []
        for i, idx in enumerate(indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue

            chunk = self.chunks[idx].copy()
            chunk["score"] = float(scores[0][i])
            if "vector" in chunk:
                del chunk["vector"]
            results.append(chunk)

        return results

    def save(self, directory: str) -> Tuple[str, str]:
        os.makedirs(directory, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        index_path = os.path.join(
            directory, f"index_{self.research_id}_{timestamp}.faiss")
        chunks_path = os.path.join(
            directory, f"chunks_{self.research_id}_{timestamp}.pkl")

        faiss.write_index(self.index, index_path)

        with open(chunks_path, 'wb') as f:
            pickle.dump(self.chunks, f)

        logger.info(f"Индекс сохранен в {index_path}")
        logger.info(f"Чанки сохранены в {chunks_path}")

        return index_path, chunks_path

    def _load_chunks(self, chunks_path: str) -> None:
        if os.path.exists(chunks_path):
            with open(chunks_path, 'rb') as f:
                self.chunks = pickle.load(f)
            logger.info(
                f"Загружено {len(self.chunks)} чанков из {chunks_path}")
