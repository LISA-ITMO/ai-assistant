from fastapi import HTTPException
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from app.services.rag.chunking import ChunkingService


class RetrievalService:
    @staticmethod
    def get_embedding_model():
        return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    @staticmethod
    def retrieve_relevant_chunks(query: str, top_k: int, provider: str) -> list[str]:
        try:
            vector_store = Chroma(
                collection_name=ChunkingService.COLLECTION_NAME,
                embedding_function=RetrievalService.get_embedding_model(),
                persist_directory=ChunkingService.VECTOR_DB_DIR
            )

            results = vector_store.similarity_search(query, k=top_k)

            chunks = [doc.page_content for doc in results]

            return chunks
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error retrieving chunks: {str(e)}")
