import os
import re
from fastapi import HTTPException
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

from app.services.file_manager.file_service import FileService
from app.utils.pdf_parser import PDFParser
from app.core.config import settings


class ChunkingService:
    VECTOR_DB_DIR = "chroma_db"
    COLLECTION_NAME = "documents"
    SUPPORTED_EXTENSIONS = {".txt", ".pdf"}
    MIN_CHUNK_LENGTH = 20

    @staticmethod
    def clean_text(text: str) -> str:
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    @staticmethod
    def get_text_splitter():
        return RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len
        )

    @staticmethod
    def get_embedding_model():
        return HuggingFaceEmbeddings(model_name=settings.VECTORIZE_MODEL)

    @staticmethod
    def process_file(filename: str) -> int:
        file_path = os.path.join(FileService.UPLOAD_DIR, filename)

        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404, detail="File not found on disk")

        _, ext = os.path.splitext(filename)
        if ext.lower() not in ChunkingService.SUPPORTED_EXTENSIONS:
            raise HTTPException(
                status_code=400, detail=f"Unsupported file extension: {ext}")

        try:
            if ext.lower() == ".pdf":
                content = PDFParser.extract_text_from_pdf(file_path)
            else:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            content = ChunkingService.clean_text(content)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error reading file: {str(e)}")

        text_splitter = ChunkingService.get_text_splitter()
        chunks = text_splitter.split_text(content)

        chunks = [chunk for chunk in chunks if len(
            chunk.strip()) >= ChunkingService.MIN_CHUNK_LENGTH]
        if not chunks:
            raise HTTPException(
                status_code=400, detail="No valid chunks extracted from file")

        embedding_model = ChunkingService.get_embedding_model()
        vector_store = Chroma(
            collection_name=ChunkingService.COLLECTION_NAME,
            embedding_function=embedding_model,
            persist_directory=ChunkingService.VECTOR_DB_DIR
        )

        chunk_count = 0
        for i, chunk in enumerate(chunks):
            vector_id = f"{filename}_{i}"
            vector_store.add_texts(
                texts=[chunk],
                metadatas=[{"filename": filename, "chunk_index": i}],
                ids=[vector_id]
            )
            chunk_count += 1

        vector_store.persist()

        return chunk_count
