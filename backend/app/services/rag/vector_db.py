from fastapi import HTTPException
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings


class VectorDBService:
    VECTOR_DB_DIR = "chroma_db"
    COLLECTION_NAME = "documents"

    @staticmethod
    def get_vector_store():
        embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2")
        return Chroma(
            collection_name=VectorDBService.COLLECTION_NAME,
            embedding_function=embedding_model,
            persist_directory=VectorDBService.VECTOR_DB_DIR
        )

    @staticmethod
    def clear_collection():
        try:
            vector_store = VectorDBService.get_vector_store()
            vector_store.delete_collection()
            vector_store = VectorDBService.get_vector_store()
            vector_store.persist()
            return {"message": "Vector database collection cleared successfully"}
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error clearing vector database: {str(e)}")

    @staticmethod
    def delete_chunks_by_filename(filename: str):
        try:
            vector_store = VectorDBService.get_vector_store()
            collection = vector_store._collection
            all_docs = collection.get()
            ids_to_delete = [
                id for id, metadata in zip(all_docs["ids"], all_docs["metadatas"])
                if metadata.get("filename") == filename
            ]
            if not ids_to_delete:
                return {"message": f"No chunks found for filename: {filename}"}
            collection.delete(ids=ids_to_delete)
            vector_store.persist()
            return {"message": f"Deleted {len(ids_to_delete)} chunks for filename: {filename}"}
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error deleting chunks for {filename}: {str(e)}")
