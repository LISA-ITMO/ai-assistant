from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from app.schemas.chunk import ChunkingRequest, ChunkingResponse
from app.schemas.retrieval import RetrievalRequest, RetrievalResponse
from app.services.rag.chunking import ChunkingService
from app.services.rag.retrieval import RetrievalService
from app.services.rag.vector_db import VectorDBService

router = APIRouter()
chunking_service = ChunkingService()
retrieval_service = RetrievalService()


@router.post("/chunk", response_model=ChunkingResponse)
def chunk_file(request: ChunkingRequest):
    try:
        chunk_count = ChunkingService.process_file(request.filename)
        return ChunkingResponse(filename=request.filename, chunk_count=chunk_count)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error chunking file: {str(e)}")


@router.post("/retrieve", response_model=RetrievalResponse)
def retrieve_chunks(request: RetrievalRequest):
    try:
        chunks = RetrievalService.retrieve_relevant_chunks(
            request.query, request.top_k, request.provider
        )
        return RetrievalResponse(chunks=chunks, provider=request.provider)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving chunks: {str(e)}")


@router.delete("/clear")
def clear_vector_db():
    return VectorDBService.clear_collection()
