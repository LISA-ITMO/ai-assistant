from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import os
import uuid
import logging
import json
from datetime import datetime
import time

from ..services.document_processor import DocumentProcessor
from ..services.vector_service import DocumentVectorizer
from ..services.vector_store import VectorStore
from ..services.rag_engine import RAGEngine
from ..core.config import settings

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter()

document_processor = DocumentProcessor(chunk_size=1000, chunk_overlap=200)
vectorizer = DocumentVectorizer(model_name="all-MiniLM-L6-v2")
vector_store = VectorStore(vector_dim=vectorizer.vector_size)
rag_engine = RAGEngine(vectorizer=vectorizer, vector_store=vector_store)

research_documents = {}


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    research_id: str = Form(...),
):
    try:
        research_dir = os.path.join(settings.UPLOAD_DIR, research_id)
        os.makedirs(research_dir, exist_ok=True)

        file_id = f"file_{int(time.time())}"
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{file_id}{file_extension}"

        file_path = os.path.join(research_dir, unique_filename)

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        background_tasks.add_task(
            process_document_task,
            file_path=file_path,
            original_filename=file.filename,
            research_id=research_id
        )

        return JSONResponse(
            content={
                "status": "success",
                "message": "Документ успешно загружен и поставлен в очередь на обработку",
                "file_id": file_id,
                "original_filename": file.filename
            },
            status_code=202
        )

    except Exception as e:
        logger.error(f"Ошибка при загрузке документа: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Ошибка при загрузке документа: {str(e)}")


async def process_document_task(file_path: str, original_filename: str, research_id: str):
    try:
        logger.info(
            f"Начало обработки документа {original_filename} для исследования {research_id}")

        document_data = document_processor.process_file(file_path)

        chunks = document_processor.create_chunks(
            document_data["text"], document_data["metadata"])

        vectorized_chunks = vectorizer.vectorize_chunks(chunks)

        vector_store.add_chunks(vectorized_chunks, research_id)

        os.makedirs(settings.VECTOR_STORE_DIR, exist_ok=True)
        index_path, chunks_path = vector_store.save(settings.VECTOR_STORE_DIR)

        if research_id not in research_documents:
            research_documents[research_id] = []

        document_info = {
            "file_id": os.path.basename(file_path),
            "original_filename": original_filename,
            "upload_time": datetime.now().isoformat(),
            "chunks_count": len(chunks),
            "metadata": document_data["metadata"],
            "index_path": index_path,
            "chunks_path": chunks_path
        }

        research_documents[research_id].append(document_info)

        logger.info(
            f"Документ {original_filename} успешно обработан и векторизован")

    except Exception as e:
        logger.error(
            f"Ошибка при обработке документа {original_filename}: {str(e)}")


@router.get("/documents/{research_id}")
async def get_research_documents(research_id: str):
    if research_id not in research_documents:
        return {"documents": []}

    return {"documents": research_documents[research_id]}


@router.post("/query")
async def query_documents(query_data: Dict[str, Any]):
    try:
        query = query_data.get("query")
        research_id = query_data.get("research_id")
        top_k = query_data.get("top_k", 5)

        if not query or not research_id:
            raise HTTPException(
                status_code=400, detail="Необходимо указать запрос и идентификатор исследования")

        relevant_chunks = rag_engine.retrieve_relevant_chunks(
            query, top_k=top_k)

        context = rag_engine.generate_context(query, top_k=top_k)

        return {
            "relevant_chunks": relevant_chunks,
            "context": context
        }

    except Exception as e:
        logger.error(f"Ошибка при выполнении запроса: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Ошибка при выполнении запроса: {str(e)}")
